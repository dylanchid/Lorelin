import unittest
from unittest.mock import patch, MagicMock
from app.connectors.stedi import StediConnector
from app.models.domain import VoBRequest, PatientInfo, PayerInfo, ProviderInfo, ServiceInfo, CoverageStatus
from datetime import date

class TestStediConnector(unittest.IsolatedAsyncioTestCase):
    async def test_check_eligibility_success(self):
        connector = StediConnector()
        connector.api_key = "test-key"
        
        request = VoBRequest(
            practice_id="test",
            patient=PatientInfo(first_name="John", last_name="Doe", dob=date(1980, 1, 1), member_id="123"),
            payer=PayerInfo(name="Aetna", payer_code_hint="PAYER123"),
            provider=ProviderInfo(npi="1234567890"),
            services=[ServiceInfo(cpt="99213")]
        )
        
        # Mock response matching Stedi v3 schema
        mock_response_data = {
            "controlNumber": "12345",
            "planStatus": [
                {
                    "statusCode": "1",
                    "planDetails": "Aetna PPO"
                }
            ],
            "benefitsInformation": [
                {
                    "name": "Health Benefit Plan Coverage",
                    "amounts": {
                        "deductible": {
                            "inNetwork": {
                                "total": 1000.0,
                                "remaining": 500.0
                            }
                        }
                    }
                }
            ]
        }
        
        with patch("httpx.AsyncClient.post") as mock_post:
            mock_response = MagicMock()
            mock_response.status_code = 200
            mock_response.json.return_value = mock_response_data
            mock_post.return_value = mock_response
            
            result = await connector.check_eligibility(request)
            
            self.assertEqual(result.coverage_status, CoverageStatus.ACTIVE)
            self.assertEqual(result.plan_name, "Aetna PPO")
            self.assertEqual(result.raw_refs.stedi_transaction_id, "12345")
            self.assertIsNotNone(result.financials.deductible)
            self.assertEqual(result.financials.deductible.individual.total, 1000.0)

    async def test_check_eligibility_inactive(self):
        connector = StediConnector()
        connector.api_key = "test-key"
        
        request = VoBRequest(
            practice_id="test",
            patient=PatientInfo(first_name="Jane", last_name="Doe", dob=date(1980, 1, 1), member_id="456"),
            payer=PayerInfo(name="Aetna"),
            provider=ProviderInfo(npi="1234567890"),
            services=[ServiceInfo(cpt="99213")]
        )
        
        mock_response_data = {
            "controlNumber": "67890",
            "planStatus": [
                {
                    "statusCode": "6"
                }
            ]
        }
        
        with patch("httpx.AsyncClient.post") as mock_post:
            mock_response = MagicMock()
            mock_response.status_code = 200
            mock_response.json.return_value = mock_response_data
            mock_post.return_value = mock_response
            
            result = await connector.check_eligibility(request)
            
            self.assertEqual(result.coverage_status, CoverageStatus.INACTIVE)
