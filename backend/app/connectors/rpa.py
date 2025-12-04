from typing import Optional
from datetime import datetime
from playwright.async_api import async_playwright
try:
    from browserbase import Browserbase
except ImportError:  # pragma: no cover
    class Browserbase:  # Minimal stub for testing
        def __init__(self, api_key: str, project_id: str):
            self.api_key = api_key
            self.project_id = project_id

        class sessions:
            @staticmethod
            def create(type: str):
                raise NotImplementedError("Browserbase sessions not available in test environment")
from ..models.domain import VoBRequest, VoBResult, ChannelSource, CoverageStatus, Financials, Copay, NetworkType, Deductible, MoneyAmount
from ..core.config import settings
from .base import BaseConnector
from .rpa_strategies.factory import PortalFactory

class RPAConnector(BaseConnector):
    def __init__(self, base_url: Optional[str] = None):
        self.base_url = base_url or settings.RPA_PORTAL_URL
        self.browserbase = None
        if settings.BROWSERBASE_API_KEY and settings.BROWSERBASE_PROJECT_ID:
            self.browserbase = Browserbase(
                api_key=settings.BROWSERBASE_API_KEY
            )

    async def check_eligibility(self, request: VoBRequest) -> VoBResult:
        async with async_playwright() as p:
            browser = None
            context = None
            try:
                # Force local execution if target is localhost (Browserbase cannot access localhost)
                is_localhost = "localhost" in self.base_url or "127.0.0.1" in self.base_url
                
                if self.browserbase and not is_localhost:
                    # Create a session on Browserbase
                    session = self.browserbase.sessions.create(type="BROWSER")
                    # Connect to the remote session
                    browser = await p.chromium.connect_over_cdp(session.connect_url)
                else:
                    # Fallback to local browser
                    browser = await p.chromium.launch(headless=True)
                
                
                # Use the browser...
                if self.browserbase and not is_localhost:
                     context = browser.contexts[0]
                else:
                     context = await browser.new_context()
                
                page = await context.new_page()
                
                # Determine Strategy
                strategy = PortalFactory.get_strategy(request.payer_id, self.base_url)
                
                # Get Credentials (if needed by the strategy, though strategy usually handles its own login flow, 
                # we might want to pass them in or let the strategy fetch them. 
                # For now, the strategy instance is created. 
                # If the strategy needs creds, it should probably get them in its login method or init.
                # Let's assume the strategy uses the factory's static method or we pass them here if we change the interface.
                # The current interface is login(page). 
                # Let's update the strategy to handle credential retrieval internally or pass it here.
                # For simplicity, we'll keep the interface as is and let the strategy implementation call PortalFactory.get_credentials if needed,
                # OR we can pass credentials to login. 
                # Let's stick to the plan: "Credential Management: A utility to fetch credentials dynamically."
                # The strategy implementation (like MockPortalStrategy) should use this utility.
                
                try:
                    # 1. Login
                    await strategy.login(page)
                    
                    # 2. Search Eligibility
                    await strategy.search_eligibility(page, request)
                    
                    # 3. Extract Results
                    raw_html = await strategy.extract_results(page)

                    # Clean the HTML
                    html_content = self._clean_html(raw_html)
                    
                    print(f"Extracted HTML size: {len(html_content)} chars")
                    
                    # 4. Use LLMParser
                    from ..core.llm_parser import LLMParser
                    parser = LLMParser()
                    request_id = f"rpa-{datetime.now().timestamp()}"
                    
                    result = await parser.parse_html(html_content, request_id)
                    return result

                except Exception as e:
                    print(f"RPA Navigation/Interaction Error: {e}")
                    raise e
                
            except Exception as e:
                print(f"RPA Connection Error: {e}")
                raise e
            finally:
                if context:
                    await context.close()
                if browser:
                    await browser.close()

    def _clean_html(self, html_content: str) -> str:
        """
        Removes unnecessary tags (script, style, svg, etc.) to reduce token usage.
        """
        import re
        
        # Remove script and style tags and their content
        clean_html = re.sub(r'<(script|style|svg|nav|footer|header)[^>]*>.*?</\1>', '', html_content, flags=re.DOTALL | re.IGNORECASE)
        
        # Remove comments
        clean_html = re.sub(r'<!--.*?-->', '', clean_html, flags=re.DOTALL)
        
        # Remove empty lines and excessive whitespace
        clean_html = re.sub(r'\s+', ' ', clean_html).strip()
        
        return clean_html

