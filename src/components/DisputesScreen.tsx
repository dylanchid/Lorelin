import { useState, useEffect } from 'react';
import { Search, Calendar, ChevronDown } from 'lucide-react';
import { DisputesTable } from './DisputesTable';
import { getDisputes, initDisputes, type Dispute } from '../utils/api';

type DisputeTypeFilter = 'all' | 'oon' | 'inn' | 'underpayment';

interface DisputesScreenProps {
  onOpenCase: (id: string) => void;
}

export function DisputesScreen({ onOpenCase }: DisputesScreenProps) {
  const [primaryView, setPrimaryView] = useState<'needs-attention' | 'all'>('needs-attention');
  const [disputeTypeFilter, setDisputeTypeFilter] = useState<DisputeTypeFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDisputes = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Initialize if needed
        await initDisputes();
        
        // Fetch disputes
        const response = await getDisputes();
        setDisputes(response.disputes || []);
      } catch (err) {
        console.error('Error loading disputes:', err);
        setError(err instanceof Error ? err.message : 'Failed to load disputes');
      } finally {
        setLoading(false);
      }
    };

    fetchDisputes();
  }, []);

  // Transform API disputes to table format
  const transformedDisputes = disputes.map((d) => {
    // Format deadline date
    let deadlineDate = 'No deadline';
    if (d.deadline_date) {
      try {
        const date = new Date(d.deadline_date);
        deadlineDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      } catch (e) {
        console.error('Error parsing deadline date:', e);
      }
    }

    return {
      id: d.id,
      patient: {
        name: d.patient_name,
        claimId: d.claim_id,
      },
      procedure: {
        name: d.procedure_name,
        code: d.procedure_code,
      },
      payer: {
        name: d.payer_name,
        planType: d.plan_type || undefined,
      },
      billed: d.billed,
      paid: d.paid,
      potential: d.potential,
      contractExpected: d.contract_expected || undefined,
      contractGap: d.contract_gap || undefined,
      type: d.type as any,
      path: d.path as any,
      issue: d.issue,
      status: d.status as any,
      nextAction: d.next_action as any,
      deadline: {
        date: deadlineDate,
        label: d.deadline_label || 'No deadline',
      },
      pathTooltip: d.path_tooltip || '',
      isUrgent: d.is_urgent,
    };
  });

  return (
    <div className="overflow-auto size-full bg-[#f5f5f7]">
      <div className="max-w-[1400px] mx-auto px-[60px] py-[32px] pb-[60px]">
        
        {/* Disputes Content */}
        <div className="bg-white relative rounded-[14px] shrink-0 w-full">
          <div aria-hidden="true" className="absolute border border-gray-100 border-solid inset-0 pointer-events-none rounded-[14px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]" />
          <div className="size-full">
            <div className="box-border content-stretch flex flex-col gap-[20px] items-start px-[33px] py-[25px] relative w-full">
              
              {/* Header */}
              <div className="content-stretch flex items-start justify-between relative shrink-0 w-full">
                <div className="flex flex-col gap-1">
                  <h1 className="text-[18px] font-semibold text-[#101828] tracking-[-0.02em]">
                    Disputes & Appeals Worklist
                  </h1>
                  <p className="text-[11px] text-[#6a7282] tracking-[-0.15px] leading-[16px]">
                    All in-network and out-of-network cases identified by the diagnostic and new claims, ordered by priority.
                  </p>
                </div>
              </div>

              {/* Single Control Row */}
              <div className="flex items-center justify-between w-full border-b border-gray-100 pb-4">
                {/* Left side - Primary toggle + Type filter */}
                <div className="flex items-center gap-4">
                  {/* Primary toggle */}
                  <div className="flex items-center gap-1 bg-gray-100/60 rounded-lg p-0.5">
                    <button
                      onClick={() => setPrimaryView('needs-attention')}
                      className={`px-3 py-1.5 rounded-md text-[13px] tracking-[-0.15px] transition-all ${
                        primaryView === 'needs-attention'
                          ? 'bg-white text-[#101828] shadow-sm'
                          : 'text-[#6a7282] hover:text-[#101828]'
                      }`}
                    >
                      Needs attention <span className="text-[#99A1AF]">(2)</span>
                    </button>
                    <button
                      onClick={() => setPrimaryView('all')}
                      className={`px-3 py-1.5 rounded-md text-[13px] tracking-[-0.15px] transition-all ${
                        primaryView === 'all'
                          ? 'bg-white text-[#101828] shadow-sm'
                          : 'text-[#6a7282] hover:text-[#101828]'
                      }`}
                    >
                      All cases <span className="text-[#99A1AF]">(8)</span>
                    </button>
                  </div>

                  {/* Type filter (segmented) */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setDisputeTypeFilter('all')}
                      className={`px-3 py-1.5 rounded-md text-[12px] tracking-[-0.15px] transition-all ${
                        disputeTypeFilter === 'all'
                          ? 'bg-[#101828] text-white'
                          : 'text-[#6a7282] hover:text-[#101828] hover:bg-gray-50'
                      }`}
                    >
                      All types
                    </button>
                    <button
                      onClick={() => setDisputeTypeFilter('oon')}
                      className={`px-3 py-1.5 rounded-md text-[12px] tracking-[-0.15px] transition-all ${
                        disputeTypeFilter === 'oon'
                          ? 'bg-[#101828] text-white'
                          : 'text-[#6a7282] hover:text-[#101828] hover:bg-gray-50'
                      }`}
                    >
                      OON / NSA
                    </button>
                    <button
                      onClick={() => setDisputeTypeFilter('inn')}
                      className={`px-3 py-1.5 rounded-md text-[12px] tracking-[-0.15px] transition-all ${
                        disputeTypeFilter === 'inn'
                          ? 'bg-[#101828] text-white'
                          : 'text-[#6a7282] hover:text-[#101828] hover:bg-gray-50'
                      }`}
                    >
                      In-network
                    </button>
                    <button
                      onClick={() => setDisputeTypeFilter('underpayment')}
                      className={`px-3 py-1.5 rounded-md text-[12px] tracking-[-0.15px] transition-all ${
                        disputeTypeFilter === 'underpayment'
                          ? 'bg-[#101828] text-white'
                          : 'text-[#6a7282] hover:text-[#101828] hover:bg-gray-50'
                      }`}
                    >
                      Underpayments
                    </button>
                  </div>
                </div>

                {/* Right side - Search, Date range, Payer, Min $ */}
                <div className="flex items-center gap-2">
                  {/* Search Input */}
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-[#99A1AF]" />
                    <input
                      type="text"
                      placeholder="Search…"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8 pr-3 py-1.5 h-[32px] w-[160px] text-[13px] text-[#101828] placeholder:text-[#99A1AF] border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-300 focus:border-gray-300 tracking-[-0.15px]"
                    />
                  </div>
                  
                  {/* Date Range Selector */}
                  <button className="flex items-center gap-1.5 px-2.5 py-1.5 h-[32px] text-[12px] text-[#6a7282] hover:text-[#101828] hover:bg-gray-50 rounded-md border border-gray-200/60 transition-colors tracking-[-0.15px]">
                    <Calendar className="size-3.5" />
                    <span>Last 90 days</span>
                    <ChevronDown className="size-3" />
                  </button>

                  {/* Payer Filter */}
                  <button className="flex items-center gap-1.5 px-2.5 py-1.5 h-[32px] text-[12px] text-[#6a7282] hover:text-[#101828] hover:bg-gray-50 rounded-md border border-gray-200/60 transition-colors tracking-[-0.15px]">
                    <span>Payer</span>
                    <ChevronDown className="size-3" />
                  </button>
                  
                  {/* Min $ Input */}
                  <div className="flex items-center gap-1.5 px-2.5 py-1.5 h-[32px] text-[12px] text-[#6a7282] border border-gray-200/60 rounded-md bg-white">
                    <span className="text-[#99A1AF]">Min</span>
                    <input
                      type="text"
                      placeholder="$0"
                      className="w-12 bg-transparent border-none outline-none text-[#101828] placeholder:text-[#99A1AF] text-[12px]"
                    />
                  </div>
                </div>
              </div>
              
              {/* Disputes Table */}
              <div className="w-full">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-[13px] text-[#6a7282]">Loading disputes...</div>
                  </div>
                ) : error ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-[13px] text-red-600">Error: {error}</div>
                  </div>
                ) : transformedDisputes.length === 0 ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-[13px] text-[#6a7282]">No disputes found</div>
                  </div>
                ) : (
                  <DisputesTable disputes={transformedDisputes} onOpenCase={onOpenCase} />
                )}
              </div>
              
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
}