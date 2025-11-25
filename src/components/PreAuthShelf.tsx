import { useState } from 'react';
import { Search, ChevronDown, Clock } from 'lucide-react';

interface PreAuthShelfProps {
  patientName: string;
  payer: string;
  visitDate: string;
  visitReason: string;
  memberId?: string;
  groupNumber?: string;
  onComplete: () => void;
}

interface AuthResult {
  status: 'pending' | 'approved' | 'denied';
  authNumber: string;
  validFrom: string;
  validUntil: string;
  unitsApproved: string;
}

export function PreAuthShelf({
  patientName,
  payer,
  visitDate,
  visitReason,
  memberId = '',
  groupNumber = '',
  onComplete,
}: PreAuthShelfProps) {
  const [currentResult, setCurrentResult] = useState<AuthResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitAuth = () => {
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setCurrentResult({
        status: 'pending',
        authNumber: 'AUTH-2024-0892',
        validFrom: 'Nov 26, 2024',
        validUntil: 'Dec 26, 2024',
        unitsApproved: '1 procedure',
      });
      setIsSubmitting(false);
    }, 2000);
  };

  const getStatusStyle = (status: string) => {
    if (status === 'approved') return 'bg-emerald-50/60 text-emerald-700/85 border-emerald-200/40';
    if (status === 'denied') return 'bg-orange-50/60 text-orange-700/85 border-orange-200/40';
    return 'bg-slate-50/60 text-slate-600/85 border-slate-200/40';
  };

  const getStatusLabel = (status: string) => {
    if (status === 'approved') return 'APPROVED';
    if (status === 'denied') return 'DENIED';
    return 'PENDING REVIEW';
  };

  return (
    <div className="px-8 py-6 bg-gray-50 border-t border-gray-200">
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-[14px] font-semibold text-[#101828] tracking-[-0.02em]">
            Authorization · {patientName}
          </h3>
          <p className="text-[11px] text-[#6a7282]">
            Front desk · Pre-authorization
          </p>
        </div>

        {/* Form */}
        <div className="flex flex-wrap items-end gap-3 mb-4">
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
        </div>

        {/* Second row - CPT/Procedure */}
        <div className="flex flex-wrap items-end gap-3 mb-5">
          <div className="flex-1 min-w-[300px]">
            <label className="block text-[11px] text-[#6a7282] uppercase tracking-wider mb-1.5">
              CPT / Procedure
            </label>
            <div className="relative">
              <select
                defaultValue={visitReason.toLowerCase().replace(' ', '_')}
                className="w-full appearance-none px-3 py-2 pr-8 bg-white border border-gray-300 rounded-lg text-[13px] text-[#101828] focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent cursor-pointer"
              >
                <option value="">Select procedure or enter CPT</option>
                <option value="cataract_surgery">66984 - Cataract surgery with IOL</option>
                <option value="retina_consultation">92134 - Retina consultation with imaging</option>
                <option value="amd_injection">67028 - AMD injection (anti-VEGF)</option>
                <option value="glaucoma_surgery">65850 - Glaucoma drainage implant</option>
                <option value="annual_exam">92004 - Comprehensive eye exam</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 size-4 text-[#6a7282] pointer-events-none" />
            </div>
          </div>

          {/* Submit auth button */}
          <button
            onClick={handleSubmitAuth}
            disabled={isSubmitting}
            className="px-6 py-2 bg-[#101828] text-white rounded-lg text-[13px] font-medium hover:bg-[#1f2937] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Submitting...' : 'Start auth'}
          </button>
        </div>

        {/* Result area */}
        <div className="pt-5 border-t border-gray-200">
          {currentResult ? (
            <>
              {/* Status badge */}
              <div className="mb-5">
                <div className={`inline-flex px-2.5 py-1 rounded text-[11px] font-medium tracking-wider border mb-3 ${getStatusStyle(currentResult.status)}`}>
                  {getStatusLabel(currentResult.status)}
                </div>
                
                {/* Auth details grid */}
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <div className="text-[11px] text-[#6a7282] mb-1">Authorization number</div>
                    <div className="text-[14px] font-semibold text-[#101828]">{currentResult.authNumber}</div>
                  </div>
                  <div>
                    <div className="text-[11px] text-[#6a7282] mb-1">Units approved</div>
                    <div className="text-[14px] font-semibold text-[#101828]">{currentResult.unitsApproved}</div>
                  </div>
                  <div>
                    <div className="text-[11px] text-[#6a7282] mb-1">Valid from</div>
                    <div className="text-[13px] text-[#101828]">{currentResult.validFrom}</div>
                  </div>
                  <div>
                    <div className="text-[11px] text-[#6a7282] mb-1">Valid until</div>
                    <div className="text-[13px] text-[#101828]">{currentResult.validUntil}</div>
                  </div>
                </div>
              </div>

              {/* Info message for pending */}
              {currentResult.status === 'pending' && (
                <div className="flex items-start gap-3 px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg mb-5">
                  <Clock className="size-4 text-blue-600 mt-0.5 shrink-0" />
                  <div className="flex-1">
                    <div className="text-[12px] font-medium text-blue-900 mb-0.5">
                      Authorization submitted
                    </div>
                    <div className="text-[12px] text-blue-700">
                      The payer typically responds within 24-48 hours. We'll notify you when there's an update.
                    </div>
                  </div>
                </div>
              )}

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
                  Copy auth details
                </button>
              </div>
            </>
          ) : (
            /* Empty state */
            <div className="py-8 text-center">
              <div className="inline-flex items-center justify-center size-12 rounded-full bg-gray-100 mb-3">
                <Search className="size-6 text-[#6a7282]" />
              </div>
              <h4 className="text-[13px] font-medium text-[#101828] mb-1">No request submitted yet</h4>
              <p className="text-[12px] text-[#6a7282] max-w-sm mx-auto">
                Fill in the patient and procedure details above and click "Start auth" to submit an authorization request.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
