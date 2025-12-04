import asyncio
from uuid import uuid4
from datetime import date, datetime, timedelta
from decimal import Decimal
from typing import Optional

from ..models.domain import (
    VoBRequest, VoBResult, CoverageStatus, ChannelSource,
    PlanDates, Financials, Deductible, MoneyAmount, OOPMax, 
    PatientEstimate, AuthInfo, AuthRequirement, NetworkType
)


class MockConnector:
    SCENARIOS = {
        "doe": "active_full_coverage",
        "smith": "active_high_deductible",
        "inactive": "terminated_coverage",
        "pending": "needs_auth",
        "error": "payer_timeout",
    }
    
    async def check_eligibility(self, request: VoBRequest) -> VoBResult:
        scenario = self._detect_scenario(request.patient.last_name)
        await asyncio.sleep(0.5)  # Simulate latency
        return self._generate_response(scenario, request)
    
    def _detect_scenario(self, last_name: str) -> str:
        name_lower = last_name.lower()
        for key, scenario in self.SCENARIOS.items():
            if key in name_lower:
                return scenario
        return "active_full_coverage"
    
    def _generate_response(self, scenario: str, request: VoBRequest) -> VoBResult:
        # Default values
        today = date.today()
        effective_date = date(today.year, 1, 1)
        termination_date = date(today.year, 12, 31)
        
        if scenario == "active_full_coverage":
            return VoBResult(
                request_id=str(uuid4()),
                coverage_status=CoverageStatus.ACTIVE,
                plan_name="Demo PPO Plan",
                plan_type="PPO",
                plan_effective_dates=PlanDates(start=effective_date, end=termination_date),
                financials=Financials(
                    deductible=Deductible(
                        individual=MoneyAmount(total=500.00, remaining=320.00),
                        family=MoneyAmount(total=1500.00, remaining=1000.00)
                    ),
                    oop_max=OOPMax(
                        individual=MoneyAmount(total=3000.00, remaining=1200.00),
                        family=MoneyAmount(total=6000.00, remaining=4000.00)
                    ),
                    copays=[], # Add if needed
                    coinsurance=[]
                ),
                patient_estimate=PatientEstimate(
                    estimated_patient_cost=25.00,
                    estimate_components={"copay": 25.00}
                ),
                auth=AuthInfo(services_requiring_auth=[]),
                source=ChannelSource.MOCK,
                timestamp=datetime.utcnow(),
                confidence=0.99
            )
            
        elif scenario == "active_high_deductible":
             return VoBResult(
                request_id=str(uuid4()),
                coverage_status=CoverageStatus.ACTIVE,
                plan_name="Demo HDHP Plan",
                plan_type="HDHP",
                plan_effective_dates=PlanDates(start=effective_date, end=termination_date),
                financials=Financials(
                    deductible=Deductible(
                        individual=MoneyAmount(total=5000.00, remaining=2500.00),
                        family=MoneyAmount(total=10000.00, remaining=8000.00)
                    ),
                    oop_max=OOPMax(
                        individual=MoneyAmount(total=6000.00, remaining=3500.00),
                        family=MoneyAmount(total=12000.00, remaining=10000.00)
                    )
                ),
                patient_estimate=PatientEstimate(
                    estimated_patient_cost=150.00, # Estimated allowed amount applied to deductible
                    estimate_components={"deductible": 150.00}
                ),
                auth=AuthInfo(services_requiring_auth=[]),
                source=ChannelSource.MOCK,
                timestamp=datetime.utcnow(),
                confidence=0.99
            )

        elif scenario == "terminated_coverage":
            return VoBResult(
                request_id=str(uuid4()),
                coverage_status=CoverageStatus.INACTIVE,
                plan_name="Demo PPO Plan",
                plan_effective_dates=PlanDates(start=date(today.year-1, 1, 1), end=date(today.year-1, 12, 31)),
                source=ChannelSource.MOCK,
                timestamp=datetime.utcnow(),
                confidence=1.0
            )

        elif scenario == "needs_auth":
            return VoBResult(
                request_id=str(uuid4()),
                coverage_status=CoverageStatus.ACTIVE,
                plan_name="Demo HMO Plan",
                plan_type="HMO",
                plan_effective_dates=PlanDates(start=effective_date, end=termination_date),
                financials=Financials(
                    deductible=Deductible(
                        individual=MoneyAmount(total=1000.00, remaining=500.00)
                    )
                ),
                auth=AuthInfo(
                    services_requiring_auth=[
                        AuthRequirement(cpt=request.services[0].cpt if request.services else "UNKNOWN", description="Prior Authorization Required")
                    ]
                ),
                patient_estimate=PatientEstimate(
                    estimated_patient_cost=0.0,
                    notes="Prior Authorization Required before service"
                ),
                source=ChannelSource.MOCK,
                timestamp=datetime.utcnow(),
                confidence=0.99
            )
            
        elif scenario == "payer_timeout":
             # In a real scenario this might raise an exception, but for VoBResult we might return unknown
             return VoBResult(
                request_id=str(uuid4()),
                coverage_status=CoverageStatus.UNKNOWN,
                source=ChannelSource.MOCK,
                timestamp=datetime.utcnow(),
                confidence=0.0,
                confidence_notes="Simulated payer timeout"
            )

        # Fallback to active full coverage
        return self._generate_response("active_full_coverage", request)

    async def health_check(self) -> bool:
        return True
    
    @property
    def connector_type(self) -> str:
        return "mock"
