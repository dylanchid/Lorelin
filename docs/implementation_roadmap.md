# Lorelin VoB MVP - 12-Week Implementation Roadmap

**Version:** 1.0  
**Team Size:** 7 engineers  
**Start Date:** December 2, 2025

---

## Phase Overview

| Phase | Weeks | Focus | Key Deliverable |
|-------|-------|-------|-----------------|
| 1 | 1-2 | Demo Shell | Working mock endpoint |
| 2 | 3-4 | Stedi Integration | Real eligibility checks |
| 3 | 5-6 | RPA Foundation | Portal automation (3 payers) |
| 4 | 7-8 | Blending & Polish | Production-ready API |
| 5 | 9-10 | Operations | Monitoring & resolver |
| 6 | 11-12 | Launch | Documentation & go-live |

---

## Phase 1: Demo Shell (Weeks 1-2)

### Goals
- Functional demo for sales calls by end of Week 2
- No external dependencies (runs offline)
- Complete API contract established

### Week 1 Tasks

| Task | Owner | Estimate | Priority |
|------|-------|----------|----------|
| Project scaffolding (FastAPI, Poetry, Docker) | Backend Lead | 4h | P0 |
| Pydantic models (all request/response schemas) | Backend | 8h | P0 |
| MockConnector implementation | Backend | 8h | P0 |
| Sync endpoint `/v1/vob/check_sync` | Backend | 4h | P0 |
| Basic error handling middleware | Backend | 4h | P1 |
| Docker Compose for local dev | DevOps | 4h | P0 |
| API documentation (OpenAPI) | Backend | 4h | P1 |

### Week 2 Tasks

| Task | Owner | Estimate | Priority |
|------|-------|----------|----------|
| Demo scenario expansion (all 5 scenarios) | Backend | 4h | P0 |
| Health check endpoint | Backend | 2h | P1 |
| Basic logging setup | DevOps | 4h | P1 |
| PostgreSQL schema (organizations, requests) | Backend | 8h | P0 |
| Demo UI prototype (simple React form) | Frontend | 16h | P1 |
| Internal demo & feedback | Team | 4h | P0 |

### Deliverables
- [ ] `POST /v1/vob/check_sync` returns mock data
- [ ] Demo patients: Doe, Smith, Inactive, Pending, Error
- [ ] Docker Compose runs locally
- [ ] Basic demo UI functional

### Success Criteria
- Sales can demo "John Doe" eligibility check
- Response time <1 second
- All demo scenarios produce different, realistic responses

---

## Phase 2: Stedi Integration (Weeks 3-4)

### Goals
- Real eligibility checks via Stedi API
- CPT → STC mapping for procedure-specific queries
- Redis caching to reduce API costs

### Week 3 Tasks

| Task | Owner | Estimate | Priority |
|------|-------|----------|----------|
| Stedi API client implementation | Backend | 12h | P0 |
| CPT → STC mapper (basic mappings) | Backend | 8h | P0 |
| 271 response parser | Backend | 12h | P0 |
| StediConnector class | Backend | 8h | P0 |
| Redis integration (basic) | Backend | 4h | P1 |
| Stedi sandbox testing | QA | 8h | P0 |

### Week 4 Tasks

| Task | Owner | Estimate | Priority |
|------|-------|----------|----------|
| VoBCache implementation (6-hour TTL) | Backend | 8h | P0 |
| Connector router logic | Backend | 8h | P0 |
| Payer configuration table | Backend | 4h | P0 |
| Expand STC mappings (50+ CPT codes) | Backend | 8h | P1 |
| Error handling for Stedi failures | Backend | 4h | P0 |
| Integration tests (Stedi sandbox) | QA | 12h | P0 |

### Deliverables
- [ ] StediConnector returns real 271 data
- [ ] Cache reduces repeat calls
- [ ] STC mappings cover common CPT codes
- [ ] Payer config supports enable/disable

### Success Criteria
- 80% of commercial payer IDs return valid responses
- P95 response time <5 seconds (uncached)
- Cache hit rate measurable

---

## Phase 3: RPA Foundation (Weeks 5-6)

### Goals
- Browserbase + Playwright working for 3 pilot payers
- LLM parsing extracts structured data from HTML
- Async endpoint functional

### Week 5 Tasks

| Task | Owner | Estimate | Priority |
|------|-------|----------|----------|
| Browserbase account setup | DevOps | 2h | P0 |
| RPAConnector base class | Backend | 8h | P0 |
| Playwright automation for Payer A | Backend | 16h | P0 |
| Async endpoint `/v1/vob/check_async` | Backend | 8h | P0 |
| Job status tracking (PostgreSQL) | Backend | 8h | P0 |
| Polling endpoint `/v1/vob/status/{job_id}` | Backend | 4h | P0 |

### Week 6 Tasks

| Task | Owner | Estimate | Priority |
|------|-------|----------|----------|
| LLM parsing pipeline (Claude 3.5 Sonnet) | Backend | 12h | P0 |
| Playwright automation for Payer B | Backend | 12h | P0 |
| Playwright automation for Payer C | Backend | 12h | P1 |
| TOTP-based MFA handling | Backend | 8h | P1 |
| Artifact storage (S3) | DevOps | 8h | P1 |
| RPA error handling & retries | Backend | 8h | P0 |

### Deliverables
- [ ] RPAConnector works for 3 payers
- [ ] Async job tracking functional
- [ ] LLM parses portal HTML to VoBResult
- [ ] Screenshots saved to S3

### Success Criteria
- 85% RPA success rate on test patients
- Async jobs complete within 3 minutes
- LLM parsing accuracy >90% on test cases

---

## Phase 4: Blending & Polish (Weeks 7-8)

### Goals
- Intelligent result blending when multiple sources available
- Per-payer authority flags working
- Confidence scoring calibrated

### Week 7 Tasks

| Task | Owner | Estimate | Priority |
|------|-------|----------|----------|
| ResultBlender implementation | Backend | 12h | P0 |
| Per-payer `financials_authority_stedi` flag | Backend | 4h | P0 |
| Confidence scoring algorithm | Backend | 8h | P0 |
| Blended response testing | QA | 8h | P0 |
| PHI encryption implementation | Backend | 12h | P0 |
| Audit logging for HIPAA | Backend | 8h | P0 |

### Week 8 Tasks

| Task | Owner | Estimate | Priority |
|------|-------|----------|----------|
| Rate limiting per organization | Backend | 8h | P0 |
| API key authentication | Backend | 8h | P0 |
| Multi-tenant isolation testing | QA | 8h | P0 |
| Performance optimization | Backend | 12h | P1 |
| Load testing (target: 100 concurrent) | QA | 8h | P0 |
| Security review | DevOps | 8h | P0 |

### Deliverables
- [ ] Blended results use correct authority source
- [ ] Confidence scores correlate with accuracy
- [ ] PHI encrypted at rest
- [ ] Rate limiting prevents abuse

### Success Criteria
- Blended results more accurate than single-source
- Sync P95 <8 seconds under load
- Security review passes

---

## Phase 5: Operations (Weeks 9-10)

### Goals
- MFA resolver dashboard for ops team
- Comprehensive monitoring & alerting
- Artifact lifecycle management

### Week 9 Tasks

| Task | Owner | Estimate | Priority |
|------|-------|----------|----------|
| MFA challenge queue (Redis) | Backend | 8h | P0 |
| Resolver dashboard (basic React) | Frontend | 20h | P0 |
| Live view URL integration | Backend | 4h | P0 |
| Challenge timeout handling | Backend | 4h | P0 |
| DataDog APM integration | DevOps | 8h | P0 |
| Alert rules (error rate, latency) | DevOps | 4h | P0 |

### Week 10 Tasks

| Task | Owner | Estimate | Priority |
|------|-------|----------|----------|
| Artifact 30-day lifecycle | DevOps | 4h | P1 |
| Dashboard polish & testing | Frontend | 12h | P1 |
| Runbook documentation | DevOps | 8h | P0 |
| On-call rotation setup | DevOps | 4h | P0 |
| End-to-end testing (all flows) | QA | 16h | P0 |
| Performance baseline documentation | QA | 4h | P1 |

### Deliverables
- [ ] Resolver dashboard operational
- [ ] DataDog dashboards live
- [ ] Alerts firing correctly
- [ ] Runbooks complete

### Success Criteria
- MFA challenges resolved within 2 minutes
- Alert SLOs defined and monitored
- Ops team trained on resolver

---

## Phase 6: Launch (Weeks 11-12)

### Goals
- Production deployment complete
- API documentation published
- First customer onboarding ready

### Week 11 Tasks

| Task | Owner | Estimate | Priority |
|------|-------|----------|----------|
| ECS Fargate deployment | DevOps | 12h | P0 |
| Production database setup (RDS) | DevOps | 8h | P0 |
| Production Redis (ElastiCache) | DevOps | 4h | P0 |
| SSL/TLS configuration | DevOps | 4h | P0 |
| API documentation (public) | Backend | 12h | P0 |
| SDK starter (Python, TypeScript) | Backend | 8h | P1 |

### Week 12 Tasks

| Task | Owner | Estimate | Priority |
|------|-------|----------|----------|
| Production smoke testing | QA | 8h | P0 |
| Customer onboarding guide | Product | 8h | P0 |
| Demo script finalization | Product | 4h | P0 |
| Launch checklist completion | Team | 4h | P0 |
| Post-launch monitoring setup | DevOps | 4h | P0 |
| Team retrospective | Team | 2h | P1 |

### Deliverables
- [ ] Production environment live
- [ ] API docs at docs.lorelin.com
- [ ] Onboarding guide complete
- [ ] First customer can integrate

### Success Criteria
- Production uptime >99%
- First customer API call successful
- No P0 bugs in first week

---

## Risk Register

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Stedi rate limits block testing | High | Medium | Request sandbox limit increase early |
| Portal changes break RPA | High | High | LLM parsing provides flexibility; weekly monitoring |
| MFA challenges overwhelm ops | Medium | Medium | Prioritize TOTP automation; hire if needed |
| CPT→STC mappings incomplete | Medium | Medium | Start with top 100 codes; add iteratively |
| Team availability (holidays) | Low | Medium | Front-load critical work in Weeks 1-4 |

---

## Dependencies

### External
- Stedi sandbox access (Week 1)
- Browserbase account (Week 5)
- AWS account with production access (Week 10)
- Anthropic API key (Week 5)

### Internal
- Design approval on demo UI (Week 2)
- Payer list prioritization (Week 3)
- Security review scheduling (Week 8)
