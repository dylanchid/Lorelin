import unittest
from unittest.mock import patch, MagicMock, AsyncMock
from app.core.llm_parser import LLMParser
from app.models.domain import CoverageStatus

class TestLLMParser(unittest.IsolatedAsyncioTestCase):
    async def test_parse_html_success(self):
        with patch("app.core.llm_parser.anthropic.AsyncAnthropic") as MockAnthropic:
            mock_client = MockAnthropic.return_value
            parser = LLMParser()
            parser.client = mock_client # Ensure client is set
            
            mock_response = MagicMock()
            mock_message = MagicMock()
            mock_message.text = '{"coverage_status": "active", "plan_name": "Test Plan", "deductible_individual_total": 1000, "deductible_individual_remaining": 500, "copay_office_visit": 20}'
            mock_response.content = [mock_message]
            
            mock_client.messages.create = AsyncMock(return_value=mock_response)
            
            result = await parser.parse_html("<html>...</html>", "req-123")
            
            self.assertEqual(result.coverage_status, CoverageStatus.ACTIVE)
            self.assertEqual(result.plan_name, "Test Plan")
            self.assertEqual(result.financials.deductible.individual.total, 1000.0)
            self.assertEqual(result.financials.copays[0].amount, 20.0)
