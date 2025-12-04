from typing import Optional
from sqlmodel import Session, select
from ..models.domain import VoBRequest, VoBResult, ChannelSource
from ..models.sql import PayerConfig, ChannelPreference
from ..connectors.stedi import StediConnector
from ..connectors.rpa import RPAConnector
from ..connectors.mock import MockConnector
from .config import settings
from .cache import VoBCache

class VoBRouter:
    def __init__(self):
        self.stedi = StediConnector()
        self.rpa = RPAConnector()
        self.mock = MockConnector()
        self.cache = VoBCache()

    async def route_request(self, request: VoBRequest, session: Session) -> VoBResult:
        # Check for demo mode or demo patient
        is_demo_patient = request.patient.last_name.lower() in MockConnector.SCENARIOS
        if settings.DEMO_MODE or is_demo_patient:
            return await self.mock.check_eligibility(request)

        # Check cache
        cached_result = await self.cache.get(request)
        if cached_result:
            return cached_result

        # Look up payer config
        statement = select(PayerConfig).where(PayerConfig.name == request.payer.name)
        payer_config = session.exec(statement).first()
        
        result = None
        if not payer_config:
            # Default behavior if no config found
            if request.payer.name and "RPA" in request.payer.name.upper():
                result = await self.rpa.check_eligibility(request)
            else:
                result = await self.stedi.check_eligibility(request)
        else:
            # Use config logic
            if payer_config.preferred_channel == ChannelPreference.STEDI:
                result = await self.stedi.check_eligibility(request)
            elif payer_config.preferred_channel == ChannelPreference.RPA:
                result = await self.rpa.check_eligibility(request)
            else:
                result = await self.stedi.check_eligibility(request)

        # Cache result
        if result:
            await self.cache.set(request, result)
            
        return result
