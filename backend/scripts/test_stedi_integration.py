import asyncio
import os
import sys
from datetime import date

# Add backend to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.connectors.stedi import StediConnector
from app.models.domain import VoBRequest, PatientInfo, PayerInfo, ProviderInfo, ServiceInfo

async def main():
    # Check if API Key is set
    if not os.getenv("STEDI_API_KEY"):
        print("WARNING: STEDI_API_KEY is not set. Please set it in .env or environment variables.")
    
    connector = StediConnector()
    
    # Create a sample request
    # Using '00001' as a common sandbox payer ID, but this might need adjustment based on actual Stedi Sandbox setup.
    request = VoBRequest(
        practice_id="test-practice",
        patient=PatientInfo(
            first_name="Jane",
            last_name="Doe",
            dob=date(2004, 4, 4),
            member_id="AETNA12345"
        ),
        payer=PayerInfo(
            name="Aetna",
            payer_code_hint="60054" 
        ),
        provider=ProviderInfo(
            npi="1999999984"
        ),
        services=[ServiceInfo(cpt="99213")]
    )
    
    print(f"Sending request to Stedi for patient {request.patient.first_name} {request.patient.last_name}...")
    
    try:
        result = await connector.check_eligibility(request)
        print("\n--- VoB Result ---")
        print(f"Status: {result.coverage_status}")
        print(f"Plan: {result.plan_name}")
        print(f"Source: {result.source}")
        print(f"Transaction ID: {result.raw_refs.stedi_transaction_id if result.raw_refs else 'N/A'}")
        print("------------------")
    except Exception as e:
        print(f"\nError: {e}")

if __name__ == "__main__":
    asyncio.run(main())
