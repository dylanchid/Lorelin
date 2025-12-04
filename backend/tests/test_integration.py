import pytest
import asyncio
from datetime import datetime
from app.models.domain import VoBRequest, ChannelSource
from app.connectors.rpa import RPAConnector
from app.core.cache import VoBCache
from app.connectors.stedi import StediConnector
from app.connectors.mock import MockConnector

# Mock data
MOCK_REQUEST = VoBRequest(
    first_name="John",
    last_name="Doe",
    dob=datetime(1980, 1, 1),
    member_id="123456789",
    payer_id="PAYER_A",
    provider_npi="1234567890",
    organization_id="org_123"
)

@pytest.mark.asyncio
async def test_rpa_connector_integration():
    """
    Verifies RPA Connector against local rpa_portal.
    Requires rpa_portal to be running on http://localhost:5001
    """
    connector = RPAConnector(base_url="http://localhost:5001")
    
    try:
        result = await connector.check_eligibility(MOCK_REQUEST)
        
        assert result.source == ChannelSource.RPA
        assert result.plan_name == "PPO Gold"
        assert result.coverage_status == "Active"
        assert result.financials.deductibles[0].remaining == 500.00
        assert result.financials.copays[0].amount == 25.00
        
    except Exception as e:
        pytest.fail(f"RPA Integration failed: {e}. Ensure rpa_portal is running.")

@pytest.mark.asyncio
async def test_cache_integration():
    """
    Verifies Cache functionality.
    Requires Redis to be running.
    """
    cache = VoBCache()
    
    # 1. Set Cache
    mock_result = await MockConnector().check_eligibility(MOCK_REQUEST)
    await cache.set(MOCK_REQUEST, mock_result)
    
    # 2. Get Cache
    cached_result = await cache.get(MOCK_REQUEST)
    
    assert cached_result is not None
    assert cached_result.request_id == mock_result.request_id
    assert cached_result.source == mock_result.source

@pytest.mark.asyncio
async def test_stedi_connector_mock():
    """
    Verifies Stedi Connector logic (mocked).
    """
    # This would ideally use vcrpy or similar to record/replay, 
    # or just test the mapping logic if we can't hit real Stedi API.
    # For now, we'll just instantiate it to ensure no import errors.
    connector = StediConnector()
    assert connector is not None
