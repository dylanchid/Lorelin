from typing import Optional, Dict, Any
from datetime import datetime
from sqlmodel import SQLModel, Field, JSON
from enum import Enum
import uuid

class JobStatus(str, Enum):
    QUEUED = "queued"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"

class Job(SQLModel, table=True):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    status: JobStatus = Field(default=JobStatus.QUEUED)
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
    
    # Store the original request to re-hydrate if needed
    request_payload: Dict[str, Any] = Field(default={}, sa_type=JSON)
    
    # Store the result
    result: Optional[Dict[str, Any]] = Field(default=None, sa_type=JSON)
    
    # Progress tracking
    progress_step: Optional[str] = None
    progress_percent: int = 0
    
    # Error tracking
    error_message: Optional[str] = None
