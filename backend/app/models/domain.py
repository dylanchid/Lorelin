from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import date, datetime
from enum import Enum

# --- Enums ---

class CoverageStatus(str, Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    UNKNOWN = "unknown"

class NetworkType(str, Enum):
    IN_NETWORK = "in_network"
    OUT_OF_NETWORK = "out_of_network"
    UNKNOWN = "unknown"

class ServiceType(str, Enum):
    OFFICE_VISIT = "office_visit"
    EMERGENCY = "emergency"
    SPECIALIST = "specialist"
    IMAGING = "imaging"
    LAB = "lab"
    OTHER = "other"

class ChannelSource(str, Enum):
    STEDI = "stedi"
    RPA = "rpa"
    MANUAL = "manual"
    MOCK = "mock"

# --- Shared Sub-models ---

class Address(BaseModel):
    line1: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zip: Optional[str] = None

class PatientInfo(BaseModel):
    first_name: str
    last_name: str
    dob: date
    member_id: str
    group_number: Optional[str] = None
    address: Optional[Address] = None

class PayerInfo(BaseModel):
    name: str
    payer_code_hint: Optional[str] = None

class ProviderInfo(BaseModel):
    npi: str
    tax_id: Optional[str] = None

class ServiceInfo(BaseModel):
    cpt: str
    diagnosis_codes: List[str] = []

class PlanDates(BaseModel):
    start: Optional[date] = None
    end: Optional[date] = None

class MoneyAmount(BaseModel):
    total: float
    remaining: Optional[float] = None
    met_date: Optional[date] = None

class Deductible(BaseModel):
    individual: Optional[MoneyAmount] = None
    family: Optional[MoneyAmount] = None

class OOPMax(BaseModel):
    individual: Optional[MoneyAmount] = None
    family: Optional[MoneyAmount] = None

class Copay(BaseModel):
    service_type: str
    amount: float
    network: NetworkType = NetworkType.IN_NETWORK

class Coinsurance(BaseModel):
    service_type: str
    rate_pct: float
    network: NetworkType = NetworkType.IN_NETWORK

class Financials(BaseModel):
    deductible: Optional[Deductible] = None
    oop_max: Optional[OOPMax] = None
    copays: List[Copay] = []
    coinsurance: List[Coinsurance] = []

class AuthRequirement(BaseModel):
    cpt: str
    description: Optional[str] = None
    notes: Optional[str] = None

class AuthInfo(BaseModel):
    services_requiring_auth: List[AuthRequirement] = []
    services_requiring_referral: List[AuthRequirement] = []
    general_notes: Optional[str] = None

class PatientEstimate(BaseModel):
    estimated_patient_cost: float
    estimate_components: Dict[str, float] = {}
    notes: Optional[str] = None

class RawRefs(BaseModel):
    stedi_transaction_id: Optional[str] = None
    raw_271_file: Optional[str] = None
    portal_artifact_url: Optional[str] = None

# --- Main Models ---

class VoBRequest(BaseModel):
    practice_id: str
    patient: PatientInfo
    payer: PayerInfo
    provider: ProviderInfo
    services: List[ServiceInfo] = []
    visit_date: Optional[date] = None

class VoBResult(BaseModel):
    request_id: str
    coverage_status: CoverageStatus
    plan_name: Optional[str] = None
    plan_type: Optional[str] = None
    plan_effective_dates: Optional[PlanDates] = None
    
    financials: Optional[Financials] = None
    auth: Optional[AuthInfo] = None
    patient_estimate: Optional[PatientEstimate] = None
    
    source: ChannelSource
    raw_refs: Optional[RawRefs] = None
    
    timestamp: datetime
    confidence: float = 1.0
    confidence_notes: Optional[str] = None
