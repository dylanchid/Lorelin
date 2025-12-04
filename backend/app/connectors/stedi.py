import httpx
from typing import Dict, Any, List, Optional
from datetime import datetime
from ..models.domain import (
    VoBRequest, VoBResult, ChannelSource, CoverageStatus, Financials, 
    Copay, NetworkType, PlanDates, Deductible, OOPMax, MoneyAmount, 
    Coinsurance, RawRefs
)
from ..core.config import settings
from ..core.stc_mapper import STCMapper

class StediConnector:
    def __init__(self):
        self.api_key = settings.STEDI_API_KEY
        self.base_url = settings.STEDI_BASE_URL
        self.mapper = STCMapper()

    async def check_eligibility(self, request: VoBRequest) -> VoBResult:
        if not self.api_key:
            # For demo/testing without API key, we might want to return a mock or raise
            # But based on instructions, we should raise if key is missing for real connector
            if settings.DEMO_MODE:
                return self._get_mock_response(request)
            raise ValueError("STEDI_API_KEY is not set")

        url = self.base_url
        headers = {
            "Authorization": f"Key {self.api_key}",
            "Content-Type": "application/json"
        }
        
        # Determine STCs
        stcs = ["30"] # Default
        if request.services:
            # Use the first service to determine primary STC
            # In a real app we might query for all, but 270 usually takes one or a few
            stcs = self.mapper.get_stc_with_fallbacks(request.services[0].cpt)

        # Map VoBRequest to Stedi JSON (v3)
        payload = {
            "tradingPartnerServiceId": request.payer.payer_code_hint or "PAYER_ID", 
            "provider": {
                "npi": request.provider.npi,
                "organizationName": "Lorelin Provider" 
            },
            "subscriber": {
                "memberId": request.patient.member_id,
                "firstName": request.patient.first_name,
                "lastName": request.patient.last_name,
                "dateOfBirth": request.patient.dob.strftime("%Y-%m-%d")
            },
            "encounter": {
                "dateOfService": request.visit_date.strftime("%Y-%m-%d") if request.visit_date else datetime.now().strftime("%Y-%m-%d"),
                "serviceTypeCodes": stcs
            }
        }
        
        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(url, json=payload, headers=headers, timeout=30.0)
                response.raise_for_status()
                data = response.json()
                return self._parse_stedi_response(data, request)
            except httpx.HTTPStatusError as e:
                print(f"Stedi API Error: {e.response.text}")
                raise e
            except Exception as e:
                print(f"Connection Error: {str(e)}")
                raise e

    def _parse_stedi_response(self, data: Dict[str, Any], request: VoBRequest) -> VoBResult:
        # Extract basic info
        plan_status_list = data.get("planStatus", [])
        status_code = "UNKNOWN"
        plan_name = None
        
        if plan_status_list:
            # Usually the first one is the primary status
            primary_status = plan_status_list[0]
            status_raw = primary_status.get("statusCode", "")
            # Map 1=Active, 6=Inactive, etc. (Simplified mapping)
            if status_raw == "1":
                status_code = CoverageStatus.ACTIVE
            elif status_raw == "6":
                status_code = CoverageStatus.INACTIVE
            else:
                status_code = CoverageStatus.UNKNOWN
            
            plan_name = primary_status.get("planDetails")

        # Parse financials
        financials = Financials()
        benefits = data.get("benefitsInformation", [])
        
        for benefit in benefits:
            # We look for generic coverage (30) or specific STCs
            # For MVP, we aggregate everything found
            amounts = benefit.get("amounts", {})
            
            # Deductible
            deductible_data = amounts.get("deductible", {})
            if deductible_data:
                if not financials.deductible:
                    financials.deductible = Deductible()
                
                in_network = deductible_data.get("inNetwork")
                if in_network:
                    financials.deductible.individual = MoneyAmount(
                        total=float(in_network.get("total", 0)),
                        remaining=float(in_network.get("remaining", 0))
                    )
            
            # OOP Max
            oop_data = amounts.get("outOfPocket", {})
            if oop_data:
                if not financials.oop_max:
                    financials.oop_max = OOPMax()
                
                in_network = oop_data.get("inNetwork")
                if in_network:
                    financials.oop_max.individual = MoneyAmount(
                        total=float(in_network.get("total", 0)),
                        remaining=float(in_network.get("remaining", 0))
                    )
            
            # Copay
            copay_data = amounts.get("copay", {})
            if copay_data:
                in_network = copay_data.get("inNetwork")
                if in_network:
                    financials.copays.append(Copay(
                        service_type=benefit.get("name", "General"),
                        amount=float(in_network.get("amount", 0)),
                        network=NetworkType.IN_NETWORK
                    ))

            # Coinsurance
            coins_data = amounts.get("coinsurance", {})
            if coins_data:
                in_network = coins_data.get("inNetwork")
                if in_network:
                    financials.coinsurance.append(Coinsurance(
                        service_type=benefit.get("name", "General"),
                        rate_pct=float(in_network.get("percentage", 0)),
                        network=NetworkType.IN_NETWORK
                    ))

        return VoBResult(
            request_id="req_" + datetime.now().strftime("%Y%m%d%H%M%S"), # Generate a request ID
            coverage_status=status_code,
            plan_name=plan_name,
            financials=financials,
            source=ChannelSource.STEDI,
            timestamp=datetime.now(),
            raw_refs=RawRefs(
                stedi_transaction_id=data.get("controlNumber") or data.get("id")
            )
        )

    def _get_mock_response(self, request: VoBRequest) -> VoBResult:
        # Simple mock for demo mode
        return VoBResult(
            request_id="mock_req_123",
            coverage_status=CoverageStatus.ACTIVE,
            plan_name="Mock Plan A",
            source=ChannelSource.MOCK,
            timestamp=datetime.now(),
            financials=Financials(
                deductible=Deductible(individual=MoneyAmount(total=1000, remaining=500)),
                copays=[Copay(service_type="Office Visit", amount=25)]
            )
        )
