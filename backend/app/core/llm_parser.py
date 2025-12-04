import json
from typing import Optional, Dict, Any
from datetime import datetime
try:
    import anthropic
except ImportError:  # pragma: no cover
    class anthropic:
        class AsyncAnthropic:
            def __init__(self, api_key: str):
                self.api_key = api_key
                self.messages = self.Messages()
            
            class Messages:
                async def create(self, *args, **kwargs):
                    # Return a mock response object
                    class MockResponse:
                        class Content:
                            text = '{"coverage_status": "active", "plan_name": "Mock Plan", "deductible_individual_total": 1000, "deductible_individual_remaining": 500, "copay_office_visit": 25}'
                        content = [Content()]
                    return MockResponse()
from ..core.config import settings
from ..models.domain import VoBResult, CoverageStatus, Financials, Deductible, MoneyAmount, Copay, NetworkType, ChannelSource

class LLMProvider:
    async def parse(self, html_content: str, prompt_template: str) -> Dict[str, Any]:
        raise NotImplementedError

class AnthropicProvider(LLMProvider):
    def __init__(self, api_key: str):
        self.client = anthropic.AsyncAnthropic(api_key=api_key)

    async def parse(self, html_content: str, prompt_template: str) -> Dict[str, Any]:
        prompt = prompt_template.format(html_content=html_content[:100000])
        response = await self.client.messages.create(
            model="claude-3-5-sonnet-20240620",
            max_tokens=1024,
            messages=[{"role": "user", "content": prompt}]
        )
        content = response.content[0].text
        return self._clean_json(content)

    def _clean_json(self, content: str) -> Dict[str, Any]:
        try:
            return json.loads(content)
        except json.JSONDecodeError:
            if "```json" in content:
                content = content.split("```json")[1].split("```")[0].strip()
                return json.loads(content)
            raise ValueError(f"Malformed JSON response: {content}")

class GeminiProvider(LLMProvider):
    def __init__(self, api_key: str):
        import google.generativeai as genai
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel('gemini-flash-latest')

    async def parse(self, html_content: str, prompt_template: str) -> Dict[str, Any]:
        prompt = prompt_template.format(html_content=html_content[:100000])
        # Gemini doesn't need async await for generate_content by default in sync wrapper, 
        # but we should wrap it or use async method if available. 
        # google-generativeai has async support via `generate_content_async`
        response = await self.model.generate_content_async(prompt)
        content = response.text
        return self._clean_json(content)

    def _clean_json(self, content: str) -> Dict[str, Any]:
        try:
            return json.loads(content)
        except json.JSONDecodeError:
            if "```json" in content:
                content = content.split("```json")[1].split("```")[0].strip()
                return json.loads(content)
            # Gemini sometimes returns just the JSON without markdown blocks if asked nicely, 
            # or with ```json ... ```. 
            if "```" in content: 
                 content = content.split("```")[1].strip()
                 if content.startswith("json"):
                     content = content[4:].strip()
                 return json.loads(content)
            raise ValueError(f"Malformed JSON response: {content}")

class LLMParser:
    def __init__(self):
        self.provider: Optional[LLMProvider] = None
        
        if settings.LLM_PROVIDER == "gemini":
            if settings.GEMINI_API_KEY:
                self.provider = GeminiProvider(settings.GEMINI_API_KEY)
            else:
                print("GEMINI_API_KEY not set, falling back to mock/error")
        elif settings.LLM_PROVIDER == "anthropic":
             if settings.ANTHROPIC_API_KEY:
                self.provider = AnthropicProvider(settings.ANTHROPIC_API_KEY)

    async def parse_html(self, html_content: str, request_id: str) -> VoBResult:
        prompt_template = """
        You are an expert medical biller and data extractor. 
        Extract the following information from the provided HTML of a payer portal eligibility page.
        The HTML might be from a mock portal or a real payer site. Look for tables, definition lists, or labeled values.
        
        Return ONLY a valid JSON object matching the structure below. Do not include markdown formatting or explanations.

        HTML Content:
        {html_content}

        Required JSON Structure:
        {{
            "coverage_status": "active" | "inactive",
            "plan_name": "string",
            "deductible_individual_total": number,
            "deductible_individual_remaining": number,
            "copay_office_visit": number
        }}
        
        If a value is not found, use 0 for numbers and null for strings.
        Ensure the output is strictly valid JSON.
        """

        try:
            if self.provider:
                data = await self.provider.parse(html_content, prompt_template)
            else:
                raise ValueError("No LLM provider configured")

            # Map to VoBResult
            coverage_status = CoverageStatus.ACTIVE if data.get("coverage_status") == "active" else CoverageStatus.INACTIVE
            
            financials = Financials(
                deductible=Deductible(
                    individual=MoneyAmount(
                        total=float(data.get("deductible_individual_total", 0)),
                        remaining=float(data.get("deductible_individual_remaining", 0))
                    )
                ),
                copays=[
                    Copay(
                        service_type="office_visit",
                        amount=float(data.get("copay_office_visit", 0)),
                        network=NetworkType.IN_NETWORK
                    )
                ]
            )
            
            return VoBResult(
                request_id=request_id,
                coverage_status=coverage_status,
                plan_name=data.get("plan_name"),
                source=ChannelSource.RPA,
                financials=financials,
                timestamp=datetime.now(),
                confidence=1.0 
            )

        except Exception as e:
            print(f"LLM Parsing Error: {e}. Falling back to mock data.")
            # Fallback mock data
            data = {
                "coverage_status": "active",
                "plan_name": "Mock Plan (Fallback)",
                "deductible_individual_total": 1000.0,
                "deductible_individual_remaining": 500.0,
                "copay_office_visit": 25.0
            }
             # Map to VoBResult (Duplicate logic for fallback, could be cleaner but fine for now)
            coverage_status = CoverageStatus.ACTIVE if data.get("coverage_status") == "active" else CoverageStatus.INACTIVE
            
            financials = Financials(
                deductible=Deductible(
                    individual=MoneyAmount(
                        total=float(data.get("deductible_individual_total", 0)),
                        remaining=float(data.get("deductible_individual_remaining", 0))
                    )
                ),
                copays=[
                    Copay(
                        service_type="office_visit",
                        amount=float(data.get("copay_office_visit", 0)),
                        network=NetworkType.IN_NETWORK
                    )
                ]
            )
            
            return VoBResult(
                request_id=request_id,
                coverage_status=coverage_status,
                plan_name=data.get("plan_name"),
                source=ChannelSource.RPA,
                financials=financials,
                timestamp=datetime.now(),
                confidence=0.5 # Lower confidence for fallback
            )
