import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from datetime import date, datetime
from app.core.cache import VoBCache
from app.models.domain import VoBRequest, VoBResult, PatientInfo, PayerInfo, ProviderInfo, ServiceInfo, CoverageStatus, ChannelSource

@pytest.fixture
def mock_redis():
    with patch("app.core.cache.aioredis.from_url") as mock_from_url:
        mock_client = AsyncMock()
        mock_from_url.return_value = mock_client
        yield mock_client

@pytest.fixture
def cache(mock_redis):
    return VoBCache()

@pytest.fixture
def sample_request():
    return VoBRequest(
        practice_id="test",
        patient=PatientInfo(first_name="John", last_name="Doe", dob=date(1980, 1, 1), member_id="123"),
        payer=PayerInfo(name="Aetna", payer_code_hint="PAYER123"),
        provider=ProviderInfo(npi="1234567890"),
        services=[ServiceInfo(cpt="99213")]
    )

@pytest.fixture
def sample_result():
    return VoBResult(
        request_id="req_123",
        coverage_status=CoverageStatus.ACTIVE,
        plan_name="Test Plan",
        source=ChannelSource.STEDI,
        timestamp=datetime.now()
    )

@pytest.mark.asyncio
async def test_get_cache_hit(cache, mock_redis, sample_request, sample_result):
    # Setup mock to return serialized result
    mock_redis.get.return_value = sample_result.model_dump_json()
    
    result = await cache.get(sample_request)
    
    assert result is not None
    assert result.request_id == sample_result.request_id
    assert result.coverage_status == sample_result.coverage_status
    mock_redis.get.assert_called_once()

@pytest.mark.asyncio
async def test_get_cache_miss(cache, mock_redis, sample_request):
    mock_redis.get.return_value = None
    
    result = await cache.get(sample_request)
    
    assert result is None
    mock_redis.get.assert_called_once()

@pytest.mark.asyncio
async def test_set_cache(cache, mock_redis, sample_request, sample_result):
    await cache.set(sample_request, sample_result)
    
    mock_redis.set.assert_called_once()
    args, kwargs = mock_redis.set.call_args
    assert args[0].startswith("vob:") # Key
    assert "Test Plan" in args[1] # Value (serialized)
    assert kwargs["ex"] == 3600 # TTL

@pytest.mark.asyncio
async def test_key_generation_consistency(cache, sample_request):
    key1 = cache._generate_key(sample_request)
    key2 = cache._generate_key(sample_request)
    assert key1 == key2

@pytest.mark.asyncio
async def test_key_generation_uniqueness(cache, sample_request):
    key1 = cache._generate_key(sample_request)
    
    # Change member ID
    sample_request.patient.member_id = "456"
    key2 = cache._generate_key(sample_request)
    
    assert key1 != key2
