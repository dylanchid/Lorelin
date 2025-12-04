import { projectId, publicAnonKey } from './supabase/info';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-e8ce19db`;

async function apiCall(endpoint: string, method: string = 'GET', body?: any) {
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${publicAnonKey}`,
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE}${endpoint}`, options);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API call failed: ${response.status} ${errorText}`);
  }

  return response.json();
}

export interface Visit {
  id: string;
  patient_name: string;
  patient_age: number;
  visit_date: string;
  visit_time: string;
  provider: string;
  payer: string;
  visit_reason: string;
  status: 'to-record' | 'transcribing' | 'to-review' | 'approved' | 'sent';
  charge_estimate: number;
  member_id?: string;
  group_number?: string;
  pre_visit_step?: string;
  pre_visit_risk?: 'ready' | 'at-risk' | 'blocked';
  created_at?: string;
  updated_at?: string;
}

// Diagnose database connectivity
export async function diagnoseDatabase() {
  return apiCall('/diagnose');
}

// Initialize visits table with sample data
export async function initVisits() {
  return apiCall('/init-visits', 'POST');
}

// Get all visits
export async function getVisits() {
  return apiCall('/visits');
}

// Get today's visits
export async function getTodayVisits() {
  return apiCall('/visits/today');
}

// Get pre-visit items
export async function getPreVisitItems(days: number | string = 7) {
  return apiCall(`/visits/pre-visit?days=${days}`);
}

// Update visit
export async function updateVisit(id: string, updates: Partial<Visit>) {
  return apiCall(`/visits/${id}`, 'PUT', updates);
}

// ============================================================================
// DISPUTES API
// ============================================================================

export interface Dispute {
  id: string;
  created_at?: string;
  updated_at?: string;
  patient_name: string;
  claim_id: string;
  procedure_name: string;
  procedure_code: string;
  payer_name: string;
  plan_type?: string | null;
  billed: number;
  paid: number;
  potential: number;
  contract_expected?: number | null;
  contract_gap?: number | null;
  type: string;
  path: string;
  issue?: string | null;
  status: string;
  next_action: string;
  deadline_date?: string | null;
  deadline_label?: string | null;
  path_tooltip?: string | null;
  is_urgent: boolean;
  assigned_to?: string | null;
  notes?: string | null;
}

export async function getDisputes() {
  return apiCall('/disputes');
}

export async function getDispute(id: string) {
  return apiCall(`/disputes/${id}`);
}

export async function updateDispute(id: string, data: Partial<Dispute>) {
  return apiCall(`/disputes/${id}`, 'PUT', data);
}

export async function initDisputes() {
  return apiCall('/init-disputes', 'POST');
}

// ============================================================================
// WORK ITEMS API
// ============================================================================

export interface WorkItem {
  id: string;
  created_at?: string;
  updated_at?: string;
  type: 'visit' | 'claim';
  step: 'to-record' | 'to-review' | 'ready-to-send' | 'flagged';
  patient_name: string;
  description: string;
  provider: string;
  payer: string;
  value: number;
  value_label: string;
  deadline?: string | null;
  deadline_label?: string | null;
  urgency: 'high' | 'medium' | 'low';
  visit_id?: string | null;
  dispute_id?: string | null;
  completed: boolean;
  assigned_to?: string | null;
}

export async function getWorkItems(typeFilter?: string, stepFilter?: string) {
  let url = '/work-items';
  const params = new URLSearchParams();
  if (typeFilter) params.append('type', typeFilter);
  if (stepFilter) params.append('step', stepFilter);
  const queryString = params.toString();
  if (queryString) url += `?${queryString}`;
  return apiCall(url);
}

export async function updateWorkItem(id: string, data: Partial<WorkItem>) {
  return apiCall(`/work-items/${id}`, 'PUT', data);
}

export async function initWorkItems() {
  return apiCall('/init-work-items', 'POST');
}

// ============================================================================
// AUTHORIZATIONS API
// ============================================================================

export interface Authorization {
  id: string;
  visit_id?: string;
  patient_name: string;
  patient_id?: string;
  patient_dob?: string;
  provider?: string;
  payer: string;
  plan_id?: string;
  visit_date?: string;
  visit_time?: string;
  visit_reason?: string;
  procedure_type?: string;
  location?: string;
  status: 'needed' | 'draft-ready' | 'submitting' | 'submitted' | 'approved' | 'denied';
  clinical_justification?: string;
  cpt_codes?: Array<{ code: string; description: string }>;
  icd10_codes?: Array<{ code: string; description: string }>;
  notes?: string;
  submitted_date?: string;
  submitted_by?: string;
  submission_method?: string;
  pa_id?: string;
  valid_from?: string;
  valid_to?: string;
  approved_date?: string;
  approved_by?: string;
  denied_date?: string;
  denied_reason?: string;
  created_at?: string;
  updated_at?: string;
}

export async function getAuthorizations() {
  return apiCall('/authorizations');
}

export async function getAuthorization(id: string) {
  return apiCall(`/authorizations/${id}`);
}

export async function getAuthorizationsByVisit(visitId: string) {
  return apiCall(`/authorizations/by-visit/${visitId}`);
}

export async function createAuthorization(data: Partial<Authorization>) {
  return apiCall('/authorizations', 'POST', data);
}

export async function updateAuthorization(id: string, data: Partial<Authorization>) {
  return apiCall(`/authorizations/${id}`, 'PUT', data);
}

export async function deleteAuthorization(id: string) {
  return apiCall(`/authorizations/${id}`, 'DELETE');
}

// ============================================================================
// ELIGIBILITIES API
// ============================================================================

export interface EligibilityHistoryEntry {
  timestamp: string;
  status: 'verified' | 'failed';
  method: 'lorelin' | 'manual';
  note: string;
}

export interface EligibilityResult {
  status: string;
  planName: string;
  effectiveDates: string;
  officeVisitCopay?: string;
  deductibleRemaining?: string;
  oopRemaining?: string;
  coverage?: Array<{ service: string; responsibility: string }>;
}

export interface Eligibility {
  id: string;
  visit_id?: string;
  patient_name: string;
  patient_id?: string;
  patient_dob?: string;
  patient_sex?: string;
  provider?: string;
  payer: string;
  plan_id?: string;
  member_id?: string;
  group_number?: string;
  visit_date?: string;
  visit_time?: string;
  visit_reason?: string;
  service_type?: string;
  location?: string;
  benefit_type?: string;
  status: 'pending' | 'verified' | 'failed';
  lorelin_available?: boolean;
  current_result?: EligibilityResult;
  history?: EligibilityHistoryEntry[];
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export async function getEligibilities() {
  return apiCall('/eligibilities');
}

export async function getEligibility(id: string) {
  return apiCall(`/eligibilities/${id}`);
}

export async function getEligibilitiesByVisit(visitId: string) {
  return apiCall(`/eligibilities/by-visit/${visitId}`);
}

export async function createEligibility(data: Partial<Eligibility>) {
  return apiCall('/eligibilities', 'POST', data);
}

export async function updateEligibility(id: string, data: Partial<Eligibility>) {
  return apiCall(`/eligibilities/${id}`, 'PUT', data);
}

export async function deleteEligibility(id: string) {
  return apiCall(`/eligibilities/${id}`, 'DELETE');
}

export async function runEligibilityCheck(id: string) {
  return apiCall(`/eligibilities/${id}/check`, 'POST');
}

export async function recordManualVerification(id: string, result: 'verified' | 'failed', notes?: string, copay?: string, deductible?: string) {
  return apiCall(`/eligibilities/${id}/manual`, 'POST', { result, notes, copay, deductible });
}