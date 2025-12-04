import { useState, Fragment, useEffect } from 'react';
import { ChevronDown, ChevronRight, Loader2, Search, Check, X, Link, Copy, Download } from 'lucide-react';
import { EligibilityShelf } from './EligibilityShelf';
import { getPreVisitItems, initVisits, Visit as APIVisit } from '../utils/api';

type TimeFilter = '3' | '7' | '14' | 'all' | 'today';
type RiskFilter = 'all' | 'at-risk' | 'blocked';
type StepFilter = 'all' | 'eligibility' | 'authorization' | 'estimate' | 'forms';

type PreVisitRisk = 'ready' | 'at-risk' | 'blocked';
type PreVisitStep = 'eligibility-pending' | 'eligibility-failed' | 'auth-needed' | 'auth-draft-ready' | 'auth-submitted' | 'auth-approved' | 'auth-denied' | 'estimate-not-sent' | 'forms-incomplete' | 'ready';

type ModalType = 'eligibility' | 'preauth' | null;

interface PreVisitItem {
  id: string;
  patientName: string;
  visitReason: string;
  step: PreVisitStep;
  risk: PreVisitRisk;
  provider: string;
  payer: string;
  visitDate: string;
  visitTime: string;
  urgency: string;
  isRunning?: boolean;
  // Pre-filled data for forms
  memberId?: string;
  groupNumber?: string;
}

interface PreVisitScreenProps {
  onOpenAuthWorkspace?: (status: 'needed' | 'draft-ready' | 'submitted' | 'approved' | 'denied') => void;
  onOpenEligibilityWorkspace?: (data: any) => void;
}

// New Eligibility Check Card Component
function NewEligibilityCheckCard() {
  const [currentResult, setCurrentResult] = useState<any>(null);

  const handleRunCheck = () => {
    // Mock result
    setCurrentResult({
      status: 'active',
      planName: 'Blue Cross Blue Shield PPO',
      coverageDates: '01/01/2025 – 12/31/2025',
      deductibleRemaining: '$1,250',
      oopRemaining: '$3,450',
      coverage: [
        { service: 'Office visit', responsibility: '20% after deductible' },
        { service: 'Specialist visit', responsibility: '$40 copay' },
        { service: 'Surgery', responsibility: '20% after deductible' },
        { service: 'ER visit', responsibility: '$500 copay' },
      ]
    });
  };

  const getStatusStyle = (status: string) => {
    if (status === 'active') return 'bg-emerald-50/70 text-emerald-700/90 border-emerald-200/40';
    if (status === 'inactive') return 'bg-red-50/70 text-red-700/90 border-red-200/40';
    return 'bg-gray-50/70 text-gray-600/90 border-gray-200/40';
  };

  const getStatusLabel = (status: string) => {
    if (status === 'active') return 'Active';
    if (status === 'inactive') return 'Inactive';
    return 'Needs manual review';
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm mb-6">
      <div className="px-8 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-[16px] font-semibold text-[#101828] tracking-[-0.02em]">
            New eligibility check
          </h2>
          <p className="text-[12px] text-[#6a7282]">
            Front desk · Real-time eligibility
          </p>
        </div>

        {/* Form */}
        <div className="flex flex-wrap items-end gap-3">
          {/* Patient */}
          <div className="flex-1 min-w-[200px]">
            <label className="block text-[11px] text-[#6a7282] uppercase tracking-wider mb-1.5">
              Patient
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search patient name or MRN"
                className="w-full px-3 py-2 pl-9 bg-white border border-gray-300 rounded-lg text-[13px] text-[#101828] placeholder:text-[#99A1AF] focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#99A1AF]" />
            </div>
          </div>

          {/* Payer */}
          <div className="flex-1 min-w-[180px]">
            <label className="block text-[11px] text-[#6a7282] uppercase tracking-wider mb-1.5">
              Payer
            </label>
            <div className="relative">
              <select
                className="w-full appearance-none px-3 py-2 pr-8 bg-white border border-gray-300 rounded-lg text-[13px] text-[#101828] focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent cursor-pointer"
              >
                <option value="">Select payer</option>
                <option value="aetna">Aetna PPO</option>
                <option value="bcbs">Blue Cross Blue Shield</option>
                <option value="uhc">UnitedHealthcare</option>
                <option value="cigna">Cigna PPO</option>
                <option value="humana">Humana PPO</option>
                <option value="medicare">Medicare</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 size-4 text-[#6a7282] pointer-events-none" />
            </div>
          </div>

          {/* Member ID */}
          <div className="w-[160px]">
            <label className="block text-[11px] text-[#6a7282] uppercase tracking-wider mb-1.5">
              Member ID
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-[13px] text-[#101828] placeholder:text-[#99A1AF] focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>

          {/* Group # */}
          <div className="w-[140px]">
            <label className="block text-[11px] text-[#6a7282] uppercase tracking-wider mb-1.5">
              Group # <span className="text-[#99A1AF]">(optional)</span>
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-[13px] text-[#101828] placeholder:text-[#99A1AF] focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>

          {/* Date of visit */}
          <div className="w-[160px]">
            <label className="block text-[11px] text-[#6a7282] uppercase tracking-wider mb-1.5">
              Date of visit
            </label>
            <input
              type="date"
              defaultValue={new Date().toISOString().split('T')[0]}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-[13px] text-[#101828] focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>

          {/* Run check button */}
          <button
            onClick={handleRunCheck}
            className="px-6 py-2 bg-[#101828] text-white rounded-lg text-[13px] font-medium hover:bg-[#1f2937] transition-colors"
          >
            Run check
          </button>
        </div>

        {/* Results area - only shown after check is run */}
        {currentResult && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            {/* Status + Plan info */}
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className={`inline-flex px-3 py-1 rounded-full text-[11px] font-semibold tracking-wider border mb-2 ${getStatusStyle(currentResult.status)}`}>
                  {getStatusLabel(currentResult.status)}
                </div>
                <div className="text-[14px] font-semibold text-[#101828]">{currentResult.planName}</div>
                <div className="text-[12px] text-[#6a7282] mt-0.5">{currentResult.coverageDates}</div>
              </div>
            </div>

            {/* Two numbers row */}
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <div className="text-[11px] text-[#6a7282] mb-1">Deductible remaining</div>
                <div className="text-[20px] font-semibold text-[#101828] tracking-[-0.02em]">{currentResult.deductibleRemaining}</div>
              </div>
              <div>
                <div className="text-[11px] text-[#6a7282] mb-1">Out-of-pocket remaining</div>
                <div className="text-[20px] font-semibold text-[#101828] tracking-[-0.02em]">{currentResult.oopRemaining}</div>
              </div>
            </div>

            {/* 2x2 coverage grid */}
            <div className="grid grid-cols-2 gap-3">
              {currentResult.coverage.map((item: any, idx: number) => (
                <div key={idx} className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
                  <div className="shrink-0 size-4 rounded-full bg-emerald-100 flex items-center justify-center">
                    <Check className="size-2.5 text-emerald-700" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] text-[#6a7282] truncate">{item.service}</div>
                    <div className="text-[12px] text-[#101828] font-medium">{item.responsibility}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 mt-6">
              <button className="px-4 py-2 bg-white border border-gray-300 text-[#101828] rounded-lg text-[12px] font-medium hover:bg-gray-50 transition-colors flex items-center gap-2">
                <Link className="size-3.5" />
                Attach to visit
              </button>
              <button className="px-4 py-2 bg-white border border-gray-300 text-[#101828] rounded-lg text-[12px] font-medium hover:bg-gray-50 transition-colors flex items-center gap-2">
                <Copy className="size-3.5" />
                Copy summary
              </button>
              <button className="px-4 py-2 bg-[#101828] text-white rounded-lg text-[12px] font-medium hover:bg-[#1f2937] transition-colors flex items-center gap-2">
                <Download className="size-3.5" />
                Download PDF
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function PreVisitScreen({ onOpenAuthWorkspace, onOpenEligibilityWorkspace }: PreVisitScreenProps = {}) {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('7');
  const [workListFilter, setWorkListFilter] = useState<TimeFilter>('7');
  const [riskFilter, setRiskFilter] = useState<RiskFilter>('all');
  const [stepFilter, setStepFilter] = useState<StepFilter>('all');
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [runningItems, setRunningItems] = useState<string[]>([]);
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);
  const [expandedType, setExpandedType] = useState<'eligibility' | 'preauth' | null>(null);
  const [preVisitItems, setPreVisitItems] = useState<PreVisitItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authWorkspaceOpen, setAuthWorkspaceOpen] = useState(false);

  useEffect(() => {
    loadPreVisitItems();
  }, [workListFilter]);

  const loadPreVisitItems = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Convert workListFilter to appropriate value for API
      // For "all" and "today", pass the string directly
      // For numeric values, parse as integer
      const daysParam = (workListFilter === 'all' || workListFilter === 'today') 
        ? workListFilter 
        : parseInt(workListFilter);
      
      // Try to get visits
      let response = await getPreVisitItems(daysParam);
      
      // If no visits exist, initialize them
      if (!response.visits || response.visits.length === 0) {
        console.log('No visits found, initializing...');
        await initVisits();
        response = await getPreVisitItems(daysParam);
      }
      
      // Transform API data to component format
      const transformedItems: PreVisitItem[] = response.visits
        .filter((v: APIVisit) => {
          // Filter out any visits with invalid dates
          if (!v.visit_date || !v.visit_time) {
            console.warn('Skipping visit with invalid date/time:', v);
            return false;
          }
          return true;
        })
        .map((v: APIVisit) => {
          try {
            return {
              id: v.id,
              patientName: v.patient_name,
              visitReason: v.visit_reason,
              step: (v.pre_visit_step || 'ready') as PreVisitStep,
              risk: (v.pre_visit_risk || 'ready') as PreVisitRisk,
              provider: v.provider,
              payer: v.payer,
              visitDate: formatVisitDate(v.visit_date),
              visitTime: v.visit_time,
              urgency: getUrgency(v.visit_date, v.visit_time),
              memberId: v.member_id,
              groupNumber: v.group_number,
            };
          } catch (err) {
            console.error('Error transforming visit:', v, err);
            throw err;
          }
        });
      
      setPreVisitItems(transformedItems);
    } catch (err) {
      console.error('Error loading pre-visit items:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load pre-visit items';
      
      // Check if it's a schema cache error
      if (errorMessage.includes('schema cache') || errorMessage.includes('PGRST205')) {
        setError('SCHEMA_CACHE_ERROR');
      }
      // Check if it's a table not found error
      else if (errorMessage.includes('Could not find the table') || errorMessage.includes('relation') || errorMessage.includes('does not exist')) {
        setError('DATABASE_NOT_SETUP');
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const formatVisitDate = (dateStr: string) => {
    if (!dateStr) return 'Invalid date';
    
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      console.error('Invalid date string:', dateStr);
      return 'Invalid date';
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const visitDate = new Date(date);
    visitDate.setHours(0, 0, 0, 0);
    
    const diffTime = visitDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getUrgency = (dateStr: string, timeStr: string) => {
    if (!dateStr || !timeStr) return 'Unknown';
    
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      console.error('Invalid date string in getUrgency:', dateStr);
      return 'Unknown';
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const visitDate = new Date(date);
    visitDate.setHours(0, 0, 0, 0);
    
    const diffTime = visitDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      // Parse time to get hours
      const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
      if (match) {
        let hours = parseInt(match[1]);
        const minutes = parseInt(match[2]);
        const meridiem = match[3].toUpperCase();
        
        if (meridiem === 'PM' && hours !== 12) hours += 12;
        if (meridiem === 'AM' && hours === 12) hours = 0;
        
        const currentHour = new Date().getHours();
        const hoursUntil = hours - currentHour;
        
        if (hoursUntil <= 2) return 'Starts soon';
        if (hoursUntil <= 6) return `Starts in ${hoursUntil} hours`;
      }
      return 'Today';
    }
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays === 2) return 'In 2 days';
    if (diffDays === 3) return 'In 3 days';
    
    return `In ${diffDays} days`;
  };

  // Filter work items
  const filteredItems = preVisitItems.filter(item => {
    if (riskFilter !== 'all' && item.risk !== riskFilter) return false;
    if (stepFilter === 'eligibility' && !item.step.startsWith('eligibility')) return false;
    if (stepFilter === 'authorization' && !item.step.startsWith('auth')) return false;
    if (stepFilter === 'estimate' && !item.step.startsWith('estimate')) return false;
    if (stepFilter === 'forms' && !item.step.startsWith('forms')) return false;
    return true;
  });

  const getStepPillStyle = (step: PreVisitStep) => {
    // Eligibility states
    if (step === 'eligibility-pending') {
      return 'bg-slate-50/60 text-slate-600/85 border-slate-200/40';
    }
    if (step === 'eligibility-failed') {
      return 'bg-orange-50/60 text-orange-700/85 border-orange-200/40';
    }
    
    // Auth states
    if (step === 'auth-needed') {
      return 'bg-orange-50/60 text-orange-700/85 border-orange-200/40';
    }
    if (step === 'auth-draft-ready') {
      return 'bg-blue-50/60 text-blue-700/85 border-blue-200/40';
    }
    if (step === 'auth-submitted') {
      return 'bg-slate-50/60 text-slate-600/85 border-slate-200/40';
    }
    if (step === 'auth-approved') {
      return 'bg-emerald-50/60 text-emerald-700/85 border-emerald-200/40';
    }
    if (step === 'auth-denied') {
      return 'bg-red-50/60 text-red-700/85 border-red-200/40';
    }
    
    // Other states
    if (step === 'estimate-not-sent' || step === 'forms-incomplete') {
      return 'bg-amber-50/70 text-amber-700/85 border-amber-200/40';
    }
    if (step === 'ready') {
      return 'bg-emerald-50/60 text-emerald-700/85 border-emerald-200/40';
    }
    
    return 'bg-slate-50/60 text-slate-600/85 border-slate-200/40';
  };

  const getStepLabel = (step: PreVisitStep) => {
    if (step === 'eligibility-pending') return 'Eligibility – Pending';
    if (step === 'eligibility-failed') return 'Eligibility – Failed';
    if (step === 'auth-needed') return 'Auth – Needed';
    if (step === 'auth-draft-ready') return 'Auth – Draft ready';
    if (step === 'auth-submitted') return 'Auth – Submitted';
    if (step === 'auth-approved') return 'Auth – Approved';
    if (step === 'auth-denied') return 'Auth – Denied';
    if (step === 'estimate-not-sent') return 'Estimate – Not sent';
    if (step === 'forms-incomplete') return 'Forms – Incomplete';
    if (step === 'ready') return 'Ready';
    return step;
  };

  const getActionLabel = (step: PreVisitStep, itemId: string) => {
    if (runningItems.includes(itemId)) {
      return (
        <span className="flex items-center gap-1.5">
          <Loader2 className="size-3 animate-spin" />
          Running...
        </span>
      );
    }
    
    // Eligibility actions
    if (step === 'eligibility-pending' || step === 'eligibility-failed') {
      return 'Run eligibility';
    }
    
    // Auth actions
    if (step === 'auth-needed' || step === 'auth-draft-ready') {
      return 'Open auth workspace';
    }
    if (step === 'auth-submitted') {
      return 'Log decision';
    }
    if (step === 'auth-approved') {
      return 'View packet';
    }
    if (step === 'auth-denied') {
      return 'View packet';
    }
    
    // Other actions
    if (step === 'ready') return 'Open visit';
    return 'View details';
  };

  const handleActionClick = (e: React.MouseEvent, itemId: string, step: PreVisitStep) => {
    e.stopPropagation();
    const item = preVisitItems.find(i => i.id === itemId);
    if (!item) return;
    
    // Eligibility actions - navigate to eligibility workspace
    if (step === 'eligibility-pending' || step === 'eligibility-failed') {
      if (onOpenEligibilityWorkspace) {
        onOpenEligibilityWorkspace({
          patientName: item.patientName,
          patientId: item.id,
          payer: item.payer,
          visitReason: item.visitReason,
          provider: item.provider,
          visitDate: item.visitDate,
          visitTime: item.visitTime,
          memberId: item.memberId,
          groupNumber: item.groupNumber
        });
      }
      return;
    }
    
    // Auth actions - navigate to auth workspace with appropriate status
    if (step === 'auth-needed') {
      if (onOpenAuthWorkspace) {
        onOpenAuthWorkspace('needed');
      }
      return;
    }
    
    if (step === 'auth-draft-ready') {
      if (onOpenAuthWorkspace) {
        onOpenAuthWorkspace('draft-ready');
      }
      return;
    }
    
    if (step === 'auth-submitted') {
      if (onOpenAuthWorkspace) {
        onOpenAuthWorkspace('submitted');
      }
      return;
    }
    
    if (step === 'auth-approved') {
      if (onOpenAuthWorkspace) {
        onOpenAuthWorkspace('approved');
      }
      return;
    }
    
    if (step === 'auth-denied') {
      if (onOpenAuthWorkspace) {
        onOpenAuthWorkspace('denied');
      }
      return;
    }
    
    // For 'ready' state - could navigate to visit detail
    if (step === 'ready') {
      console.log('Opening visit detail for', itemId);
      // TODO: Navigate to visit detail screen
      return;
    }
  };

  const handleRowSelect = (itemId: string) => {
    setSelectedRows(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleSelectAll = () => {
    if (selectedRows.length === filteredItems.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(filteredItems.map(item => item.id));
    }
  };

  const handleBulkRunEligibility = () => {
    setRunningItems(selectedRows);
    setTimeout(() => {
      setRunningItems([]);
      setSelectedRows([]);
    }, 2000);
  };

  const handleClearSelection = () => {
    setSelectedRows([]);
  };

  // Calculate stats
  const readyCount = 24;
  const atRiskCount = 6;
  const blockedCount = 3;
  const totalCount = readyCount + atRiskCount + blockedCount;

  const readyPercent = (readyCount / totalCount) * 100;
  const atRiskPercent = (atRiskCount / totalCount) * 100;
  const blockedPercent = (blockedCount / totalCount) * 100;

  return (
    <div className="overflow-auto size-full bg-[#f5f5f7]">
      <div className="max-w-[1400px] mx-auto px-[60px] py-[32px] pb-[60px]">
        
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#101828] mx-auto mb-4"></div>
              <p className="text-[13px] text-[#6a7282]">Loading pre-visit items...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
            {error === 'SCHEMA_CACHE_ERROR' ? (
              <>
                <h3 className="text-[15px] font-semibold text-amber-800 mb-2">⚠️ Schema Cache Refresh Needed</h3>
                <p className="text-[13px] text-amber-700 mb-4">
                  The visits table exists, but Supabase's API needs to refresh its schema cache. Follow one of these options:
                </p>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                  <p className="text-[12px] font-semibold text-amber-900 mb-3">Option 1: Reload Schema Cache (Recommended)</p>
                  <ol className="list-decimal list-inside space-y-1.5 text-[12px] text-amber-800 mb-3">
                    <li>Go to your <strong>Supabase Dashboard</strong></li>
                    <li>Navigate to <strong>Settings → API</strong></li>
                    <li>Scroll down and click <strong>"Reload schema cache"</strong></li>
                    <li>Wait a few seconds and click Retry below</li>
                  </ol>
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                  <p className="text-[12px] font-semibold text-amber-900 mb-3">Option 2: Run SQL Command</p>
                  <p className="text-[12px] text-amber-800 mb-2">Run this in your Supabase SQL Editor:</p>
                  <pre className="bg-amber-100 rounded p-2 text-[11px] text-amber-900 overflow-x-auto mb-2">
                    NOTIFY pgrst, 'reload schema';
                  </pre>
                  <p className="text-[11px] text-amber-700">Then click Retry below</p>
                </div>
                <button 
                  onClick={loadPreVisitItems}
                  className="px-4 py-2 bg-amber-600 text-white rounded-lg text-[12px] font-medium hover:bg-amber-700 transition-colors"
                >
                  Retry After Refresh
                </button>
              </>
            ) : (
              <>
                <h3 className="text-[15px] font-semibold text-red-800 mb-2">Error Loading Pre-Visit Items</h3>
                <p className="text-[13px] text-red-700">{error}</p>
                <button 
                  onClick={loadPreVisitItems}
                  className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg text-[12px] font-medium hover:bg-red-700 transition-colors"
                >
                  Retry
                </button>
              </>
            )}
          </div>
        )}

        {!loading && !error && (
          <>
        {/* Card 1: Pre-visit overview */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm mb-6">
          
          {/* Header */}
          <div className="flex items-center justify-between px-8 py-6 border-b border-gray-200">
            <div>
              <h2 className="text-[16px] font-semibold text-[#101828] tracking-[-0.02em] mb-1">
                Pre-visit overview
              </h2>
              <p className="text-[12px] text-[#6a7282]">
                Upcoming visits in the next 7 days
              </p>
            </div>
            <div className="relative">
              <select
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value as TimeFilter)}
                className="appearance-none px-3 py-1.5 pr-8 bg-white border border-gray-300 rounded-lg text-[13px] text-[#101828] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
              >
                <option value="3">Next 3 days</option>
                <option value="7">Next 7 days</option>
                <option value="14">Next 14 days</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 size-4 text-[#6a7282] pointer-events-none" />
            </div>
          </div>

          {/* KPI tiles */}
          <div className="px-8 pt-6 pb-5">
            <div className="grid grid-cols-3 gap-6">
              {/* Ready */}
              <div>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-[28px] font-semibold text-[#101828] tracking-[-0.02em]">{readyCount}</span>
                  <span className="text-[13px] text-[#6a7282]">visits</span>
                </div>
                <div className="text-[12px] text-emerald-700 font-medium">Ready</div>
                <div className="text-[11px] text-[#6a7282] mt-0.5">All checks complete</div>
              </div>

              {/* At risk */}
              <div>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-[28px] font-semibold text-[#101828] tracking-[-0.02em]">{atRiskCount}</span>
                  <span className="text-[13px] text-[#6a7282]">visits</span>
                </div>
                <div className="text-[12px] text-amber-700 font-medium">At risk</div>
                <div className="text-[11px] text-[#6a7282] mt-0.5">Missing auth / eligibility issues</div>
              </div>

              {/* Blocked */}
              <div>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-[28px] font-semibold text-[#101828] tracking-[-0.02em]">{blockedCount}</span>
                  <span className="text-[13px] text-[#6a7282]">visits</span>
                </div>
                <div className="text-[12px] text-red-700 font-medium">Blocked</div>
                <div className="text-[11px] text-[#6a7282] mt-0.5">Cannot proceed as is</div>
              </div>
            </div>
          </div>

          {/* Readiness mix bar */}
          <div className="px-8 pb-6">
            <div className="flex items-center gap-3">
              <span className="text-[11px] text-[#6a7282] shrink-0">Readiness mix</span>
              <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden flex">
                <div 
                  className="bg-emerald-600 h-full" 
                  style={{ width: `${readyPercent}%` }}
                />
                <div 
                  className="bg-amber-500 h-full" 
                  style={{ width: `${atRiskPercent}%` }}
                />
                <div 
                  className="bg-red-500 h-full" 
                  style={{ width: `${blockedPercent}%` }}
                />
              </div>
              <div className="flex items-center gap-3 text-[11px] text-[#6a7282] shrink-0">
                <div className="flex items-center gap-1">
                  <div className="size-2 rounded-full bg-emerald-600" />
                  <span>{Math.round(readyPercent)}%</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="size-2 rounded-full bg-amber-500" />
                  <span>{Math.round(atRiskPercent)}%</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="size-2 rounded-full bg-red-500" />
                  <span>{Math.round(blockedPercent)}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* NEW: New eligibility check card */}
        <NewEligibilityCheckCard />

        {/* Card 2: Pre-visit work to do */}
        <div className="bg-white border border-gray-200 rounded-lg p-8">
          
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-[16px] font-semibold text-[#101828] tracking-[-0.02em] mb-1">
                Pre-visit work to do
              </h2>
              <p className="text-[12px] text-[#6a7282]">
                Visits that need attention before the scheduled time
              </p>
            </div>
            <div className="relative">
              <select
                value={workListFilter}
                onChange={(e) => setWorkListFilter(e.target.value as TimeFilter)}
                className="appearance-none px-3 py-1.5 pr-8 bg-white border border-gray-300 rounded-lg text-[13px] text-[#101828] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
              >
                <option value="today">Today</option>
                <option value="3">Next 3 days</option>
                <option value="7">Next 7 days</option>
                <option value="all">All</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 size-4 text-[#6a7282] pointer-events-none" />
            </div>
          </div>

          {/* Filter chips */}
          <div className="flex items-center gap-4 mb-6 pb-5 border-b border-gray-200">
            {/* RISK filter */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-[#99A1AF] uppercase tracking-wider">Risk</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setRiskFilter('all')}
                  className={`px-3 py-1 rounded-md text-[12px] tracking-[-0.15px] transition-all border ${
                    riskFilter === 'all'
                      ? 'bg-[#101828] text-white border-[#101828]'
                      : 'text-[#6a7282] border-gray-200 hover:text-[#101828] hover:bg-gray-50'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setRiskFilter('at-risk')}
                  className={`px-3 py-1 rounded-md text-[12px] tracking-[-0.15px] transition-all border ${
                    riskFilter === 'at-risk'
                      ? 'bg-[#101828] text-white border-[#101828]'
                      : 'text-[#6a7282] border-gray-200 hover:text-[#101828] hover:bg-gray-50'
                  }`}
                >
                  At risk
                </button>
                <button
                  onClick={() => setRiskFilter('blocked')}
                  className={`px-3 py-1 rounded-md text-[12px] tracking-[-0.15px] transition-all border ${
                    riskFilter === 'blocked'
                      ? 'bg-[#101828] text-white border-[#101828]'
                      : 'text-[#6a7282] border-gray-200 hover:text-[#101828] hover:bg-gray-50'
                  }`}
                >
                  Blocked
                </button>
              </div>
            </div>

            {/* STEP filter */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-[#99A1AF] uppercase tracking-wider">Step</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setStepFilter('all')}
                  className={`px-3 py-1 rounded-md text-[12px] tracking-[-0.15px] transition-all border ${
                    stepFilter === 'all'
                      ? 'bg-[#101828] text-white border-[#101828]'
                      : 'text-[#6a7282] border-gray-200 hover:text-[#101828] hover:bg-gray-50'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setStepFilter('eligibility')}
                  className={`px-3 py-1 rounded-md text-[12px] tracking-[-0.15px] transition-all border ${
                    stepFilter === 'eligibility'
                      ? 'bg-[#101828] text-white border-[#101828]'
                      : 'text-[#6a7282] border-gray-200 hover:text-[#101828] hover:bg-gray-50'
                  }`}
                >
                  Eligibility
                </button>
                <button
                  onClick={() => setStepFilter('authorization')}
                  className={`px-3 py-1 rounded-md text-[12px] tracking-[-0.15px] transition-all border ${
                    stepFilter === 'authorization'
                      ? 'bg-[#101828] text-white border-[#101828]'
                      : 'text-[#6a7282] border-gray-200 hover:text-[#101828] hover:bg-gray-50'
                  }`}
                >
                  Authorization
                </button>
                <button
                  onClick={() => setStepFilter('estimate')}
                  className={`px-3 py-1 rounded-md text-[12px] tracking-[-0.15px] transition-all border ${
                    stepFilter === 'estimate'
                      ? 'bg-[#101828] text-white border-[#101828]'
                      : 'text-[#6a7282] border-gray-200 hover:text-[#101828] hover:bg-gray-50'
                  }`}
                >
                  Estimate
                </button>
                <button
                  onClick={() => setStepFilter('forms')}
                  className={`px-3 py-1 rounded-md text-[12px] tracking-[-0.15px] transition-all border ${
                    stepFilter === 'forms'
                      ? 'bg-[#101828] text-white border-[#101828]'
                      : 'text-[#6a7282] border-gray-200 hover:text-[#101828] hover:bg-gray-50'
                  }`}
                >
                  Forms
                </button>
              </div>
            </div>
          </div>

          {/* Bulk action bar */}
          {selectedRows.length > 0 && (
            <div className="flex items-center justify-between px-4 py-2.5 mb-4 bg-blue-50 border border-blue-200 rounded-lg">
              <span className="text-[13px] text-[#101828] font-medium">
                {selectedRows.length} selected
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleBulkRunEligibility}
                  className="px-3 py-1.5 bg-[#101828] text-white rounded-lg text-[12px] font-medium hover:bg-[#1f2937] transition-colors"
                >
                  Run eligibility
                </button>
                <button
                  className="px-3 py-1.5 bg-white border border-gray-300 text-[#101828] rounded-lg text-[12px] font-medium hover:bg-gray-50 transition-colors"
                >
                  Start auth
                </button>
                <button
                  onClick={handleClearSelection}
                  className="px-2 py-1.5 text-[#6a7282] hover:text-[#101828] text-[12px] font-medium transition-colors"
                >
                  Clear
                </button>
              </div>
            </div>
          )}

          {/* Table */}
          <div className="w-full overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-3 py-2.5 text-left w-8">
                    <input
                      type="checkbox"
                      checked={selectedRows.length === filteredItems.length && filteredItems.length > 0}
                      onChange={handleSelectAll}
                      className="size-4 rounded border-gray-300 text-[#101828] focus:ring-2 focus:ring-blue-500 cursor-pointer"
                    />
                  </th>
                  <th className="px-3 py-2.5 text-left">
                    <span className="text-[11px] text-[#6a7282] tracking-[0.05em] uppercase">Work item</span>
                  </th>
                  <th className="px-3 py-2.5 text-left">
                    <span className="text-[11px] text-[#6a7282] tracking-[0.05em] uppercase">Step</span>
                  </th>
                  <th className="px-3 py-2.5 text-left">
                    <span className="text-[11px] text-[#6a7282] tracking-[0.05em] uppercase">Provider / Payer</span>
                  </th>
                  <th className="px-3 py-2.5 text-left">
                    <span className="text-[11px] text-[#6a7282] tracking-[0.05em] uppercase">Visit date / time</span>
                  </th>
                  <th className="px-3 py-2.5 text-right">
                    <span className="text-[11px] text-[#6a7282] tracking-[0.05em] uppercase">Action</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item) => (
                  <Fragment key={item.id}>
                    <tr 
                      className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors cursor-pointer group"
                    >
                      <td className="px-3 py-3" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selectedRows.includes(item.id)}
                          onChange={() => handleRowSelect(item.id)}
                          className="size-4 rounded border-gray-300 text-[#101828] focus:ring-2 focus:ring-blue-500 cursor-pointer"
                        />
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[13px] font-medium text-[#101828] tracking-[-0.15px]">
                            {item.patientName}
                          </span>
                          <span className="text-[12px] text-[#6a7282] tracking-[-0.15px]">
                            Visit · {item.visitReason}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-medium border ${getStepPillStyle(item.step)}`}>
                            {getStepLabel(item.step)}
                          </span>
                          {runningItems.includes(item.id) && (
                            <Loader2 className="size-3.5 text-[#6a7282] animate-spin" />
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[13px] text-[#4a5565] tracking-[-0.15px]">
                            {item.provider}
                          </span>
                          <span className="inline-flex items-center px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-[11px] font-medium w-fit">
                            {item.payer}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[13px] text-[#4a5565] tracking-[-0.15px]">
                            {item.visitDate} · {item.visitTime}
                          </span>
                          <span className="text-[11px] text-[#6a7282]">
                            {item.urgency}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-right">
                        <button
                          onClick={(e) => handleActionClick(e, item.id, item.step)}
                          className={`inline-flex items-center gap-1 text-[13px] transition-colors ${
                            item.step === 'auth-approved'
                              ? 'text-[#99A1AF] cursor-default'
                              : 'text-[#4a5565] hover:text-[#101828] group-hover:text-[#101828]'
                          }`}
                        >
                          <span>{getActionLabel(item.step, item.id)}</span>
                          {!runningItems.includes(item.id) && <ChevronRight className="size-3.5" />}
                        </button>
                      </td>
                    </tr>
                    
                    {/* Expanded shelf row */}
                    {expandedRowId === item.id && expandedType === 'eligibility' && (
                      <tr key={`${item.id}-shelf`}>
                        <td colSpan={6} className="p-0">
                          <EligibilityShelf
                            patientName={item.patientName}
                            payer={item.payer}
                            visitDate={item.visitDate}
                            memberId={item.memberId}
                            groupNumber={item.groupNumber}
                            onComplete={() => {
                              setExpandedRowId(null);
                              setExpandedType(null);
                              console.log('Eligibility check completed for', item.id);
                            }}
                          />
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        </>
        )}
      </div>
    </div>
  );
}