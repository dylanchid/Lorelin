import { useState } from 'react';
import { ChevronLeft, Download, ZoomIn, ZoomOut, FileText, TrendingUp, AlertCircle, Table2, Copy, ChevronDown } from 'lucide-react';

interface ParsedField {
  label: string;
  value: string;
  formula?: string;
  confidence: number;
}

interface ParsedSection {
  title: string;
  fields: ParsedField[];
}

interface Insight {
  type: 'trend' | 'adjustment' | 'calculation';
  title: string;
  description: string;
  badge?: string;
}

export function ParserScreen({ onBack }: { onBack?: () => void }) {
  const [zoom, setZoom] = useState(100);
  const [selectedPage, setSelectedPage] = useState(1);

  // Mock parsed data
  const parsedSections: ParsedSection[] = [
    {
      title: 'Revenue Metrics',
      fields: [
        { label: 'Gross Potential Rent (annual)', value: '$460,000', confidence: 95 },
        { label: 'Vacancy (annual loss)', value: '$22,500', confidence: 72 },
        { label: 'Effective Gross Income (annual)', value: '$427,500', formula: 'GPR - Vacancy', confidence: 96 },
      ],
    },
    {
      title: 'Expense & Income',
      fields: [
        { label: 'Operating Expenses (annual)', value: '$185,000', confidence: 88 },
        { label: 'Net Operating Income (annual)', value: '$242,500', formula: 'EGI - OpEx', confidence: 94 },
      ],
    },
    {
      title: 'Period',
      fields: [
        { label: 'Period', value: 'Jan 1, 2024 → Dec 31, 2024', confidence: 98 },
      ],
    },
  ];

  // NOI Calculation Waterfall data
  const waterfallSteps = [
    { step: '1. Gross Potential Rent (GPR)', formula: 'Sum of market/contract rents', amount: '1,200,000', isBold: false },
    { step: '2. Vacancy & Credit Loss', formula: '8% × GPR', amount: '(96,000)', isBold: false },
    { step: '3. Concessions/Free Rent', formula: 'Given', amount: '(12,000)', isBold: false },
    { step: '4. Effective Gross Rent', formula: '#1 − #2 − #3', amount: '1,092,000', isBold: true },
    { step: '5. Other Income', formula: 'Parking + laundry + fees', amount: '90,000', isBold: false },
    { step: '6. Effective Gross Income (EGI)', formula: '#4 + #5', amount: '1,182,000', isBold: true },
    { step: '7. Operating Expenses (OpEx)', formula: 'Sum of operating line items', amount: '(520,000)', isBold: false },
    { step: '8. Replacement Reserves (UW policy)', formula: 'Allowance (e.g., $300/unit/yr)', amount: '(30,000)', isBold: false },
    { step: '9. NOI (before reserves)', formula: '#6 − OpEx', amount: '662,000', isBold: true },
    { step: '10. Underwritten NOI (after reserves)', formula: '#6 − OpEx − Reserves', amount: '632,000', isBold: true },
  ];

  // TTM Financial Data
  const ttmMonths = ['Jan 2024', 'Feb 2024', 'Mar 2024', 'Apr 2024', 'May 2024'];
  const ttmData = [
    { label: 'Gross Potential Rent', values: ['$37,500', '$37,500', '$37,500', '$37,500', '$37,500'] },
    { label: 'Vacancy', values: ['$-1,875', '$-1,875', '$-1,875', '$-1,875', '$-1,875'] },
    { label: 'Effective Gross Income', values: ['$35,625', '$35,625', '$35,625', '$35,625', '$35,625'] },
  ];

  const insights: Insight[] = [
    {
      type: 'trend',
      title: 'Revenue & Expense Trends',
      description: 'The property shows stable revenue growth of 3.2% YoY with operating expenses increasing by 5.1%.',
      badge: '+3.2% YoY',
    },
    {
      type: 'adjustment',
      title: 'Underwriting Adjustments',
      description: 'Recommended adjustments include add-backs for owner management fee and normalizing R&M to market standards.',
    },
  ];

  const getConfidencePillStyle = (confidence: number): string => {
    if (confidence >= 90) return 'bg-emerald-50/60 text-emerald-700/85 border-emerald-200/40';
    if (confidence >= 75) return 'bg-amber-50/70 text-amber-700/85 border-amber-200/40';
    return 'bg-orange-50/60 text-orange-700/85 border-orange-200/40';
  };

  return (
    <div className="h-full overflow-auto bg-[#f5f5f7]">
      <div className="px-8 pt-6 pb-8">
        {/* Header - spans full width */}
        <div className="w-full mb-6">
          <div className="flex items-start justify-between mb-3">
            <div className="flex flex-col gap-2">
              {onBack && (
                <button
                  onClick={onBack}
                  className="flex items-center gap-1.5 text-[13px] text-[#6a7282] hover:text-[#101828] transition-colors tracking-[-0.15px] w-fit"
                >
                  <ChevronLeft className="size-3.5" />
                  <span>Templates</span>
                </button>
              )}
              <h1 className="text-[26px] font-semibold text-[#101828] tracking-[-0.4px] leading-tight">
                T-12_Operating_Statement_2024.pdf
              </h1>
              <p className="text-[13px] text-[#6a7282] tracking-[-0.15px]">
                Borrowers · Acme Roofing · Uploaded Mar 28, 2025
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-lg">
                <span className="text-[12px] font-medium text-emerald-700">PARSED</span>
              </div>
              <button className="px-4 py-2 bg-white border border-gray-300 text-[#101828] rounded-lg text-[13px] font-medium hover:bg-gray-50 transition-colors">
                View checklist item
              </button>
            </div>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="flex gap-6 w-full">
          {/* Left Column - Info Cards */}
          <div className="w-[400px] flex flex-col gap-4">
            {/* Parsed Data */}
            {parsedSections.map((section, idx) => (
              <div key={idx} className="bg-white border border-gray-200 rounded-lg p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Table2 className="size-4 text-[#4a5565]" />
                    <h3 className="text-[14px] font-semibold text-[#101828] tracking-[-0.15px]">
                      {section.title}
                    </h3>
                    {section.title !== 'Period' && (
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-[10px] font-medium">
                        {section.title === 'Revenue Metrics' ? 'revenue' : 'expenses'}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <button className="p-1.5 hover:bg-gray-100 rounded transition-colors">
                      <Copy className="size-3.5 text-[#6a7282]" />
                    </button>
                    <button className="p-1.5 hover:bg-gray-100 rounded transition-colors">
                      <Download className="size-3.5 text-[#6a7282]" />
                    </button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  {section.fields.map((field, fIdx) => (
                    <div key={fIdx} className="flex items-center justify-between">
                      <span className="text-[12px] text-[#4a5565]">
                        {field.label}
                      </span>
                      <div className="flex items-center gap-1">
                        <span className="text-[12px] font-semibold text-[#101828]">
                          {field.value}
                        </span>
                        {field.formula && (
                          <span className="text-[10px] text-[#6a7282]">
                            ({field.formula})
                          </span>
                        )}
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-medium border ${getConfidencePillStyle(field.confidence)}`}
                        >
                          {field.confidence}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* NOI Calculation Waterfall */}
            <div className="bg-white border border-gray-200 rounded-lg p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Table2 className="size-4 text-[#4a5565]" />
                  <h3 className="text-[14px] font-semibold text-[#101828] tracking-[-0.15px]">
                    NOI Calculation Waterfall
                  </h3>
                  <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-[10px] font-medium">
                    calc
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button className="p-1.5 hover:bg-gray-100 rounded transition-colors">
                    <Copy className="size-3.5 text-[#6a7282]" />
                  </button>
                  <button className="p-1.5 hover:bg-gray-100 rounded transition-colors">
                    <Download className="size-3.5 text-[#6a7282]" />
                  </button>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-[12px]">
                  <thead className="border-b border-gray-200">
                    <tr>
                      <th className="text-left py-2 text-[11px] text-[#6a7282] font-medium">Step</th>
                      <th className="text-left py-2 text-[11px] text-[#6a7282] font-medium">Formula (TTM)</th>
                      <th className="text-right py-2 text-[11px] text-[#6a7282] font-medium">Amount ($)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {waterfallSteps.map((row, idx) => (
                      <tr key={idx} className="border-b border-gray-100 last:border-0">
                        <td className={`py-2.5 ${row.isBold ? 'font-semibold text-[#101828]' : 'text-[#4a5565]'}`}>
                          {row.step}
                        </td>
                        <td className="py-2.5 text-[#6a7282]">
                          {row.formula}
                        </td>
                        <td className={`py-2.5 text-right ${row.isBold ? 'font-semibold text-[#101828]' : 'text-[#4a5565]'}`}>
                          {row.amount}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* TTM Financial Data */}
            <div className="bg-white border border-gray-200 rounded-lg p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Table2 className="size-4 text-[#4a5565]" />
                  <h3 className="text-[14px] font-semibold text-[#101828] tracking-[-0.15px]">
                    Trailing Twelve Months (TTM) Financial Data
                  </h3>
                  <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-[10px] font-medium">
                    12 months
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button className="p-1.5 hover:bg-gray-100 rounded transition-colors">
                    <Copy className="size-3.5 text-[#6a7282]" />
                  </button>
                  <button className="p-1.5 hover:bg-gray-100 rounded transition-colors">
                    <Download className="size-3.5 text-[#6a7282]" />
                  </button>
                  <button className="p-1.5 hover:bg-gray-100 rounded transition-colors">
                    <ChevronDown className="size-3.5 text-[#6a7282]" />
                  </button>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-[12px]">
                  <thead className="border-b border-gray-200">
                    <tr>
                      <th className="text-left py-2 text-[11px] text-[#6a7282] font-medium"></th>
                      {ttmMonths.map((month, idx) => (
                        <th key={idx} className="text-right py-2 text-[11px] text-[#6a7282] font-medium px-2">
                          {month}
                        </th>
                      ))}
                      <th className="text-right py-2 text-[11px] text-[#6a7282] font-medium px-2">...</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ttmData.map((row, idx) => (
                      <tr key={idx} className="border-b border-gray-100 last:border-0">
                        <td className="py-2.5 text-[#4a5565]">
                          {row.label}
                        </td>
                        {row.values.map((value, vIdx) => (
                          <td key={vIdx} className="py-2.5 text-right text-[#4a5565] px-2">
                            {value}
                          </td>
                        ))}
                        <td className="py-2.5 text-right text-[#6a7282] px-2">...</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Insights */}
            <div className="bg-white border border-gray-200 rounded-lg p-5">
              <h3 className="text-[14px] font-semibold text-[#101828] mb-4 tracking-[-0.15px]">
                Insights & Analysis
              </h3>
              <div className="space-y-3">
                {insights.map((insight, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    {insight.type === 'trend' ? (
                      <TrendingUp className="size-4 text-blue-600 mt-0.5 shrink-0" />
                    ) : (
                      <AlertCircle className="size-4 text-amber-600 mt-0.5 shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[12px] font-medium text-[#101828]">
                          {insight.title}
                        </span>
                        {insight.badge && (
                          <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-700 rounded text-[10px] font-medium">
                            {insight.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[12px] text-[#6a7282] leading-relaxed">
                        {insight.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2">
              <button className="w-full px-4 py-2.5 bg-[#101828] text-white rounded-lg text-[13px] font-medium hover:bg-[#1f2937] transition-colors">
                Approve & continue
              </button>
              <div className="flex gap-2">
                <button className="flex-1 px-4 py-2.5 bg-white border border-gray-300 text-[#101828] rounded-lg text-[13px] font-medium hover:bg-gray-50 transition-colors">
                  Request fix
                </button>
                <button className="flex-1 px-4 py-2.5 bg-white border border-gray-300 text-[#101828] rounded-lg text-[13px] font-medium hover:bg-gray-50 transition-colors">
                  Re-parse
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Document Viewer Card */}
          <div className="flex-1 bg-white border border-gray-200 rounded-lg overflow-hidden flex flex-col">
            {/* Viewer controls */}
            <div className="border-b border-gray-200 px-6 py-3 flex items-center justify-between shrink-0 bg-gray-50">
              <div className="flex items-center gap-3">
                <FileText className="size-4 text-[#6a7282]" />
                <span className="text-[13px] text-[#4a5565]">Page {selectedPage} of 3</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setZoom(Math.max(50, zoom - 10))}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ZoomOut className="size-4 text-[#4a5565]" />
                </button>
                <span className="text-[13px] text-[#4a5565] min-w-[50px] text-center">
                  {zoom}%
                </span>
                <button
                  onClick={() => setZoom(Math.min(200, zoom + 10))}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ZoomIn className="size-4 text-[#4a5565]" />
                </button>
                <div className="w-px h-5 bg-gray-300 mx-2" />
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <Download className="size-4 text-[#4a5565]" />
                </button>
              </div>
            </div>

            {/* Document display */}
            <div className="flex-1 overflow-auto bg-gray-50 p-8">
              <div className="max-w-[800px] mx-auto">
                <div
                  className="bg-white shadow-lg rounded-lg overflow-hidden"
                  style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}
                >
                  {/* Mock document page */}
                  <div className="aspect-[8.5/11] bg-white p-12 relative">
                    <div className="absolute inset-0 p-12">
                      <div className="text-center mb-8">
                        <h2 className="text-[24px] font-bold text-gray-900 mb-2">
                          OPERATING STATEMENT
                        </h2>
                        <p className="text-[14px] text-gray-600">
                          Acme Roofing Property - 2024 Annual Report
                        </p>
                        <p className="text-[12px] text-gray-500 mt-1">
                          January 1, 2024 through December 31, 2024
                        </p>
                      </div>

                      <div className="space-y-6">
                        {/* Revenue section */}
                        <div>
                          <div className="border-b-2 border-gray-900 pb-1 mb-3">
                            <h3 className="text-[14px] font-bold text-gray-900 uppercase">
                              Revenue
                            </h3>
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between text-[12px]">
                              <span className="text-gray-700">Gross Potential Rent</span>
                              <span className="font-semibold text-gray-900">$460,000</span>
                            </div>
                            <div className="flex justify-between text-[12px]">
                              <span className="text-gray-700">Less: Vacancy Loss</span>
                              <span className="font-semibold text-gray-900">($22,500)</span>
                            </div>
                            <div className="flex justify-between text-[12px] pt-2 border-t border-gray-300">
                              <span className="text-gray-900 font-semibold">Effective Gross Income</span>
                              <span className="font-bold text-gray-900">$427,500</span>
                            </div>
                          </div>
                        </div>

                        {/* Expenses section */}
                        <div>
                          <div className="border-b-2 border-gray-900 pb-1 mb-3">
                            <h3 className="text-[14px] font-bold text-gray-900 uppercase">
                              Operating Expenses
                            </h3>
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between text-[12px]">
                              <span className="text-gray-700">Property Management</span>
                              <span className="font-semibold text-gray-900">$18,500</span>
                            </div>
                            <div className="flex justify-between text-[12px]">
                              <span className="text-gray-700">Maintenance & Repairs</span>
                              <span className="font-semibold text-gray-900">$45,000</span>
                            </div>
                            <div className="flex justify-between text-[12px]">
                              <span className="text-gray-700">Utilities</span>
                              <span className="font-semibold text-gray-900">$32,000</span>
                            </div>
                            <div className="flex justify-between text-[12px]">
                              <span className="text-gray-700">Insurance</span>
                              <span className="font-semibold text-gray-900">$28,000</span>
                            </div>
                            <div className="flex justify-between text-[12px]">
                              <span className="text-gray-700">Property Taxes</span>
                              <span className="font-semibold text-gray-900">$61,500</span>
                            </div>
                            <div className="flex justify-between text-[12px] pt-2 border-t border-gray-300">
                              <span className="text-gray-900 font-semibold">Total Operating Expenses</span>
                              <span className="font-bold text-gray-900">$185,000</span>
                            </div>
                          </div>
                        </div>

                        {/* NOI section */}
                        <div className="pt-4 border-t-2 border-gray-900">
                          <div className="flex justify-between text-[14px]">
                            <span className="text-gray-900 font-bold">Net Operating Income</span>
                            <span className="font-bold text-gray-900">$242,500</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Page thumbnails */}
                <div className="flex gap-3 mt-6 justify-center">
                  {[1, 2, 3].map((page) => (
                    <button
                      key={page}
                      onClick={() => setSelectedPage(page)}
                      className={`relative w-16 h-20 rounded border-2 transition-all ${
                        selectedPage === page
                          ? 'border-blue-500 shadow-md'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <div className="absolute inset-0 bg-white rounded flex items-center justify-center">
                        <span className="text-[10px] text-gray-500">{page}</span>
                      </div>
                    </button>
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