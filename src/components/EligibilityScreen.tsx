import { useState } from 'react';
import { Search, ChevronDown, Check, Download, Copy, Link, X } from 'lucide-react';

type EligibilityStatus = 'active' | 'inactive' | 'needs-review';

interface CoverageItem {
  service: string;
  responsibility: string;
}

interface EligibilityResult {
  id: string;
  patient: string;
  payer: string;
  status: EligibilityStatus;
  date: string;
  deductibleRemaining: string;
  deductibleTotal: string;
  oopRemaining: string;
  oopTotal: string;
  planType: string;
  planName: string;
  coverageDates: string;
  network: string;
  coverage: CoverageItem[];
}

export function EligibilityScreen() {
  const [currentResult, setCurrentResult] = useState<EligibilityResult | null>(null);
  const [selectedCheckId, setSelectedCheckId] = useState<string | null>(null);

  // Mock result data
  const mockResults: Record<string, EligibilityResult> = {
    '1': {
      id: '1',
      patient: 'J. Martinez',
      payer: 'Aetna PPO',
      status: 'active',
      date: 'Today',
      deductibleRemaining: '$320',
      deductibleTotal: '$500',
      oopRemaining: '$1,200',
      oopTotal: '$3,000',
      planType: 'PPO',
      planName: 'Aetna Choice POS II',
      coverageDates: 'Jan 1, 2025 – Dec 31, 2025',
      network: 'In-network',
      coverage: [
        { service: 'Office visit', responsibility: '$25 copay' },
        { service: 'Telemed visit', responsibility: '$15 copay' },
        { service: 'EKG / diagnostics', responsibility: '20% after deductible' },
        { service: 'Vaccines / immunizations', responsibility: '$0 (preventive)' },
      ],
    },
    '2': {
      id: '2',
      patient: 'Maria Garcia',
      payer: 'Medicare',
      status: 'active',
      date: 'Tomorrow',
      deductibleRemaining: '$0',
      deductibleTotal: '$226',
      oopRemaining: '$0',
      oopTotal: '$226',
      planType: 'Traditional Medicare',
      planName: 'Medicare Part B',
      coverageDates: 'Continuous',
      network: 'Medicare-approved',
      coverage: [
        { service: 'Office visit', responsibility: '20% coinsurance' },
        { service: 'Telemed visit', responsibility: '20% coinsurance' },
        { service: 'EKG / diagnostics', responsibility: '20% coinsurance' },
        { service: 'Vaccines / immunizations', responsibility: '$0 (preventive)' },
      ],
    },
    '3': {
      id: '3',
      patient: 'K. Williams',
      payer: 'BCBS',
      status: 'needs-review',
      date: 'Jan 29',
      deductibleRemaining: '$1,500',
      deductibleTotal: '$2,000',
      oopRemaining: '$4,200',
      oopTotal: '$6,000',
      planType: 'HDHP',
      planName: 'Blue Cross PPO High Deductible',
      coverageDates: 'Jan 1, 2025 – Dec 31, 2025',
      network: 'In-network',
      coverage: [
        { service: 'Office visit', responsibility: '100% until deductible met' },
        { service: 'Telemed visit', responsibility: '100% until deductible met' },
        { service: 'EKG / diagnostics', responsibility: '100% until deductible met' },
        { service: 'Vaccines / immunizations', responsibility: '$0 (preventive)' },
      ],
    },
    '4': {
      id: '4',
      patient: 'S. Chen',
      payer: 'Humana PPO',
      status: 'inactive',
      date: 'Jan 28',
      deductibleRemaining: '$500',
      deductibleTotal: '$500',
      oopRemaining: '$3,000',
      oopTotal: '$3,000',
      planType: 'PPO',
      planName: 'Humana Gold Plus',
      coverageDates: 'Coverage terminated Dec 31, 2024',
      network: 'In-network',
      coverage: [
        { service: 'Office visit', responsibility: 'Coverage inactive' },
        { service: 'Telemed visit', responsibility: 'Coverage inactive' },
        { service: 'EKG / diagnostics', responsibility: 'Coverage inactive' },
        { service: 'Vaccines / immunizations', responsibility: 'Coverage inactive' },
      ],
    },
  };

  const recentChecks = [
    {
      id: '1',
      patient: 'J. Martinez',
      payer: 'Aetna PPO',
      status: 'active' as EligibilityStatus,
      dateOfVisit: 'Today',
      checkedBy: 'Sarah L.',
      summary: 'Active · $25 OV copay · $320 ded left',
    },
    {
      id: '2',
      patient: 'Maria Garcia',
      payer: 'Medicare',
      status: 'active' as EligibilityStatus,
      dateOfVisit: 'Tomorrow',
      checkedBy: 'Sarah L.',
      summary: 'Active · 20% coinsurance · $0 ded left',
    },
    {
      id: '3',
      patient: 'K. Williams',
      payer: 'BCBS',
      status: 'needs-review' as EligibilityStatus,
      dateOfVisit: 'Jan 29',
      checkedBy: 'Alex M.',
      summary: 'Needs review · $1,500 ded left',
    },
    {
      id: '4',
      patient: 'S. Chen',
      payer: 'Humana PPO',
      status: 'inactive' as EligibilityStatus,
      dateOfVisit: 'Jan 28',
      checkedBy: 'Sarah L.',
      summary: 'Inactive · Coverage terminated',
    },
  ];

  const getStatusStyle = (status: EligibilityStatus) => {
    if (status === 'active') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (status === 'inactive') return 'bg-red-50 text-red-700 border-red-200';
    return 'bg-amber-50 text-amber-700 border-amber-200';
  };

  const getStatusLabel = (status: EligibilityStatus) => {
    if (status === 'active') return 'Active';
    if (status === 'inactive') return 'Inactive';
    return 'Needs manual review';
  };

  const handleRunCheck = () => {
    setCurrentResult(mockResults['1']);
  };

  const handleRowClick = (id: string) => {
    setSelectedCheckId(id);
  };

  const selectedResult = selectedCheckId ? mockResults[selectedCheckId] : null;

  return (
    <div className="overflow-auto size-full bg-[#f5f5f7]">
      <div className="max-w-[1400px] mx-auto px-[60px] py-[32px] pb-[60px]">
        
        {/* Card 1: New eligibility check */}
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

            {/* Compact result area - always visible */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              {currentResult ? (
                <>
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
                </>
              ) : (
                /* Empty state */
                <div className="py-12 text-center">
                  <div className="inline-flex items-center justify-center size-12 rounded-full bg-gray-100 mb-4">
                    <Search className="size-6 text-[#6a7282]" />
                  </div>
                  <h3 className="text-[14px] font-medium text-[#101828] mb-1">No result yet</h3>
                  <p className="text-[12px] text-[#6a7282] max-w-sm mx-auto">
                    Fill in the patient details above and click "Run check" to see eligibility results here.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Card 3: Recent eligibility checks */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="px-8 py-6">
            <h2 className="text-[16px] font-semibold text-[#101828] tracking-[-0.02em] mb-6">
              Recent eligibility checks
            </h2>

            {/* Table */}
            <div className="w-full overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="px-3 py-2.5 text-left">
                      <span className="text-[11px] text-[#6a7282] tracking-[0.05em] uppercase">Patient</span>
                    </th>
                    <th className="px-3 py-2.5 text-left">
                      <span className="text-[11px] text-[#6a7282] tracking-[0.05em] uppercase">Payer</span>
                    </th>
                    <th className="px-3 py-2.5 text-left">
                      <span className="text-[11px] text-[#6a7282] tracking-[0.05em] uppercase">Status</span>
                    </th>
                    <th className="px-3 py-2.5 text-left">
                      <span className="text-[11px] text-[#6a7282] tracking-[0.05em] uppercase">Summary</span>
                    </th>
                    <th className="px-3 py-2.5 text-left">
                      <span className="text-[11px] text-[#6a7282] tracking-[0.05em] uppercase">Date of visit</span>
                    </th>
                    <th className="px-3 py-2.5 text-left">
                      <span className="text-[11px] text-[#6a7282] tracking-[0.05em] uppercase">Checked by</span>
                    </th>
                    <th className="px-3 py-2.5 text-right">
                      <span className="text-[11px] text-[#6a7282] tracking-[0.05em] uppercase">Action</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recentChecks.map((check) => (
                    <tr 
                      key={check.id}
                      className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => handleRowClick(check.id)}
                    >
                      <td className="px-3 py-3">
                        <span className="text-[13px] font-medium text-[#101828] tracking-[-0.15px]">
                          {check.patient}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <span className="text-[13px] text-[#4a5565] tracking-[-0.15px]">
                          {check.payer}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <span className={`inline-flex px-2 py-0.5 rounded text-[11px] font-medium border ${getStatusStyle(check.status)}`}>
                          {getStatusLabel(check.status)}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <span className="text-[12px] text-[#6a7282] tracking-[-0.15px]">
                          {check.summary}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <span className="text-[13px] text-[#4a5565] tracking-[-0.15px]">
                          {check.dateOfVisit}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <span className="text-[13px] text-[#4a5565] tracking-[-0.15px]">
                          {check.checkedBy}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <span className="text-[11px] text-[#6a7282] font-medium">View</span>
                          <ChevronDown className="size-4 text-[#99A1AF] -rotate-90" />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>

      {/* Slide-over panel */}
      {selectedResult && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/20 z-40"
            onClick={() => setSelectedCheckId(null)}
          />
          
          {/* Panel */}
          <div className="fixed top-0 right-0 bottom-0 w-[480px] bg-white shadow-2xl z-50 overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="text-[14px] font-semibold text-[#101828]">{selectedResult.patient}</h3>
                <p className="text-[12px] text-[#6a7282] mt-0.5">{selectedResult.payer} · {selectedResult.date}</p>
              </div>
              <button 
                onClick={() => setSelectedCheckId(null)}
                className="text-[#6a7282] hover:text-[#101828] transition-colors"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-6">
              {/* Status pill */}
              <div className={`inline-flex px-3 py-1 rounded-full text-[11px] font-semibold tracking-wider border mb-6 ${getStatusStyle(selectedResult.status)}`}>
                {getStatusLabel(selectedResult.status)}
              </div>

              {/* Plan info */}
              <div className="mb-6 pb-6 border-b border-gray-200">
                <div className="text-[14px] font-semibold text-[#101828] mb-1">{selectedResult.planName}</div>
                <div className="text-[12px] text-[#6a7282]">{selectedResult.coverageDates}</div>
                <div className="text-[11px] text-[#6a7282] mt-2">
                  {selectedResult.planType} · {selectedResult.network}
                </div>
              </div>

              {/* Financial snapshot */}
              <div className="mb-6">
                <h4 className="text-[11px] text-[#99A1AF] uppercase tracking-wider mb-4">Financial snapshot</h4>
                
                <div className="space-y-4">
                  <div>
                    <div className="text-[11px] text-[#6a7282] mb-1">Deductible remaining</div>
                    <div className="text-[20px] font-semibold text-[#101828] tracking-[-0.02em]">
                      {selectedResult.deductibleRemaining} <span className="text-[14px] text-[#6a7282] font-normal">of {selectedResult.deductibleTotal}</span>
                    </div>
                  </div>

                  <div>
                    <div className="text-[11px] text-[#6a7282] mb-1">Out-of-pocket remaining</div>
                    <div className="text-[20px] font-semibold text-[#101828] tracking-[-0.02em]">
                      {selectedResult.oopRemaining} <span className="text-[14px] text-[#6a7282] font-normal">of {selectedResult.oopTotal}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Coverage details */}
              <div>
                <h4 className="text-[11px] text-[#99A1AF] uppercase tracking-wider mb-4">Coverage details</h4>
                
                <div className="space-y-3">
                  {selectedResult.coverage.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-3 pb-3 border-b border-gray-100 last:border-0">
                      <div className="shrink-0 size-5 rounded-full bg-emerald-100 flex items-center justify-center mt-0.5">
                        <Check className="size-3 text-emerald-700" />
                      </div>
                      <div className="flex-1">
                        <div className="text-[13px] text-[#4a5565] font-medium mb-0.5">
                          {item.service}
                        </div>
                        <div className="text-[12px] text-[#6a7282]">
                          {item.responsibility}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer actions */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4">
              <div className="flex flex-col gap-2">
                <button className="w-full px-4 py-2.5 bg-[#101828] text-white rounded-lg text-[13px] font-medium hover:bg-[#1f2937] transition-colors flex items-center justify-center gap-2">
                  <Link className="size-4" />
                  Attach to visit
                </button>
                <div className="flex gap-2">
                  <button className="flex-1 px-4 py-2 bg-white border border-gray-300 text-[#101828] rounded-lg text-[12px] font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                    <Copy className="size-3.5" />
                    Copy
                  </button>
                  <button className="flex-1 px-4 py-2 bg-white border border-gray-300 text-[#101828] rounded-lg text-[12px] font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                    <Download className="size-3.5" />
                    Download
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}