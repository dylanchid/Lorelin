import { useState } from 'react';
import { Search, ChevronDown, Check } from 'lucide-react';

interface EligibilityShelfProps {
  patientName: string;
  payer: string;
  visitDate: string;
  memberId?: string;
  groupNumber?: string;
  onComplete: () => void;
}

interface EligibilityResult {
  status: 'active' | 'inactive' | 'limited';
  planName: string;
  coverageDates: string;
  deductibleRemaining: string;
  oopRemaining: string;
  coverage: Array<{
    service: string;
    responsibility: string;
  }>;
}

export function EligibilityShelf({
  patientName,
  payer,
  visitDate,
  memberId = '',
  groupNumber = '',
  onComplete,
}: EligibilityShelfProps) {
  const [currentResult, setCurrentResult] = useState<EligibilityResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const handleRunCheck = () => {
    setIsRunning(true);
    
    // Simulate API call
    setTimeout(() => {
      setCurrentResult({
        status: 'active',
        planName: 'Aetna PPO Plus',
        coverageDates: 'Jan 1, 2024 - Dec 31, 2024',
        deductibleRemaining: '$850',
        oopRemaining: '$2,400',
        coverage: [
          { service: 'Office visit', responsibility: '$25 copay' },
          { service: 'Specialist visit', responsibility: '$50 copay' },
          { service: 'Surgery', responsibility: '80/20 after deductible' },
          { service: 'Diagnostic tests', responsibility: 'Covered 100%' },
        ],
      });
      setIsRunning(false);
    }, 2000);
  };

  const getStatusStyle = (status: string) => {
    if (status === 'active') return 'bg-emerald-50/60 text-emerald-700/85 border-emerald-200/40';
    if (status === 'inactive') return 'bg-orange-50/60 text-orange-700/85 border-orange-200/40';
    return 'bg-amber-50/70 text-amber-700/85 border-amber-200/40';
  };

  const getStatusLabel = (status: string) => {
    if (status === 'active') return 'ACTIVE COVERAGE';
    if (status === 'inactive') return 'INACTIVE';
    return 'LIMITED COVERAGE';
  };

  return (
    <div className="px-8 py-6 bg-gray-50 border-t border-gray-200">
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-[14px] font-semibold text-[#101828] tracking-[-0.02em]">
            Eligibility check · {patientName}
          </h3>
          <p className="text-[11px] text-[#6a7282]">
            Front desk · Real-time eligibility
          </p>
        </div>

        {/* Form */}
        <div className="flex flex-wrap items-end gap-3 mb-5">
          {/* Patient */}
          <div className="flex-1 min-w-[200px]">
            <label className="block text-[11px] text-[#6a7282] uppercase tracking-wider mb-1.5">
              Patient
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search patient name or MRN"
                defaultValue={patientName}
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
                defaultValue={payer.toLowerCase().replace(' ', '_')}
                className="w-full appearance-none px-3 py-2 pr-8 bg-white border border-gray-300 rounded-lg text-[13px] text-[#101828] focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent cursor-pointer"
              >
                <option value="">Select payer</option>
                <option value="aetna_ppo">Aetna PPO</option>
                <option value="bcbs">Blue Cross Blue Shield</option>
                <option value="uhc">UnitedHealthcare</option>
                <option value="cigna_ppo">Cigna PPO</option>
                <option value="humana_ppo">Humana PPO</option>
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
              defaultValue={memberId}
              placeholder="Enter ID"
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
              defaultValue={groupNumber}
              placeholder="Group"
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
            disabled={isRunning}
            className="px-6 py-2 bg-[#101828] text-white rounded-lg text-[13px] font-medium hover:bg-[#1f2937] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isRunning ? 'Running...' : 'Run check'}
          </button>
        </div>

        {/* Result area */}
        <div className="pt-5 border-t border-gray-200">
          {currentResult ? (
            <>
              {/* Status + Plan info */}
              <div className="flex items-start justify-between mb-5">
                <div>
                  <div className={`inline-flex px-2.5 py-1 rounded text-[11px] font-medium tracking-wider border mb-2 ${getStatusStyle(currentResult.status)}`}>
                    {getStatusLabel(currentResult.status)}
                  </div>
                  <div className="text-[14px] font-semibold text-[#101828]">{currentResult.planName}</div>
                  <div className="text-[12px] text-[#6a7282] mt-0.5">{currentResult.coverageDates}</div>
                </div>
              </div>

              {/* Two numbers row */}
              <div className="grid grid-cols-2 gap-6 mb-5">
                <div>
                  <div className="text-[11px] text-[#6a7282] mb-1">Deductible remaining</div>
                  <div className="text-[20px] font-semibold text-[#101828] tracking-[-0.02em]">{currentResult.deductibleRemaining}</div>
                </div>
                <div>
                  <div className="text-[11px] text-[#6a7282] mb-1">Out-of-pocket remaining</div>
                  <div className="text-[20px] font-semibold text-[#101828] tracking-[-0.02em]">{currentResult.oopRemaining}</div>
                </div>
              </div>

              {/* Coverage grid */}
              <div className="grid grid-cols-2 gap-3 mb-5">
                {currentResult.coverage.map((item, idx) => (
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
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    onComplete();
                  }}
                  className="px-4 py-2 bg-[#101828] text-white rounded-lg text-[12px] font-medium hover:bg-[#1f2937] transition-colors"
                >
                  Attach to visit
                </button>
                <button className="px-4 py-2 bg-white border border-gray-300 text-[#101828] rounded-lg text-[12px] font-medium hover:bg-gray-50 transition-colors">
                  Copy summary
                </button>
              </div>
            </>
          ) : (
            /* Empty state */
            <div className="py-8 text-center">
              <div className="inline-flex items-center justify-center size-12 rounded-full bg-gray-100 mb-3">
                <Search className="size-6 text-[#6a7282]" />
              </div>
              <h4 className="text-[13px] font-medium text-[#101828] mb-1">No result yet</h4>
              <p className="text-[12px] text-[#6a7282] max-w-sm mx-auto">
                Fill in the patient details above and click "Run check" to see eligibility results here.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
