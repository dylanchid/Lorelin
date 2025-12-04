import unittest
from unittest.mock import patch, MagicMock, AsyncMock
from app.connectors.rpa import RPAConnector
from app.models.domain import VoBRequest, PatientInfo, PayerInfo, ProviderInfo, ServiceInfo
from datetime import date

class TestRPAConnector(unittest.IsolatedAsyncioTestCase):
    async def test_check_eligibility_success(self):
        connector = RPAConnector()
        # Mock browserbase to avoid real connection
        connector.browserbase = MagicMock()
        connector.browserbase.sessions.create.return_value = MagicMock(connect_url="ws://test")
        
        request = VoBRequest(
            practice_id="test",
            patient=PatientInfo(first_name="John", last_name="Doe", dob=date(1980, 1, 1), member_id="123"),
            payer=PayerInfo(name="Aetna", payer_code_hint="PAYER123"),
            provider=ProviderInfo(npi="1234567890"),
            services=[ServiceInfo(cpt="99213")]
        )
        
        # Mock playwright
        with patch("app.connectors.rpa.async_playwright") as mock_playwright:
            mock_p = AsyncMock()
            mock_browser = AsyncMock()
            mock_context = AsyncMock()
            mock_page = AsyncMock()
            
            mock_playwright.return_value.__aenter__.return_value = mock_p
            mock_p.chromium.connect_over_cdp.return_value = mock_browser
            mock_browser.contexts = [mock_context]
            mock_context.new_page.return_value = mock_page
            
            # Mock page content for LLM
            mock_page.content.return_value = "<html>...</html>"
            
            # Mock LLMParser
            with patch("app.core.llm_parser.LLMParser") as MockLLMParser:
                mock_parser = MockLLMParser.return_value
                mock_result = MagicMock()
                mock_parser.parse_html = AsyncMock(return_value=mock_result)
                
                result = await connector.check_eligibility(request)
                
                self.assertEqual(result, mock_result)
                mock_page.goto.assert_called()
                mock_page.fill.assert_called()
                mock_parser.parse_html.assert_called()
