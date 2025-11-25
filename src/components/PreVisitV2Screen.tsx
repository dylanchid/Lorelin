import { useState } from 'react';
import { ChevronDown, ChevronRight, Loader2, Search, Check, X } from 'lucide-react';
import { EligibilityCheckModal } from './EligibilityCheckModal';
import { PreAuthModal } from './PreAuthModal';

type TimeFilter = '3' | '7' | '14';
type RiskFilter = 'all' | 'at-risk' | 'blocked';
type StepFilter = 'all' | 'eligibility' | 'authorization' | 'estimate' | 'forms';

type PreVisitRisk = 'ready' | 'at-risk' | 'blocked';
type PreVisitStep = 'eligibility-pending' | 'eligibility-failed' | 'auth-needed' | 'auth-pending' | 'auth-approved' | 'estimate-not-sent' | 'forms-incomplete' | 'ready';

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

export function PreVisitV2Screen() {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('7');
  const [workListFilter, setWorkListFilter] = useState<TimeFilter>('7');
  const [riskFilter, setRiskFilter] = useState<RiskFilter>('all');
  const [stepFilter, setStepFilter] = useState<StepFilter>('all');
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [runningItems, setRunningItems] = useState<string[]>([]);
  const [modalType, setModalType] = useState<ModalType>(null);
  const [selectedItem, setSelectedItem] = useState<PreVisitItem | null>(null);

  // Mock data
  const preVisitItems: PreVisitItem[] = [
    {
      id: '1',
      patientName: 'K. Williams',
      visitReason: 'Cataract surgery',
      step: 'auth-needed',
      risk: 'blocked',
      provider: 'Dr. Kim',
      payer: 'BCBS',
      visitDate: 'Today',
      visitTime: '10:30 AM',
      urgency: 'Starts in 2 hours',
    },
    {
      id: '2',
      patientName: 'J. Martinez',
      visitReason: 'Annual exam',
      step: 'eligibility-failed',
      risk: 'at-risk',
      provider: 'Dr. Lee',
      payer: 'Aetna PPO',
      visitDate: 'Today',
      visitTime: '2:00 PM',
      urgency: 'Starts in 6 hours',
    },
    {
      id: '3',
      patientName: 'Maria Garcia',
      visitReason: 'Post-op follow-up',
      step: 'eligibility-pending',
      risk: 'at-risk',
      provider: 'Dr. Patel',
      payer: 'Medicare',
      visitDate: 'Tomorrow',
      visitTime: '9:00 AM',
      urgency: 'Tomorrow',
    },
    {
      id: '4',
      patientName: 'S. Chen',
      visitReason: 'Retina consultation',
      step: 'estimate-not-sent',
      risk: 'at-risk',
      provider: 'Dr. Kim',
      payer: 'Humana PPO',
      visitDate: 'Nov 28',
      visitTime: '11:00 AM',
      urgency: 'In 2 days',
    },
    {
      id: '5',
      patientName: 'Linda Brown',
      visitReason: 'AMD injection',
      step: 'forms-incomplete',
      risk: 'at-risk',
      provider: 'Dr. Lee',
      payer: 'UHC',
      visitDate: 'Nov 28',
      visitTime: '3:00 PM',
      urgency: 'In 2 days',
    },
    {
      id: '6',
      patientName: 'David Park',
      visitReason: 'Vision screening',
      step: 'auth-pending',
      risk: 'at-risk',
      provider: 'Dr. Patel',
      payer: 'Cigna PPO',
      visitDate: 'Nov 29',
      visitTime: '1:30 PM',
      urgency: 'In 3 days',
    },
  ];

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
    if (step === 'eligibility-pending' || step === 'auth-pending') {
      return 'bg-slate-50/60 text-slate-600/85 border-slate-200/40';
    }
    if (step === 'eligibility-failed' || step === 'auth-needed') {
      return 'bg-orange-50/60 text-orange-700/85 border-orange-200/40';
    }
    if (step === 'estimate-not-sent' || step === 'forms-incomplete') {
      return 'bg-amber-50/70 text-amber-700/85 border-amber-200/40';
    }
    if (step === 'ready') {
      return 'bg-emerald-50/60 text-emerald-700/85 border-emerald-200/40';
    }
    return 'bg-slate-50/60 text-slate-600/85 border-slate-200/40';
  };

  const getStepLabel = (step: PreVisitStep) => {
    if (step === 'eligibility-pending') return 'Eligibility · Pending';
    if (step === 'eligibility-failed') return 'Eligibility · Failed';
    if (step === 'auth-needed') return 'Authorization · Needed';
    if (step === 'auth-pending') return 'Authorization · Pending';
    if (step === 'auth-approved') return 'Authorization · Approved';
    if (step === 'estimate-not-sent') return 'Estimate · Not sent';
    if (step === 'forms-incomplete') return 'Forms · Incomplete';
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
    if (step === 'eligibility-pending' || step === 'eligibility-failed') return 'Run eligibility';
    if (step === 'auth-needed' || step === 'auth-pending') return 'Start auth';
    if (step === 'ready') return 'Open visit';
    return 'View details';
  };

  const handleActionClick = (e: React.MouseEvent, itemId: string, step: PreVisitStep) => {
    e.stopPropagation();
    const item = preVisitItems.find(i => i.id === itemId);
    if (!item) return;
    
    if (step === 'eligibility-pending' || step === 'eligibility-failed') {
      setSelectedItem(item);
      setModalType('eligibility');
    } else if (step === 'auth-needed' || step === 'auth-pending') {
      setSelectedItem(item);
      setModalType('preauth');
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
                  <tr 
                    key={item.id} 
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
                        className="inline-flex items-center gap-1 text-[13px] text-[#4a5565] hover:text-[#101828] transition-colors group-hover:text-[#101828]"
                      >
                        <span>{getActionLabel(item.step, item.id)}</span>
                        {!runningItems.includes(item.id) && <ChevronRight className="size-3.5" />}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
      
      {/* Modals */}
      {modalType === 'eligibility' && selectedItem && (
        <EligibilityCheckModal
          patientName={selectedItem.patientName}
          payer={selectedItem.payer}
          visitDate={selectedItem.visitDate}
          memberId={selectedItem.memberId}
          groupNumber={selectedItem.groupNumber}
          onClose={() => {
            setModalType(null);
            setSelectedItem(null);
          }}
          onComplete={() => {
            // TODO: Update the item step to ready or another status
            console.log('Eligibility check completed for', selectedItem.id);
          }}
        />
      )}
      
      {modalType === 'preauth' && selectedItem && (
        <PreAuthModal
          patientName={selectedItem.patientName}
          payer={selectedItem.payer}
          visitDate={selectedItem.visitDate}
          visitReason={selectedItem.visitReason}
          memberId={selectedItem.memberId}
          groupNumber={selectedItem.groupNumber}
          onClose={() => {
            setModalType(null);
            setSelectedItem(null);
          }}
          onComplete={() => {
            // TODO: Update the item step to auth-pending or auth-approved
            console.log('Pre-auth submitted for', selectedItem.id);
          }}
        />
      )}
    </div>
  );
}