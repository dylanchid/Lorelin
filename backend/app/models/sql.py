from sqlmodel import SQLModel, Field, JSON
from typing import Optional, List
from datetime import datetime
from uuid import UUID, uuid4
from enum import Enum

class ChannelPreference(str, Enum):
    STEDI = "stedi"
    RPA = "rpa"
    NONE = "none"

class PayerConfig(SQLModel, table=True):
    __tablename__ = "payer_config"
    
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    name: str
    stedi_payer_code: Optional[str] = None
    stedi_supported: bool = False
    stedi_enrollment_status: str = "none" # none, pending, active
    rpa_supported: bool = False
    preferred_channel: ChannelPreference = ChannelPreference.STEDI
    fallback_channel: ChannelPreference = ChannelPreference.RPA
    
    # Metrics
    failure_rate_stedi_24h: float = 0.0
    failure_rate_rpa_24h: float = 0.0
    avg_latency_stedi_ms: int = 0
    avg_latency_rpa_ms: int = 0
    
    notes: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class Practice(SQLModel, table=True):
    __tablename__ = "practice"
    
    id: str = Field(primary_key=True) # e.g. "demo-practice-1"
    name: str
    npi: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

class Patient(SQLModel, table=True):
    __tablename__ = "patient"
    
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    practice_id: str = Field(foreign_key="practice.id")
    first_name: str
    last_name: str
    dob: datetime
    member_id: str
    group_number: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class VoBTransaction(SQLModel, table=True):
    __tablename__ = "vob_transaction"
    
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    request_id: str = Field(index=True)
    practice_id: str = Field(foreign_key="practice.id")
    patient_id: Optional[UUID] = Field(foreign_key="patient.id", default=None)
    payer_config_id: Optional[UUID] = Field(foreign_key="payer_config.id", default=None)
    
    status: str # pending, completed, failed
    channel_used: str # stedi, rpa
    
    request_json: dict = Field(default={}, sa_type=JSON)
    result_json: Optional[dict] = Field(default=None, sa_type=JSON)
    
    created_at: datetime = Field(default_factory=datetime.utcnow)
    completed_at: Optional[datetime] = None
