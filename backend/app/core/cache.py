from typing import Optional
import json
from datetime import datetime, timedelta
from redis import asyncio as aioredis
from .config import settings
from ..models.domain import VoBResult, VoBRequest

class VoBCache:
    def __init__(self):
        self.redis_url = settings.REDIS_URL
        self.ttl_seconds = 3600 # 1 hour default
        self.redis = None
        if self.redis_url:
            self.redis = aioredis.from_url(self.redis_url, decode_responses=True)

    async def get(self, request: VoBRequest) -> Optional[VoBResult]:
        if not self.redis:
            return None
            
        key = self._generate_key(request)
        try:
            data = await self.redis.get(key)
            if data:
                return VoBResult.model_validate_json(data)
        except Exception as e:
            print(f"Cache get error: {e}")
        
        return None

    async def set(self, request: VoBRequest, result: VoBResult):
        if not self.redis:
            return

        key = self._generate_key(request)
        try:
            # Serialize to JSON
            data = result.model_dump_json()
            await self.redis.set(key, data, ex=self.ttl_seconds)
        except Exception as e:
            print(f"Cache set error: {e}")

    def _generate_key(self, request: VoBRequest) -> str:
        # Generate a unique key based on request parameters
        # e.g. "vob:{payer_id}:{member_id}:{dob}"
        components = [
            request.payer.payer_code_hint or request.payer.name,
            request.patient.member_id,
            request.patient.dob.strftime("%Y%m%d"),
            request.provider.npi
        ]
        # Include services in key if present (affects eligibility/benefits)
        if request.services:
            cpts = sorted([s.cpt for s in request.services])
            components.append("-".join(cpts))
            
        return f"vob:{':'.join(str(c) for c in components)}"
