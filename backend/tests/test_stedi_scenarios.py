import asyncio
import json
import os
import sys
from datetime import datetime

# Add backend to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.connectors.stedi import StediConnector
from app.models.domain import VoBRequest, PatientInfo, PayerInfo, ProviderInfo, ServiceInfo, CoverageStatus

from unittest.mock import patch, MagicMock

async def run_scenarios():
    # Mock settings to avoid error if key is missing
    with patch("app.connectors.stedi.settings.STEDI_API_KEY", "mock-key"):
        connector = StediConnector()
        
        # Load scenarios
        data_path = os.path.join(os.path.dirname(__file__), "data", "stedi_mock_scenarios.json")
        with open(data_path, "r") as f:
            scenarios = json.load(f)
        
        print(f"Running {len(scenarios)} Stedi mock scenarios...")
        
        for scenario in scenarios:
            print(f"\nTesting: {scenario['name']}")
            req_data = scenario['request']
            
            # Construct VoBRequest
            request = VoBRequest(
                practice_id="test-practice",
                patient=PatientInfo(
                    first_name=req_data['subscriber']['firstName'],
                    last_name=req_data['subscriber']['lastName'],
                    dob=datetime.strptime(req_data['subscriber']['dateOfBirth'], "%Y%m%d").date(),
                    member_id=req_data['subscriber']['memberId']
                ),
                payer=PayerInfo(
                    name="Test Payer",
                    payer_code_hint=req_data['tradingPartnerServiceId']
                ),
                provider=ProviderInfo(
                    npi=req_data['provider']['npi']
                ),
                services=[ServiceInfo(cpt="99213")]
            )
            
            # Mock the HTTP response
            mock_response = MagicMock()
            mock_response.json.return_value = scenario['mock_response']
            mock_response.raise_for_status.return_value = None
            
            with patch("httpx.AsyncClient.post", return_value=mock_response) as mock_post:
                try:
                    result = await connector.check_eligibility(request)
                    print(f"  Result: {result.coverage_status}")
                    print(f"  Financials: {result.financials}")
                    
                    if scenario.get('expected_error'):
                        print("  FAILED: Expected error but got success")
                    else:
                        expected = scenario.get('expected_status')
                        if expected and result.coverage_status.lower() == expected.lower():
                            print("  PASSED")
                        else:
                            print(f"  FAILED: Expected {expected}, got {result.coverage_status}")
                            
                except Exception as e:
                    if scenario.get('expected_error'):
                        print(f"  PASSED (Expected Error): {str(e)}")
                    else:
                        print(f"  FAILED: Unexpected error: {str(e)}")

if __name__ == "__main__":
    asyncio.run(run_scenarios())
