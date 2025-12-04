# Lorelin VoB MVP - Product Requirements Document

**Version:** 1.0  
**Last Updated:** November 29, 2025  
**Status:** Ready for Development  
**Owner:** Dylan (Product Lead)

---

## Executive Summary

Lorelin VoB (Verification of Benefits) is a healthcare eligibility verification API that provides real-time insurance coverage information for medical practices. The MVP focuses on delivering the fastest, most accurate VoB solution on the market through a three-connector architecture: Mock (for demos), Stedi (for real-time 270/271 transactions), and RPA (for deep portal scraping).

**Core Value Proposition:** Reduce front-desk eligibility check time from 15+ minutes to under 10 seconds while providing procedure-specific cost estimates that increase collections and reduce claim denials.

---

## Problem Statement

### Current Pain Points

1. **Manual Verification:** Staff spend 15-20 minutes per patient calling payers or navigating portals
2. **Inaccurate Cost Estimates:** Patients receive surprise bills due to incomplete benefit information
3. **Claim Denials:** 10-15% of claims denied due to eligibility issues discovered post-service
4. **No Procedure Context:** Generic eligibility doesn't indicate coverage for specific CPT codes

### Target Users

| User | Primary Need | Success Metric |
|------|--------------|----------------|
| Front Desk Staff | Quick eligibility confirmation | <10 second response |
| Billing Manager | Accurate deductible/OOP info | <5% variance from actual |
| Practice Owner | Reduced denials, faster AR | 20% denial reduction |
| Patient | Accurate cost estimate | Within $50 of actual |

---

## Product Goals

### MVP Goals (12 Weeks)

1. **Speed:** P95 response time <8 seconds for sync endpoint
2. **Coverage:** Support 80% of commercial payers via Stedi
3. **Accuracy:** 90%+ confidence score correlation with actual outcomes
4. **Demo-Ready:** Functional demo for sales by Week 2
5. **Compliance:** HIPAA-compliant from day 1

### Success Metrics

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Sync Response P95 | <8s | DataDog APM |
| Cache Hit Rate | >40% | Redis metrics |
| Stedi Success Rate | >95% | Error tracking |
| RPA Success Rate | >85% | Error tracking |
| Demo Close Rate | >30% | CRM tracking |

---

## Functional Requirements

### FR-1: Eligibility Check API

#### FR-1.1: Synchronous Endpoint
- **Endpoint:** `POST /v1/vob/check_sync`
- **Timeout:** Configurable, max 15 seconds
- **Behavior:** Returns cached result if available, otherwise real-time check
- **Fallback:** Returns partial result with confidence score if timeout exceeded

#### FR-1.2: Asynchronous Endpoint
- **Endpoint:** `POST /v1/vob/check_async`
- **Response:** Returns `job_id` immediately
- **Polling:** `GET /v1/vob/status/{job_id}`
- **Timeout:** Up to 180 seconds for RPA sessions

#### FR-1.3: Request Schema
```
PatientInfo:
  - first_name (required)
  - last_name (required)
  - date_of_birth (required)
  - member_id (required)
  - group_number (optional)

PayerInfo:
  - payer_id (required)
  - payer_name (optional)

ProcedureInfo:
  - cpt_code (required)
  - date_of_service (required)
  - diagnosis_codes (optional)
```

#### FR-1.4: Response Schema
```
VoBResult:
  - status: active | inactive | unknown
  - confidence_score: 0.0 - 1.0
  - source: mock | stedi | rpa | blended
  - coverage:
    - plan_name
    - effective_date
    - termination_date
    - plan_type
  - financials:
    - deductible_individual
    - deductible_remaining
    - copay_office_visit
    - coinsurance_percent
    - oop_max
    - oop_remaining
  - procedure_specific:
    - cpt_code
    - covered: boolean
    - prior_auth_required: boolean
    - estimated_patient_cost
  - authorization:
    - required: boolean
    - reference_number (if exists)
    - phone_number
```

### FR-2: Connector System

#### FR-2.1: Mock Connector
- Returns predictable responses based on patient name patterns
- Scenarios: active_full_coverage, active_high_deductible, terminated, needs_auth, error
- No external dependencies
- Used for demos and development

#### FR-2.2: Stedi Connector
- Real 270/271 EDI transactions
- CPT → STC code translation with fallbacks
- <3 second typical response
- 80%+ payer coverage

#### FR-2.3: RPA Connector
- Browserbase + Playwright infrastructure
- Portal scraping for detailed financials
- TOTP-based MFA handling
- Human resolver fallback for complex MFA
- 15-180 second response time

#### FR-2.4: Connector Selection Logic
1. If demo mode or demo patient name → Mock
2. If sync mode and payer supports Stedi → Stedi
3. If async mode and payer supports RPA → RPA
4. Default fallback → Stedi

### FR-3: Result Blending

#### FR-3.1: Multi-Source Blending
- Combine Stedi and RPA results when both available
- Per-payer `financials_authority_stedi` flag determines financial data source
- Coverage status prefers Stedi (faster, more consistent)
- Procedure details prefer RPA (more detailed)
- Authorization requirements prefer RPA (more accurate)

#### FR-3.2: Confidence Scoring
- Base: Average of source confidence scores
- Boost +5% if sources agree on coverage status
- Penalty -10% if financial values differ significantly (>$100)
- Range: 0.50 - 0.99

### FR-4: Caching

#### FR-4.1: Cache Strategy
- Redis-based with 6-hour TTL
- Key: SHA256(patient_hash + payer_id + date_of_service + procedure_code)
- Cache hits return immediately with `source: cache`

#### FR-4.2: Cache Invalidation
- Manual invalidation via admin API
- Automatic expiry at TTL
- Force-refresh parameter on request

### FR-5: Demo Mode

#### FR-5.1: Demo Patients
| Last Name | Scenario | Response |
|-----------|----------|----------|
| Doe | Full coverage | Active, low deductible, no auth needed |
| Smith | High deductible | Active, $2500 remaining deductible |
| Inactive | Terminated | Inactive coverage |
| Pending | Needs auth | Active but prior auth required |
| Error | Timeout | Simulated payer timeout |

#### FR-5.2: Demo Toggle
- Environment variable: `DEMO_MODE=true`
- Request parameter: `demo=true`
- Patient name detection (automatic)

---

## Non-Functional Requirements

### NFR-1: Performance
- Sync endpoint P50: <3 seconds
- Sync endpoint P95: <8 seconds
- Async endpoint initiation: <500ms
- Cache lookup: <50ms

### NFR-2: Availability
- 99.5% uptime SLA
- Graceful degradation on connector failures
- Health check endpoint with dependency status

### NFR-3: Security & Compliance
- HIPAA compliance required
- PHI encrypted at rest (AES-256-GCM)
- PHI encrypted in transit (TLS 1.3)
- Patient data hashed for lookups (SHA-256)
- Audit logging for all PHI access
- 30-day artifact retention with secure deletion

### NFR-4: Scalability
- Target: 100,000+ checks/month
- Horizontal scaling via ECS Fargate
- Rate limiting per organization
- Queue-based RPA workload distribution

---

## Technical Architecture

### System Components

```
┌─────────────────────────────────────────────────┐
│                 API Gateway                      │
│            (Authentication, Rate Limiting)       │
└─────────────────────┬───────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────┐
│               VoB Service Core                   │
│  ┌─────────┐  ┌─────────┐  ┌─────────────────┐  │
│  │ Request │→ │  Cache  │→ │    Connector    │  │
│  │ Handler │  │  Check  │  │     Router      │  │
│  └─────────┘  └─────────┘  └─────────────────┘  │
└─────────────────────┬───────────────────────────┘
                      │
        ┌─────────────┼─────────────┐
        ▼             ▼             ▼
   ┌─────────┐  ┌─────────┐  ┌─────────┐
   │  Mock   │  │  Stedi  │  │   RPA   │
   │Connector│  │Connector│  │Connector│
   └─────────┘  └─────────┘  └─────────┘
                      │
                      ▼
              ┌─────────────┐
              │   Result    │
              │   Blender   │
              └─────────────┘
```

### Technology Stack
- **API:** FastAPI (Python 3.11+)
- **Database:** PostgreSQL 15
- **Cache:** Redis 7
- **RPA:** Browserbase + Playwright
- **LLM:** Claude 3.5 Sonnet (portal parsing)
- **Infrastructure:** AWS ECS Fargate
- **Monitoring:** DataDog

---

## User Stories

### Epic 1: Core Eligibility Check

**US-1.1:** As a front desk staff member, I want to check patient eligibility in under 10 seconds so that I can confirm coverage while the patient is at the counter.

**Acceptance Criteria:**
- Sync endpoint returns result within 10 seconds
- Result includes coverage status and basic financials
- Clear indication if coverage is active/inactive

**US-1.2:** As a billing manager, I want to see procedure-specific coverage details so that I can provide accurate cost estimates.

**Acceptance Criteria:**
- Response includes CPT-specific coverage flag
- Prior authorization requirements clearly indicated
- Estimated patient cost calculated

**US-1.3:** As a system integrator, I want to use async checks for batch processing so that I can verify tomorrow's appointments overnight.

**Acceptance Criteria:**
- Async endpoint returns job_id immediately
- Polling endpoint provides status updates
- Results stored for 24 hours after completion

### Epic 2: Demo & Sales

**US-2.1:** As a sales rep, I want to demonstrate eligibility checks to prospects without using real patient data so that I can show value without compliance concerns.

**Acceptance Criteria:**
- Demo patients return realistic responses
- Multiple scenarios available (active, inactive, auth required)
- No real API calls made in demo mode

### Epic 3: Operations

**US-3.1:** As an ops team member, I want to resolve MFA challenges for RPA sessions so that automated checks can complete successfully.

**Acceptance Criteria:**
- Dashboard shows pending MFA challenges
- Live view URL available for each challenge
- Resolution within 2 minutes of creation

---

## Release Phases

### Phase 1: Demo Shell (Weeks 1-2)
- MockConnector with all demo scenarios
- API endpoints (sync only)
- Basic response schema
- **Deliverable:** "John Doe" demo works

### Phase 2: Stedi Integration (Weeks 3-4)
- StediConnector implementation
- CPT → STC mapper
- Redis caching
- **Deliverable:** Real eligibility for 80% of payers

### Phase 3: RPA Foundation (Weeks 5-6)
- Browserbase integration
- RPAConnector for 3 pilot payers
- LLM parsing pipeline
- **Deliverable:** Deep financials for top payers

### Phase 4: Blending & Confidence (Weeks 7-8)
- Result blending logic
- Confidence scoring
- Per-payer authority flags
- **Deliverable:** Production-ready API

### Phase 5: Operations (Weeks 9-10)
- Resolver dashboard
- Monitoring & alerting
- Artifact storage
- **Deliverable:** Ops-ready system

### Phase 6: Polish (Weeks 11-12)
- Discovery endpoint (find insurance from patient info)
- Performance optimization
- Documentation
- **Deliverable:** Sales acceleration tools

---

## Dependencies

### External Services
| Service | Purpose | Criticality |
|---------|---------|-------------|
| Stedi | 270/271 transactions | Critical |
| Browserbase | RPA browser infrastructure | High |
| Anthropic (Claude) | Portal content parsing | High |
| AWS | Infrastructure | Critical |

### Internal Dependencies
- Authentication service for API keys
- Organization management for multi-tenant
- Billing service for usage tracking

---

## Risks & Mitigations

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Stedi rate limits | API throttling | Medium | Caching + request batching |
| Portal changes break RPA | Data gaps | High | LLM parsing + monitoring |
| MFA challenges overwhelm ops | Delays | Medium | TOTP automation first |
| Payer blocks RPA | Coverage gaps | Medium | IP rotation, fingerprinting |

---

## Open Questions

1. **Pricing model:** Per-check vs. subscription vs. hybrid?
2. **Discovery endpoint scope:** How many data sources to search?
3. **SLA guarantees:** What to promise customers on accuracy?
4. **Multi-tenant isolation:** Separate databases or row-level security?

---

## Appendix

### A. Demo Patient Reference
See FR-5.1 for complete demo patient scenarios.

### B. STC Code Reference
Service Type Codes used in 270/271 transactions - see technical spec for full mapping.

### C. Payer Coverage Matrix
To be developed during Phase 2 - will track which payers support Stedi vs. require RPA.
