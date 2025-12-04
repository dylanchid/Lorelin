import pytest
import asyncio
from datetime import date
from app.connectors.rpa import RPAConnector
from app.models.domain import VoBRequest, Patient, Payer, ChannelSource

@pytest.mark.asyncio
async def test_rpa_integration_mock_portal():
    """
    Integration test for RPA Connector with local mock portal.
    Assumes mock portal is running at http://localhost:5001.
    """
    # Setup
    connector = RPAConnector(base_url="http://localhost:5001")
    
    patient = Patient(
        first_name="John",
        last_name="Doe",
        dob=date(1980, 1, 1),
        member_id="MEMBER123"
    )
    
    request = VoBRequest(
        organization_id="org_123",
        patient=patient,
        payer_id="payer_123",
        services=["office_visit"]
    )
    
    # Execute
    try:
        result = await connector.check_eligibility(request)
        
        # Assertions
        assert result is not None
        assert result.source == ChannelSource.RPA
        assert result.coverage_status is not None
        assert result.financials is not None
        assert result.financials.deductible.individual.total > 0
        assert result.financials.copays[0].amount > 0
        
        print(f"Successfully verified eligibility for {patient.first_name} {patient.last_name}")
        print(f"Plan: {result.plan_name}")
        print(f"Status: {result.coverage_status}")
        
    except Exception as e:
        pytest.fail(f"RPA Integration test failed: {e}")
