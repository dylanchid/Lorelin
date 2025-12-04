import { useState } from 'react';
import { ArrowLeft, Check, X, AlertCircle, Loader2, ChevronDown } from 'lucide-react';

interface EligibilityWorkspaceScreenProps {
  onBack: () => void;
  patientName?: string;
  patientId?: string;
  payer?: string;
  visitReason?: string;
  provider?: string;
  visitDate?: string;
  visitTime?: string;
  memberId?: string;
  groupNumber?: string;
}

type EligibilityStatus = 'pending' | 'verified' | 'failed';
type CheckMethod = 'lorelin' | 'manual';

interface HistoryEntry {
  timestamp: string;
  status: EligibilityStatus;
  method: CheckMethod;
  note?: string;
}

export function EligibilityWorkspaceScreen({ 
  onBack,
  patientName = 'K. Williams',
  patientId = '12345',
  payer = 'BCBS PPO',
  visitReason = 'Cataract surgery · Right eye',
  provider = 'Dr. Ganti',
  visitDate = 'Dec 8',
  visitTime = '10:30 AM',
  memberId = 'W123456789',
  groupNumber = '98765'
}: EligibilityWorkspaceScreenProps) {
  const [eligibilityStatus, setEligibilityStatus] = useState<EligibilityStatus>('pending');
  const [isChecking, setIsChecking] = useState(false);
  const [checkingStep, setCheckingStep] = useState(0);
  const [loreleinAvailable] = useState(true); // Could be determined by payer
  const [notes, setNotes] = useState('');
  const [showManualForm, setShowManualForm] = useState(false);
  const [manualResult, setManualResult] = useState<'verified' | 'failed'>('verified');
  const [manualNotes, setManualNotes] = useState('');
  
  const [history, setHistory] = useState<HistoryEntry[]>([
    {
      timestamp: 'Nov 1 · 10:02 AM',
      status: 'failed',
      method: 'lorelin',
      note: 'Coverage terminated 10/31/2025'
    },
    {
      timestamp: 'Oct 1 · 09:30 AM',
      status: 'verified',
      method: 'manual',
      note: 'Patient switching plans'
    }
  ]);

  const [currentResult, setCurrentResult] = useState<any>(null);

  const handleRunCheck = () => {
    setIsChecking(true);
    setCheckingStep(0);
    
    // Simulate check progress
    setTimeout(() => setCheckingStep(1), 800);
    setTimeout(() => setCheckingStep(2), 2000);
    
    // Simulate successful check
    setTimeout(() => {
      setIsChecking(false);
      setEligibilityStatus('verified');
      setCurrentResult({
        status: 'active',
        planName: 'Blue Cross Blue Shield PPO',
        effectiveDates: '01/01/2025–12/31/2025',
        officeVisitCopay: '$40',
        deductibleRemaining: '$600'
      });
      setHistory([
        {
          timestamp: 'Today · ' + new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
          status: 'verified',
          method: 'lorelin',
          note: 'Real-time check via Lorelin'
        },
        ...history
      ]);
    }, 3000);
  };

  const handleManualVerification = () => {
    setShowManualForm(!showManualForm);
  };

  const handleSaveManualVerification = () => {
    const newStatus = manualResult === 'verified' ? 'verified' : 'failed';
    setEligibilityStatus(newStatus);
    setHistory([
      {
        timestamp: 'Today · ' + new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
        status: newStatus,
        method: 'manual',
        note: manualNotes || 'Manual verification'
      },
      ...history
    ]);
    setShowManualForm(false);
    setManualNotes('');
    
    if (newStatus === 'verified') {
      setCurrentResult({
        status: 'active',
        planName: 'Blue Cross Blue Shield PPO',
        effectiveDates: '01/01/2025–12/31/2025',
        officeVisitCopay: '$40',
        deductibleRemaining: '$600'
      });
    }
  };

  const getStatusChipStyle = (status: EligibilityStatus) => {
    if (status === 'verified') return 'bg-emerald-50/70 text-emerald-700/90 border-emerald-200/40';
    if (status === 'failed') return 'bg-red-50/70 text-red-700/90 border-red-200/40';
    return 'bg-amber-50/70 text-amber-700/90 border-amber-200/40';
  };

  const getStatusLabel = (status: EligibilityStatus) => {
    if (status === 'verified') return 'Eligibility – Verified';
    if (status === 'failed') return 'Eligibility – Failed';
    return 'Eligibility – Pending';
  };

  const getStatusBadge = (status: EligibilityStatus) => {
    if (status === 'verified') return { icon: Check, text: 'Eligibility verified', style: 'text-emerald-700' };
    if (status === 'failed') return { icon: X, text: 'Eligibility failed', style: 'text-red-700' };
    return { icon: AlertCircle, text: 'Eligibility pending', style: 'text-amber-700' };
  };

  const checkingMessages = [
    'Contacting BCBS...',
    'Parsing response...',
    'Finalizing...'
  ];

  const statusBadge = getStatusBadge(eligibilityStatus);
  const StatusIcon = statusBadge.icon;

  return (
    <div className="bg-[#f5f5f7] size-full overflow-auto">
      <div className="max-w-[1400px] mx-auto px-[60px] py-[32px] pb-[60px]">
        
        {/* Top header bar */}
        <div className="w-full mb-6">
          <div className="flex items-start justify-between mb-3">
            <div className="flex flex-col gap-2">
              <button 
                onClick={onBack}
                className="flex items-center gap-1.5 text-[13px] text-[#6a7282] hover:text-[#101828] transition-colors tracking-[-0.15px] w-fit"
              >
                <ArrowLeft className="size-3.5" />
                <span>Pre-Visit</span>
              </button>
              <h1 className="text-[26px] font-semibold text-[#101828] tracking-[-0.4px] leading-tight">
                {patientName} · {visitReason}
              </h1>
              <p className="text-[13px] text-[#6a7282] tracking-[-0.15px]">
                ID {patientId} · {payer} · {provider} · {visitDate} · {visitTime}
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] border ${getStatusChipStyle(eligibilityStatus)}`}>
                  {getStatusLabel(eligibilityStatus)}
                </span>
                {loreleinAvailable && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] border bg-emerald-50/80 text-emerald-700/90 border-emerald-200/40">
                    <div className="size-1.5 rounded-full bg-emerald-500" />
                    Lorelin check
                  </span>
                )}
                {!loreleinAvailable && (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] border bg-gray-50/70 text-gray-600/90 border-gray-200/40">
                    Manual only
                  </span>
                )}
              </div>
              <button className="flex items-center gap-1.5 px-3 py-1.5 text-[13px] text-[#4a5565] border border-gray-200 rounded-md hover:bg-gray-50 transition-colors tracking-[-0.15px]">
                <span>Assign</span>
                <ChevronDown className="size-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-2 gap-6">
          
          {/* LEFT COLUMN - Case context */}
          <div className="space-y-6">
            
            {/* Card A: Patient & insurance */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
              <h2 className="text-[15px] font-semibold text-[#101828] mb-4">Patient & insurance</h2>
              
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[11px] text-[#99A1AF] uppercase tracking-wider block mb-1">Name</span>
                    <span className="text-[13px] text-[#101828]">{patientName}</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-[#99A1AF] uppercase tracking-wider block mb-1">DOB</span>
                    <span className="text-[13px] text-[#101828]">03/15/1949</span>
                  </div>
                </div>
                
                <div>
                  <span className="text-[11px] text-[#99A1AF] uppercase tracking-wider block mb-1">Sex</span>
                  <span className="text-[13px] text-[#101828]">Female</span>
                </div>

                <div className="pt-3 border-t border-gray-200">
                  <span className="text-[11px] text-[#99A1AF] uppercase tracking-wider block mb-1">Payer & plan</span>
                  <span className="text-[13px] text-[#101828]">{payer}</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[11px] text-[#99A1AF] uppercase tracking-wider block mb-1">Member ID</span>
                    <span className="text-[13px] text-[#101828] font-mono">{memberId}</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-[#99A1AF] uppercase tracking-wider block mb-1">Group ID</span>
                    <span className="text-[13px] text-[#101828] font-mono">{groupNumber}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-200">
                  <div className={`flex items-center gap-2 ${statusBadge.style}`}>
                    <StatusIcon className="size-4" />
                    <span className="text-[13px] font-medium">{statusBadge.text}</span>
                  </div>
                  {history.length > 0 && (
                    <p className="text-[12px] text-[#6a7282] mt-1">
                      Last checked: {history[0].timestamp}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Card B: Visit / service summary */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
              <h2 className="text-[15px] font-semibold text-[#101828] mb-4">Visit / service summary</h2>
              
              <div className="space-y-3">
                <div>
                  <span className="text-[11px] text-[#99A1AF] uppercase tracking-wider block mb-1">Visit date/time</span>
                  <span className="text-[13px] text-[#101828]">{visitDate} · {visitTime}</span>
                </div>
                
                <div>
                  <span className="text-[11px] text-[#99A1AF] uppercase tracking-wider block mb-1">Location / facility</span>
                  <span className="text-[13px] text-[#101828]">Main Office · Suite 200</span>
                </div>

                <div>
                  <span className="text-[11px] text-[#99A1AF] uppercase tracking-wider block mb-1">Visit / procedure type</span>
                  <span className="text-[13px] text-[#101828]">{visitReason}</span>
                </div>

                <div className="pt-3 border-t border-gray-200">
                  <button className="text-[13px] text-[#4a5565] hover:text-[#101828] transition-colors">
                    View auth workspace →
                  </button>
                </div>
              </div>
            </div>

            {/* Card C: Notes for eligibility */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
              <h2 className="text-[15px] font-semibold text-[#101828] mb-4">Notes for eligibility</h2>
              
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add internal notes about eligibility..."
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-[13px] text-[#101828] placeholder:text-[#99A1AF] focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                rows={4}
              />
              <p className="text-[11px] text-[#6a7282] mt-2">
                Internal notes only. Not sent to payer.
              </p>
            </div>
          </div>

          {/* RIGHT COLUMN - Eligibility actions */}
          <div className="space-y-6">
            
            {/* Card 1: Eligibility request details */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
              <h2 className="text-[15px] font-semibold text-[#101828] mb-4">Eligibility request details</h2>
              
              <div className="space-y-3">
                <div>
                  <span className="text-[11px] text-[#99A1AF] uppercase tracking-wider block mb-1">Payer & plan</span>
                  <span className="text-[13px] text-[#101828]">{payer} · Plan 12345</span>
                </div>
                
                <div>
                  <span className="text-[11px] text-[#99A1AF] uppercase tracking-wider block mb-1">Service type</span>
                  <span className="text-[13px] text-[#101828]">Ophthalmic surgery</span>
                </div>

                <div>
                  <span className="text-[11px] text-[#99A1AF] uppercase tracking-wider block mb-1">Date of service</span>
                  <span className="text-[13px] text-[#101828]">{visitDate}</span>
                </div>

                <div>
                  <span className="text-[11px] text-[#99A1AF] uppercase tracking-wider block mb-1">Patient details</span>
                  <span className="text-[13px] text-[#101828]">{patientName} · DOB 03/15/1949 · {memberId}</span>
                </div>

                <div>
                  <span className="text-[11px] text-[#99A1AF] uppercase tracking-wider block mb-1">Benefit type</span>
                  <span className="text-[13px] text-[#101828]">Medical benefits</span>
                </div>
              </div>

              <p className="text-[11px] text-[#6a7282] mt-4">
                These details are used when Lorelin checks eligibility with the payer.
              </p>
            </div>

            {/* Card 2: Check coverage */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
              <h2 className="text-[15px] font-semibold text-[#101828] mb-4">Check coverage</h2>
              
              {isChecking ? (
                // Loading state
                <div className="py-8 text-center">
                  <Loader2 className="size-8 animate-spin text-[#101828] mx-auto mb-3" />
                  <p className="text-[14px] text-[#101828] font-medium mb-1">
                    {checkingMessages[checkingStep] || checkingMessages[checkingMessages.length - 1]}
                  </p>
                  <p className="text-[12px] text-[#6a7282]">
                    This usually takes a few seconds.
                  </p>
                </div>
              ) : eligibilityStatus === 'pending' ? (
                // Pending state
                <>
                  {loreleinAvailable && (
                    <div className="flex items-start gap-2 mb-4 p-3 bg-emerald-50/50 border border-emerald-200/40 rounded-lg">
                      <Check className="size-4 text-emerald-700 mt-0.5 shrink-0" />
                      <p className="text-[13px] text-emerald-900">
                        Lorelin can check eligibility with {payer.split(' ')[0]} for this visit.
                      </p>
                    </div>
                  )}
                  
                  {!loreleinAvailable && (
                    <div className="flex items-start gap-2 mb-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                      <AlertCircle className="size-4 text-gray-600 mt-0.5 shrink-0" />
                      <p className="text-[13px] text-gray-700">
                        Lorelin cannot run eligibility checks for this payer yet.
                      </p>
                    </div>
                  )}

                  {loreleinAvailable && (
                    <button
                      onClick={handleRunCheck}
                      className="w-full px-6 py-3 bg-[#101828] text-white rounded-lg text-[14px] font-medium hover:bg-[#1f2937] transition-colors mb-3"
                    >
                      Run eligibility check
                    </button>
                  )}
                  
                  <button
                    onClick={handleManualVerification}
                    className="w-full text-[13px] text-[#4a5565] hover:text-[#101828] transition-colors"
                  >
                    Record manual verification
                  </button>
                </>
              ) : eligibilityStatus === 'verified' ? (
                // Verified state
                <>
                  <div className="flex items-start gap-2 mb-4 p-3 bg-emerald-50/50 border border-emerald-200/40 rounded-lg">
                    <Check className="size-4 text-emerald-700 mt-0.5 shrink-0" />
                    <div className="flex-1">
                      <p className="text-[13px] text-emerald-900 font-medium mb-1">
                        Eligibility verified with {payer.split(' ')[0]}
                      </p>
                      <p className="text-[12px] text-emerald-800">
                        Last checked: {history[0].timestamp}
                      </p>
                      <p className="text-[12px] text-emerald-800">
                        Method: {history[0].method === 'lorelin' ? 'Real-time check via Lorelin' : 'Manual call'}
                      </p>
                    </div>
                  </div>
                  
                  <button
                    onClick={handleRunCheck}
                    className="w-full px-6 py-2.5 bg-white border border-gray-300 text-[#101828] rounded-lg text-[13px] font-medium hover:bg-gray-50 transition-colors mb-3"
                  >
                    Re-run eligibility check
                  </button>
                  
                  <button
                    onClick={handleManualVerification}
                    className="w-full text-[13px] text-[#4a5565] hover:text-[#101828] transition-colors"
                  >
                    Record manual verification
                  </button>
                </>
              ) : (
                // Failed state
                <>
                  <div className="flex items-start gap-2 mb-4 p-3 bg-red-50/50 border border-red-200/40 rounded-lg">
                    <X className="size-4 text-red-700 mt-0.5 shrink-0" />
                    <div className="flex-1">
                      <p className="text-[13px] text-red-900 font-medium mb-1">
                        Eligibility check failed
                      </p>
                      <p className="text-[12px] text-red-800">
                        Member ID not found
                      </p>
                    </div>
                  </div>
                  
                  <p className="text-[12px] text-[#6a7282] mb-4">
                    Please confirm insurance details with the patient and update the record before retrying.
                  </p>
                  
                  <button
                    onClick={handleRunCheck}
                    className="w-full px-6 py-3 bg-[#101828] text-white rounded-lg text-[14px] font-medium hover:bg-[#1f2937] transition-colors mb-3"
                  >
                    Retry check
                  </button>
                  
                  <button
                    onClick={handleManualVerification}
                    className="w-full text-[13px] text-[#4a5565] hover:text-[#101828] transition-colors"
                  >
                    Record manual verification
                  </button>
                </>
              )}

              {/* Manual verification form */}
              {showManualForm && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h3 className="text-[13px] font-semibold text-[#101828] mb-3">Record manual verification</h3>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="text-[11px] text-[#99A1AF] uppercase tracking-wider block mb-1">Result</label>
                      <div className="relative">
                        <select
                          value={manualResult}
                          onChange={(e) => setManualResult(e.target.value as 'verified' | 'failed')}
                          className="w-full appearance-none px-3 py-2 pr-8 bg-white border border-gray-300 rounded-lg text-[13px] text-[#101828] focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent cursor-pointer"
                        >
                          <option value="verified">Verified</option>
                          <option value="failed">Failed</option>
                        </select>
                        <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 size-4 text-[#6a7282] pointer-events-none" />
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] text-[#99A1AF] uppercase tracking-wider block mb-1">Notes</label>
                      <textarea
                        value={manualNotes}
                        onChange={(e) => setManualNotes(e.target.value)}
                        placeholder="Add notes about this manual verification..."
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-[13px] text-[#101828] placeholder:text-[#99A1AF] focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                        rows={3}
                      />
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={handleSaveManualVerification}
                        className="flex-1 px-4 py-2 bg-[#101828] text-white rounded-lg text-[13px] font-medium hover:bg-[#1f2937] transition-colors"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setShowManualForm(false)}
                        className="flex-1 px-4 py-2 bg-white border border-gray-300 text-[#101828] rounded-lg text-[13px] font-medium hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Card 3: Result & history */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
              <h2 className="text-[15px] font-semibold text-[#101828] mb-4">Result & history</h2>
              
              {/* Current result */}
              <div className="mb-6 pb-6 border-b border-gray-200">
                <h3 className="text-[11px] text-[#99A1AF] uppercase tracking-wider mb-2">Current result</h3>
                
                {eligibilityStatus === 'verified' && currentResult ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-emerald-700 mb-2">
                      <Check className="size-4" />
                      <span className="text-[13px] font-medium">Status: Active coverage</span>
                    </div>
                    <p className="text-[13px] text-[#101828]">{currentResult.planName}</p>
                    <p className="text-[12px] text-[#6a7282]">Effective: {currentResult.effectiveDates}</p>
                    <div className="mt-3 pt-3 border-t border-gray-200 space-y-1">
                      <p className="text-[12px] text-[#4a5565]">Office visit copay: {currentResult.officeVisitCopay}</p>
                      <p className="text-[12px] text-[#4a5565]">Deductible remaining: {currentResult.deductibleRemaining}</p>
                    </div>
                  </div>
                ) : eligibilityStatus === 'failed' ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-red-700 mb-2">
                      <X className="size-4" />
                      <span className="text-[13px] font-medium">Status: Coverage not active / could not be verified</span>
                    </div>
                    <p className="text-[12px] text-[#6a7282]">Reason: Member ID not found</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-amber-700 mb-2">
                      <AlertCircle className="size-4" />
                      <span className="text-[13px] font-medium">Status: Pending – no recent eligibility check on file</span>
                    </div>
                  </div>
                )}
              </div>

              {/* History */}
              <div>
                <h3 className="text-[11px] text-[#99A1AF] uppercase tracking-wider mb-3">History</h3>
                
                <div className="space-y-3">
                  {history.map((entry, idx) => (
                    <div key={idx} className="flex gap-3">
                      <div className="shrink-0 mt-1">
                        {entry.status === 'verified' && (
                          <div className="size-5 rounded-full bg-emerald-100 flex items-center justify-center">
                            <Check className="size-3 text-emerald-700" />
                          </div>
                        )}
                        {entry.status === 'failed' && (
                          <div className="size-5 rounded-full bg-red-100 flex items-center justify-center">
                            <X className="size-3 text-red-700" />
                          </div>
                        )}
                        {entry.status === 'pending' && (
                          <div className="size-5 rounded-full bg-amber-100 flex items-center justify-center">
                            <AlertCircle className="size-3 text-amber-700" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-[12px] text-[#4a5565]">
                          <span className="font-medium">{entry.timestamp}</span> – {' '}
                          {entry.status === 'verified' ? 'Eligibility verified' : entry.status === 'failed' ? 'Eligibility failed' : 'Eligibility pending'}
                          {' '}({entry.method === 'lorelin' ? 'real-time check via Lorelin' : 'manual call'})
                        </p>
                        {entry.note && (
                          <p className="text-[11px] text-[#6a7282] mt-0.5">{entry.note}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}