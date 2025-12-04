# Lorelin VoB MVP - Technical Specification

**Version:** 1.0  
**Last Updated:** November 29, 2025  
**Audience:** Engineering Team

---

## 1. API Specification

### 1.1 Base URL
```
Production: https://api.lorelin.com/v1
Staging: https://api.staging.lorelin.com/v1
```

### 1.2 Authentication
All requests require Bearer token authentication:
```
Authorization: Bearer <api_key>
```

### 1.3 Endpoints

#### POST /v1/vob/check_sync

**Purpose:** Synchronous eligibility check with aggressive timeout

**Request:**
```json
{
  "patient": {
    "first_name": "John",
    "last_name": "Doe",
    "date_of_birth": "1985-03-15",
    "member_id": "ABC123456",
    "group_number": "GRP001"
  },
  "payer": {
    "payer_id": "AETNA",
    "payer_name": "Aetna Commercial"
  },
  "procedure": {
    "cpt_code": "99213",
    "date_of_service": "2025-12-15",
    "diagnosis_codes": ["Z00.00"]
  },
  "options": {
    "timeout_seconds": 10,
    "force_refresh": false,
    "demo": false
  }
}
```

**Response (200):**
```json
{
  "request_id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "active",
  "confidence_score": 0.95,
  "source": "stedi",
  "cached": false,
  "coverage": {
    "plan_name": "Aetna PPO",
    "plan_type": "PPO",
    "effective_date": "2025-01-01",
    "termination_date": "2025-12-31",
    "subscriber_relationship": "self"
  },
  "financials": {
    "deductible_individual": 500.00,
    "deductible_family": 1500.00,
    "deductible_remaining": 320.00,
    "copay_office_visit": 25.00,
    "copay_specialist": 50.00,
    "coinsurance_percent": 20,
    "oop_max_individual": 3000.00,
    "oop_max_family": 6000.00,
    "oop_remaining": 1200.00
  },
  "procedure_specific": {
    "cpt_code": "99213",
    "covered": true,
    "prior_auth_required": false,
    "auth_reference": null,
    "estimated_allowed": 125.00,
    "estimated_patient_cost": 25.00,
    "limitations": null
  },
  "authorization": {
    "required": false,
    "phone": "1-800-555-0100",
    "fax": "1-800-555-0101",
    "instructions": null
  },
  "metadata": {
    "response_time_ms": 2340,
    "payer_response_code": "AAA",
    "checked_at": "2025-11-29T14:30:00Z"
  }
}
```

**Error Response (422):**
```json
{
  "error": {
    "code": "INVALID_MEMBER_ID",
    "message": "Member ID not found for specified payer",
    "details": {
      "payer_id": "AETNA",
      "member_id": "ABC123456"
    }
  }
}
```

#### POST /v1/vob/check_async

**Purpose:** Asynchronous check for batch processing or RPA-required payers

**Request:** Same as check_sync

**Response (202):**
```json
{
  "job_id": "550e8400-e29b-41d4-a716-446655440001",
  "status": "queued",
  "estimated_completion_seconds": 30,
  "poll_url": "/v1/vob/status/550e8400-e29b-41d4-a716-446655440001"
}
```

#### GET /v1/vob/status/{job_id}

**Response (200) - Pending:**
```json
{
  "job_id": "550e8400-e29b-41d4-a716-446655440001",
  "status": "processing",
  "progress": {
    "step": "rpa_login",
    "percent": 25
  },
  "estimated_remaining_seconds": 45
}
```

**Response (200) - Complete:**
```json
{
  "job_id": "550e8400-e29b-41d4-a716-446655440001",
  "status": "completed",
  "result": { /* Same as check_sync response */ }
}
```

#### GET /v1/vob/cache/invalidate

**Purpose:** Force cache invalidation for a patient/payer combination

**Query Parameters:**
- `patient_hash`: SHA256 hash of patient identifiers
- `payer_id`: Payer identifier

**Response (200):**
```json
{
  "invalidated": true,
  "keys_removed": 3
}
```

---

## 2. Data Models

### 2.1 Core Pydantic Models

```python
from pydantic import BaseModel, Field
from datetime import date
from typing import Optional, Literal
from uuid import UUID
from decimal import Decimal

class PatientInfo(BaseModel):
    first_name: str = Field(..., min_length=1, max_length=50)
    last_name: str = Field(..., min_length=1, max_length=50)
    date_of_birth: date
    member_id: str = Field(..., min_length=1, max_length=50)
    group_number: Optional[str] = Field(None, max_length=50)
    
class PayerInfo(BaseModel):
    payer_id: str = Field(..., min_length=1, max_length=20)
    payer_name: Optional[str] = Field(None, max_length=100)

class ProcedureInfo(BaseModel):
    cpt_code: str = Field(..., pattern=r"^\d{5}$")
    date_of_service: date
    diagnosis_codes: Optional[list[str]] = None

class RequestOptions(BaseModel):
    timeout_seconds: int = Field(default=10, le=15, ge=5)
    force_refresh: bool = False
    demo: bool = False

class VoBRequest(BaseModel):
    patient: PatientInfo
    payer: PayerInfo
    procedure: ProcedureInfo
    options: RequestOptions = RequestOptions()

class CoverageDetails(BaseModel):
    plan_name: Optional[str]
    plan_type: Optional[str]
    effective_date: Optional[date]
    termination_date: Optional[date]
    subscriber_relationship: Optional[str]

class FinancialDetails(BaseModel):
    deductible_individual: Optional[Decimal]
    deductible_family: Optional[Decimal]
    deductible_remaining: Optional[Decimal]
    copay_office_visit: Optional[Decimal]
    copay_specialist: Optional[Decimal]
    coinsurance_percent: Optional[int]
    oop_max_individual: Optional[Decimal]
    oop_max_family: Optional[Decimal]
    oop_remaining: Optional[Decimal]

class ProcedureSpecific(BaseModel):
    cpt_code: str
    covered: Optional[bool]
    prior_auth_required: Optional[bool]
    auth_reference: Optional[str]
    estimated_allowed: Optional[Decimal]
    estimated_patient_cost: Optional[Decimal]
    limitations: Optional[str]

class AuthorizationInfo(BaseModel):
    required: Optional[bool]
    phone: Optional[str]
    fax: Optional[str]
    instructions: Optional[str]

class ResultMetadata(BaseModel):
    response_time_ms: int
    payer_response_code: Optional[str]
    checked_at: datetime

class VoBResult(BaseModel):
    request_id: UUID
    status: Literal["active", "inactive", "unknown"]
    confidence_score: float = Field(..., ge=0.0, le=1.0)
    source: Literal["mock", "stedi", "rpa", "blended", "cache"]
    cached: bool = False
    coverage: CoverageDetails
    financials: Optional[FinancialDetails]
    procedure_specific: Optional[ProcedureSpecific]
    authorization: Optional[AuthorizationInfo]
    metadata: ResultMetadata
```

---

## 3. Database Schema

### 3.1 PostgreSQL Tables

```sql
-- Organizations (multi-tenant)
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    api_key_hash VARCHAR(64) NOT NULL UNIQUE,
    tier VARCHAR(20) DEFAULT 'standard',
    rate_limit_per_minute INT DEFAULT 60,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- VoB Requests (HIPAA-compliant)
CREATE TABLE vob_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    
    -- Patient (hashed for lookups, encrypted for storage)
    patient_hash VARCHAR(64) NOT NULL,
    encrypted_patient_data BYTEA NOT NULL,
    
    -- Payer (not PHI)
    payer_id VARCHAR(20) NOT NULL,
    payer_name VARCHAR(100),
    
    -- Procedure (not PHI)
    procedure_code VARCHAR(10) NOT NULL,
    date_of_service DATE NOT NULL,
    
    -- Result
    status VARCHAR(20) NOT NULL,
    result_data JSONB,
    confidence_score DECIMAL(3,2),
    source VARCHAR(20) NOT NULL,
    
    -- Timing
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    response_time_ms INT,
    
    -- Audit
    created_by UUID,
    ip_address INET,
    
    CONSTRAINT idx_patient_lookup UNIQUE (
        organization_id, patient_hash, payer_id, 
        date_of_service, procedure_code
    )
);

CREATE INDEX idx_vob_requests_org ON vob_requests(organization_id);
CREATE INDEX idx_vob_requests_date ON vob_requests(requested_at);
CREATE INDEX idx_vob_cache_lookup ON vob_requests(
    patient_hash, payer_id, date_of_service, requested_at DESC
);

-- Payer Configuration
CREATE TABLE payer_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payer_id VARCHAR(20) UNIQUE NOT NULL,
    payer_name VARCHAR(100) NOT NULL,
    
    -- Stedi settings
    stedi_enabled BOOLEAN DEFAULT true,
    stedi_payer_id VARCHAR(50),
    
    -- RPA settings
    rpa_enabled BOOLEAN DEFAULT false,
    rpa_portal_url VARCHAR(500),
    rpa_priority INT DEFAULT 100,
    
    -- Authority flag
    financials_authority_stedi BOOLEAN DEFAULT false,
    
    -- Encrypted credentials
    encrypted_credentials BYTEA,
    
    -- Performance stats
    avg_response_time_ms INT,
    success_rate DECIMAL(3,2),
    
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Async Jobs
CREATE TABLE vob_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    request_id UUID REFERENCES vob_requests(id),
    
    status VARCHAR(20) NOT NULL DEFAULT 'queued',
    progress_step VARCHAR(50),
    progress_percent INT DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    
    error_code VARCHAR(50),
    error_message TEXT
);

CREATE INDEX idx_vob_jobs_status ON vob_jobs(status, created_at);

-- RPA Artifacts
CREATE TABLE vob_artifacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vob_request_id UUID REFERENCES vob_requests(id),
    
    artifact_type VARCHAR(20) NOT NULL,
    s3_bucket VARCHAR(100) NOT NULL,
    s3_key VARCHAR(500) NOT NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL
);

CREATE INDEX idx_artifacts_expiry ON vob_artifacts(expires_at);

-- MFA Challenges (for resolver)
CREATE TABLE mfa_challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID REFERENCES vob_jobs(id),
    
    browserbase_session_id VARCHAR(100) NOT NULL,
    live_view_url VARCHAR(500),
    
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP,
    resolved_by UUID,
    
    timeout_at TIMESTAMP NOT NULL
);

CREATE INDEX idx_mfa_pending ON mfa_challenges(status, created_at)
    WHERE status = 'pending';
```

---

## 4. Connector Implementations

### 4.1 Base Connector Interface

```python
from abc import ABC, abstractmethod

class BaseConnector(ABC):
    @abstractmethod
    async def check_eligibility(self, request: VoBRequest) -> VoBResult:
        """Execute eligibility check and return result."""
        pass
    
    @abstractmethod
    async def health_check(self) -> bool:
        """Verify connector is operational."""
        pass
    
    @property
    @abstractmethod
    def connector_type(self) -> str:
        """Return connector identifier."""
        pass
```

### 4.2 Mock Connector

```python
class MockConnector(BaseConnector):
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
        responses = {
            "active_full_coverage": VoBResult(
                request_id=uuid4(),
                status="active",
                confidence_score=0.99,
                source="mock",
                coverage=CoverageDetails(
                    plan_name="Demo PPO Plan",
                    effective_date=date(2025, 1, 1),
                    termination_date=date(2025, 12, 31),
                ),
                financials=FinancialDetails(
                    deductible_individual=Decimal("500.00"),
                    deductible_remaining=Decimal("320.00"),
                    copay_office_visit=Decimal("25.00"),
                    coinsurance_percent=20,
                    oop_max_individual=Decimal("3000.00"),
                    oop_remaining=Decimal("1200.00"),
                ),
                procedure_specific=ProcedureSpecific(
                    cpt_code=request.procedure.cpt_code,
                    covered=True,
                    prior_auth_required=False,
                    estimated_patient_cost=Decimal("25.00"),
                ),
                metadata=ResultMetadata(
                    response_time_ms=500,
                    checked_at=datetime.utcnow(),
                ),
            ),
            # ... other scenarios
        }
        return responses.get(scenario, responses["active_full_coverage"])
    
    async def health_check(self) -> bool:
        return True
    
    @property
    def connector_type(self) -> str:
        return "mock"
```

### 4.3 Stedi Connector

```python
class StediConnector(BaseConnector):
    def __init__(self, api_key: str, base_url: str):
        self.api_key = api_key
        self.base_url = base_url
        self.stc_mapper = STCMapper()
        self.http_client = httpx.AsyncClient(timeout=10.0)
    
    async def check_eligibility(self, request: VoBRequest) -> VoBResult:
        stc_codes = self.stc_mapper.get_stc_with_fallbacks(
            request.procedure.cpt_code
        )
        
        payload = self._build_270_request(request, stc_codes)
        
        response = await self.http_client.post(
            f"{self.base_url}/healthcare/eligibility/v3",
            headers={"Authorization": f"Bearer {self.api_key}"},
            json=payload,
        )
        response.raise_for_status()
        
        return self._parse_271_response(response.json(), request)
    
    def _build_270_request(
        self, 
        request: VoBRequest, 
        stc_codes: list[str]
    ) -> dict:
        return {
            "controlNumber": str(uuid4())[:9],
            "tradingPartnerServiceId": request.payer.payer_id,
            "provider": {
                "organizationName": settings.PROVIDER_ORG_NAME,
                "npi": settings.PROVIDER_NPI,
            },
            "subscriber": {
                "memberId": request.patient.member_id,
                "firstName": request.patient.first_name,
                "lastName": request.patient.last_name,
                "dateOfBirth": request.patient.date_of_birth.isoformat(),
                "groupNumber": request.patient.group_number,
            },
            "encounter": {
                "serviceTypeCodes": stc_codes,
                "dateRange": {
                    "startDate": request.procedure.date_of_service.isoformat(),
                    "endDate": request.procedure.date_of_service.isoformat(),
                },
            },
        }
    
    def _parse_271_response(
        self, 
        response: dict, 
        request: VoBRequest
    ) -> VoBResult:
        # Parse 271 response into VoBResult
        # Implementation depends on Stedi response format
        pass
    
    async def health_check(self) -> bool:
        try:
            response = await self.http_client.get(
                f"{self.base_url}/health"
            )
            return response.status_code == 200
        except Exception:
            return False
    
    @property
    def connector_type(self) -> str:
        return "stedi"
```

### 4.4 STC Mapper

```python
class STCMapper:
    SPECIFIC_MAPPINGS = {
        "19357": "54",  # Breast reconstruction
        "92004": "67",  # Eye exam
        "99213": "30",  # Office visit
        "99214": "30",
        "99215": "30",
    }
    
    CATEGORY_MAPPINGS = {
        "920": "67",  # Vision
        "193": "54",  # Breast procedures
        "992": "30",  # E/M codes
    }
    
    SURGICAL_PREFIXES = ["19", "27", "29", "66"]
    
    def get_stc(self, cpt_code: str) -> str:
        if cpt_code in self.SPECIFIC_MAPPINGS:
            return self.SPECIFIC_MAPPINGS[cpt_code]
        
        category = cpt_code[:3]
        if category in self.CATEGORY_MAPPINGS:
            return self.CATEGORY_MAPPINGS[category]
        
        if cpt_code[:2] in self.SURGICAL_PREFIXES:
            return "2"  # Surgical
        
        return "30"  # Generic fallback
    
    def get_stc_with_fallbacks(self, cpt_code: str) -> list[str]:
        stcs = []
        
        if cpt_code in self.SPECIFIC_MAPPINGS:
            stcs.append(self.SPECIFIC_MAPPINGS[cpt_code])
        
        category = cpt_code[:3]
        if category in self.CATEGORY_MAPPINGS:
            cat_stc = self.CATEGORY_MAPPINGS[category]
            if cat_stc not in stcs:
                stcs.append(cat_stc)
        
        if "30" not in stcs:
            stcs.append("30")
        
        return stcs
```

---

## 5. Caching Layer

```python
class VoBCache:
    TTL_SECONDS = 6 * 60 * 60  # 6 hours
    
    def __init__(self, redis: Redis):
        self.redis = redis
    
    def _make_key(self, request: VoBRequest) -> str:
        patient_hash = self._hash_patient(request.patient)
        key_material = (
            f"{patient_hash}|{request.payer.payer_id}|"
            f"{request.procedure.date_of_service}|"
            f"{request.procedure.cpt_code}"
        )
        return f"vob:cache:{hashlib.sha256(key_material.encode()).hexdigest()}"
    
    def _hash_patient(self, patient: PatientInfo) -> str:
        material = (
            f"{patient.last_name.lower()}|"
            f"{patient.date_of_birth}|"
            f"{patient.member_id}"
        )
        return hashlib.sha256(material.encode()).hexdigest()
    
    async def get(self, request: VoBRequest) -> Optional[VoBResult]:
        key = self._make_key(request)
        data = await self.redis.get(key)
        if data:
            await self.redis.hincrby(f"{key}:stats", "hits", 1)
            result = VoBResult.model_validate_json(data)
            result.cached = True
            result.source = "cache"
            return result
        return None
    
    async def set(self, request: VoBRequest, result: VoBResult):
        key = self._make_key(request)
        await self.redis.setex(
            key,
            self.TTL_SECONDS,
            result.model_dump_json()
        )
    
    async def invalidate(self, request: VoBRequest):
        key = self._make_key(request)
        await self.redis.delete(key)
```

---

## 6. PHI Encryption

```python
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
import os

class PHIEncryption:
    def __init__(self, key: bytes):
        if len(key) != 32:
            raise ValueError("Key must be 32 bytes for AES-256")
        self.aesgcm = AESGCM(key)
    
    def encrypt(self, plaintext: str) -> bytes:
        nonce = os.urandom(12)
        ciphertext = self.aesgcm.encrypt(
            nonce, 
            plaintext.encode(), 
            None
        )
        return nonce + ciphertext
    
    def decrypt(self, encrypted: bytes) -> str:
        nonce = encrypted[:12]
        ciphertext = encrypted[12:]
        plaintext = self.aesgcm.decrypt(nonce, ciphertext, None)
        return plaintext.decode()
    
    def encrypt_patient(self, patient: PatientInfo) -> bytes:
        return self.encrypt(patient.model_dump_json())
    
    def decrypt_patient(self, encrypted: bytes) -> PatientInfo:
        plaintext = self.decrypt(encrypted)
        return PatientInfo.model_validate_json(plaintext)
```

---

## 7. Result Blending

```python
class ResultBlender:
    async def blend(
        self,
        stedi_result: Optional[VoBResult],
        rpa_result: Optional[VoBResult],
        payer_config: PayerConfig
    ) -> VoBResult:
        if not stedi_result and not rpa_result:
            raise ValueError("At least one result required")
        
        if not stedi_result:
            return rpa_result.model_copy(update={"source": "rpa"})
        if not rpa_result:
            return stedi_result.model_copy(update={"source": "stedi"})
        
        # Both available - blend
        return VoBResult(
            request_id=stedi_result.request_id,
            status=stedi_result.status,  # Prefer Stedi for status
            confidence_score=self._calculate_confidence(
                stedi_result, rpa_result
            ),
            source="blended",
            coverage=stedi_result.coverage,
            financials=self._select_financials(
                stedi_result, rpa_result, payer_config
            ),
            procedure_specific=(
                rpa_result.procedure_specific or 
                stedi_result.procedure_specific
            ),
            authorization=(
                rpa_result.authorization or 
                stedi_result.authorization
            ),
            metadata=ResultMetadata(
                response_time_ms=max(
                    stedi_result.metadata.response_time_ms,
                    rpa_result.metadata.response_time_ms
                ),
                checked_at=datetime.utcnow(),
            ),
        )
    
    def _select_financials(
        self,
        stedi: VoBResult,
        rpa: VoBResult,
        config: PayerConfig
    ) -> Optional[FinancialDetails]:
        if config.financials_authority_stedi:
            return stedi.financials
        return rpa.financials or stedi.financials
    
    def _calculate_confidence(
        self,
        stedi: VoBResult,
        rpa: VoBResult
    ) -> float:
        base = (stedi.confidence_score + rpa.confidence_score) / 2
        
        # Boost if coverage status matches
        if stedi.status == rpa.status:
            base += 0.05
        
        # Penalty if financials differ significantly
        if stedi.financials and rpa.financials:
            if stedi.financials.deductible_remaining and rpa.financials.deductible_remaining:
                diff = abs(
                    float(stedi.financials.deductible_remaining) -
                    float(rpa.financials.deductible_remaining)
                )
                if diff > 100:
                    base -= 0.10
        
        return min(0.99, max(0.50, base))
```

---

## 8. Environment Configuration

```python
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # API
    API_HOST: str = "0.0.0.0"
    API_PORT: int = 8000
    DEBUG: bool = False
    DEMO_MODE: bool = False
    
    # Database
    DATABASE_URL: str
    DATABASE_POOL_SIZE: int = 10
    
    # Redis
    REDIS_URL: str
    
    # Stedi
    STEDI_API_KEY: str
    STEDI_BASE_URL: str = "https://healthcare.us.stedi.com"
    
    # Browserbase
    BROWSERBASE_API_KEY: str
    BROWSERBASE_PROJECT_ID: str
    
    # Anthropic (LLM parsing)
    ANTHROPIC_API_KEY: str
    
    # Provider Info (for 270 requests)
    PROVIDER_ORG_NAME: str
    PROVIDER_NPI: str
    
    # Encryption
    PHI_ENCRYPTION_KEY: str  # 32-byte hex string
    
    # AWS
    AWS_REGION: str = "us-east-1"
    S3_ARTIFACTS_BUCKET: str
    
    class Config:
        env_file = ".env"

settings = Settings()
```

---

## 9. Deployment Configuration

### 9.1 Docker Compose (Development)

```yaml
version: '3.8'

services:
  api:
    build: .
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://lorelin:dev@postgres:5432/lorelin
      - REDIS_URL=redis://redis:6379/0
      - DEMO_MODE=true
    depends_on:
      - postgres
      - redis

  postgres:
    image: postgres:15
    environment:
      POSTGRES_USER: lorelin
      POSTGRES_PASSWORD: dev
      POSTGRES_DB: lorelin
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

### 9.2 ECS Task Definition (Production)

```json
{
  "family": "lorelin-vob-api",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "1024",
  "memory": "2048",
  "executionRoleArn": "arn:aws:iam::ACCOUNT:role/ecsTaskExecutionRole",
  "taskRoleArn": "arn:aws:iam::ACCOUNT:role/lorelinVobTaskRole",
  "containerDefinitions": [
    {
      "name": "api",
      "image": "ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/lorelin-vob:latest",
      "portMappings": [
        {
          "containerPort": 8000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {"name": "API_PORT", "value": "8000"}
      ],
      "secrets": [
        {"name": "DATABASE_URL", "valueFrom": "arn:aws:secretsmanager:..."},
        {"name": "STEDI_API_KEY", "valueFrom": "arn:aws:secretsmanager:..."}
      ],
      "healthCheck": {
        "command": ["CMD-SHELL", "curl -f http://localhost:8000/health || exit 1"],
        "interval": 30,
        "timeout": 5,
        "retries": 3
      },
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/lorelin-vob",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "api"
        }
      }
    }
  ]
}
```
