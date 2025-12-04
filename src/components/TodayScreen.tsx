import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Mic, FileText, AlertTriangle, ChevronDown, ChevronRight } from 'lucide-react';
import { getWorkItems, initWorkItems, type WorkItem as APIWorkItem } from '../utils/api';

// Mock data for voice-to-cash over time
const generateVoiceToCashData = (days: number) => {
  const data = [];
  const today = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    // Generate realistic mock data
    const sent = Math.floor(Math.random() * 5000) + 2000;
    const recorded = Math.floor(Math.random() * 3000) + 1000;
    const flagged = Math.floor(Math.random() * 800) + 100;
    const notCaptured = Math.floor(Math.random() * 500) + 50;
    
    data.push({
      date: date,
      dateLabel: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      dayLabel: date.toLocaleDateString('en-US', { weekday: 'short' }),
      sent,
      recorded,
      flagged,
      notCaptured,
    });
  }
  
  return data;
};

type WorkItemType = 'visit' | 'claim';
type WorkItemStep = 'to-record' | 'to-review' | 'ready-to-send' | 'flagged';

interface WorkItem {
  id: string;
  type: WorkItemType;
  step: WorkItemStep;
  patientName: string;
  description: string;
  provider: string;
  payer: string;
  value: number;
  valueLabel: string;
  deadline: string;
  urgency: 'high' | 'medium' | 'low';
}

interface TodayScreenProps {
  onOpenCase: (id: string) => void;
  onOpenVisit: (id: string) => void;
}

type TimeFilter = '7' | '14' | '30' | '90';
type TypeFilter = 'all' | 'visits' | 'claims';
type StepFilter = 'all' | 'to-record' | 'to-review' | 'ready-to-send' | 'flagged';

export function TodayScreen({ onOpenCase, onOpenVisit }: TodayScreenProps) {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('14');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [stepFilter, setStepFilter] = useState<StepFilter>('all');
  const [workItems, setWorkItems] = useState<WorkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWorkItems = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Initialize if needed
        await initWorkItems();
        
        // Fetch work items with current filters
        const response = await getWorkItems(typeFilter, stepFilter);
        
        // Transform API work items to local format
        const transformed: WorkItem[] = (response.workItems || []).map((item: APIWorkItem) => ({
          id: item.id,
          type: item.type,
          step: item.step,
          patientName: item.patient_name,
          description: item.description,
          provider: item.provider,
          payer: item.payer,
          value: item.value,
          valueLabel: item.value_label,
          deadline: item.deadline_label || 'No deadline',
          urgency: item.urgency,
        }));
        
        setWorkItems(transformed);
      } catch (err) {
        console.error('Error loading work items:', err);
        setError(err instanceof Error ? err.message : 'Failed to load work items');
      } finally {
        setLoading(false);
      }
    };

    fetchWorkItems();
  }, [typeFilter, stepFilter]);

  // Filter work items
  const filteredItems = workItems.filter(item => {
    if (typeFilter === 'visits' && item.type !== 'visit') return false;
    if (typeFilter === 'claims' && item.type !== 'claim') return false;
    if (stepFilter !== 'all' && item.step !== stepFilter) return false;
    return true;
  }).sort((a, b) => {
    // Sort by urgency first
    const urgencyOrder = { high: 0, medium: 1, low: 2 };
    if (urgencyOrder[a.urgency] !== urgencyOrder[b.urgency]) {
      return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
    }
    // Then by value
    return b.value - a.value;
  });

  const getStepPillStyle = (step: WorkItemStep, type: WorkItemType) => {
    if (step === 'to-record') {
      return 'bg-slate-50 text-slate-700 border-slate-200';
    }
    if (step === 'to-review') {
      return 'bg-slate-50 text-slate-700 border-slate-200';
    }
    if (step === 'ready-to-send') {
      return 'bg-slate-50 text-slate-700 border-slate-200';
    }
    if (step === 'flagged') {
      return 'bg-amber-50 text-amber-700 border-amber-200';
    }
    return 'bg-gray-50 text-gray-700 border-gray-200';
  };

  const getStepLabel = (step: WorkItemStep, type: WorkItemType) => {
    const prefix = type === 'visit' ? 'Visit' : 'Claim';
    if (step === 'to-record') return `${prefix} · To record`;
    if (step === 'to-review') return `${prefix} · To review`;
    if (step === 'ready-to-send') return `${prefix} · Ready to send`;
    if (step === 'flagged') return `${prefix} · Flagged`;
    return prefix;
  };

  const getStepIcon = (step: WorkItemStep) => {
    if (step === 'to-record') return <Mic className="size-3" />;
    if (step === 'to-review') return <FileText className="size-3" />;
    if (step === 'flagged') return <AlertTriangle className="size-3" />;
    return null;
  };

  const getUrgencyDot = (urgency: 'high' | 'medium' | 'low') => {
    if (urgency === 'high') return 'bg-red-500';
    if (urgency === 'medium') return 'bg-amber-400';
    return 'bg-gray-300';
  };

  // Generate chart data based on selected time filter
  const chartData = generateVoiceToCashData(parseInt(timeFilter));

  // Custom tooltip for voice-to-cash chart
  const VoiceToCashTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const total = data.sent + data.recorded + data.flagged + data.notCaptured;

      return (
        <div className="bg-[#101828] text-white px-3 py-2.5 rounded-lg shadow-lg border border-gray-700">
          <div className="text-[11px] font-medium mb-1.5">
            {data.dayLabel} {data.dateLabel}
          </div>
          <div className="space-y-0.5 text-[11px]">
            <div className="flex justify-between gap-4 pb-1 border-b border-white/20">
              <span className="text-white/70">Total est. allowed:</span>
              <span className="font-medium">${(total / 1000).toFixed(1)}k</span>
            </div>
            {data.sent > 0 && (
              <div className="flex justify-between gap-4">
                <span className="text-white/70">Sent to Athena</span>
                <span className="font-medium">${(data.sent / 1000).toFixed(1)}k</span>
              </div>
            )}
            {data.recorded > 0 && (
              <div className="flex justify-between gap-4">
                <span className="text-white/70">Recorded & coded</span>
                <span className="font-medium">${(data.recorded / 1000).toFixed(1)}k</span>
              </div>
            )}
            {data.flagged > 0 && (
              <div className="flex justify-between gap-4">
                <span className="text-white/70">Flagged / at risk</span>
                <span className="font-medium">${(data.flagged / 1000).toFixed(1)}k</span>
              </div>
            )}
            {data.notCaptured > 0 && (
              <div className="flex justify-between gap-4">
                <span className="text-white/70">Not captured</span>
                <span className="font-medium">${(data.notCaptured / 1000).toFixed(1)}k</span>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="overflow-auto size-full bg-[#f5f5f7]">
      <div className="max-w-[1400px] mx-auto px-[60px] py-[32px] pb-[60px]">
        
        {/* Card 1: Voice-to-cash over time */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm mb-6">
          
          {/* Header */}
          <div className="flex items-center justify-between px-8 py-6 border-b border-gray-200">
            <div>
              <h2 className="text-[16px] font-semibold text-[#101828] tracking-[-0.02em] mb-1">
                Voice-to-cash over time
              </h2>
              <p className="text-[12px] text-[#6a7282]">
                Daily estimated allowed amounts by pipeline stage
              </p>
            </div>
            <div className="relative">
              <select
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value as TimeFilter)}
                className="appearance-none px-3 py-1.5 pr-8 bg-white border border-gray-300 rounded-lg text-[13px] text-[#101828] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
              >
                <option value="7">Last 7 days</option>
                <option value="14">Last 14 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 size-4 text-[#6a7282] pointer-events-none" />
            </div>
          </div>

          {/* Summary Stats */}
          <div className="px-8 pt-5 pb-2">
            <div className="flex items-center gap-6 text-[12px]">
              <div className="flex items-center gap-1.5">
                <span className="text-[#6a7282]">Sent:</span>
                <span className="font-medium text-[#047857]">68%</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[#6a7282]">Pending:</span>
                <span className="font-medium text-[#10b981]">$42.3k</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[#6a7282]">At risk:</span>
                <span className="font-medium text-[#6ee7b7]">$8.1k</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[#6a7282]">Missed:</span>
                <span className="font-medium text-[#d1fae5]">$3.2k</span>
              </div>
            </div>
          </div>

          {/* Chart */}
          <div className="px-8 pb-6">
            <div className="w-full h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={chartData} 
                  barSize={parseInt(timeFilter) === 7 ? 48 : parseInt(timeFilter) === 14 ? 32 : parseInt(timeFilter) === 30 ? 16 : 7}
                  barGap={2} 
                  margin={{ top: 0, right: 0, bottom: 0, left: -20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} strokeOpacity={0.5} />
                  <XAxis 
                    dataKey="dateLabel" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#99A1AF', fontSize: 10 }}
                    height={20}
                    interval={parseInt(timeFilter) === 7 ? 0 : parseInt(timeFilter) === 14 ? 0 : parseInt(timeFilter) === 30 ? 4 : 14}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#99A1AF', fontSize: 10 }} 
                    tickFormatter={(value) => `$${value / 1000}k`}
                  />
                  <Tooltip content={<VoiceToCashTooltip />} cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }} />
                  <Bar dataKey="sent" stackId="a" fill="#047857" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="recorded" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="flagged" stackId="a" fill="#6ee7b7" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="notCaptured" stackId="a" fill="#d1fae5" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center gap-1.5">
                <div className="size-3 rounded-sm bg-[#047857]" />
                <div className="flex items-center gap-1">
                  <span className="text-[11px] text-[#4a5565] font-medium">Sent to Athena</span>
                  <span className="text-[10px] text-[#99A1AF]">· good</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="size-3 rounded-sm bg-[#10b981]" />
                <div className="flex items-center gap-1">
                  <span className="text-[11px] text-[#4a5565] font-medium">Recorded & coded</span>
                  <span className="text-[10px] text-[#99A1AF]">· pending</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="size-3 rounded-sm bg-[#6ee7b7]" />
                <div className="flex items-center gap-1">
                  <span className="text-[11px] text-[#4a5565] font-medium">Flagged / at risk</span>
                  <span className="text-[10px] text-[#99A1AF]">· fix</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="size-3 rounded-sm bg-[#d1fae5]" />
                <div className="flex items-center gap-1">
                  <span className="text-[11px] text-[#4a5565] font-medium">Not captured</span>
                  <span className="text-[10px] text-[#99A1AF]">· missed $$</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Work to do today */}
        <div className="bg-white border border-gray-200 rounded-lg p-8">
          
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-[16px] font-semibold text-[#101828] tracking-[-0.02em] mb-1">
                Work to do today
              </h2>
              <p className="text-[12px] text-[#6a7282]">
                Visits and claims that need attention in the next 24–48 hours
              </p>
            </div>
            <div className="relative">
              <select
                className="appearance-none px-3 py-1.5 pr-8 bg-white border border-gray-300 rounded-lg text-[13px] text-[#101828] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
              >
                <option value="today">Today</option>
                <option value="next-7">Next 7 days</option>
                <option value="all">All open</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 size-4 text-[#6a7282] pointer-events-none" />
            </div>
          </div>

          {/* Filter chips */}
          <div className="flex items-center gap-4 mb-6 pb-5 border-b border-gray-200">
            {/* TYPE filter */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-[#99A1AF] uppercase tracking-wider">Type</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setTypeFilter('all')}
                  className={`px-3 py-1 rounded-md text-[12px] tracking-[-0.15px] transition-all border ${
                    typeFilter === 'all'
                      ? 'bg-[#101828] text-white border-[#101828]'
                      : 'text-[#6a7282] border-gray-200 hover:text-[#101828] hover:bg-gray-50'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setTypeFilter('visits')}
                  className={`px-3 py-1 rounded-md text-[12px] tracking-[-0.15px] transition-all border ${
                    typeFilter === 'visits'
                      ? 'bg-[#101828] text-white border-[#101828]'
                      : 'text-[#6a7282] border-gray-200 hover:text-[#101828] hover:bg-gray-50'
                  }`}
                >
                  Visits
                </button>
                <button
                  onClick={() => setTypeFilter('claims')}
                  className={`px-3 py-1 rounded-md text-[12px] tracking-[-0.15px] transition-all border ${
                    typeFilter === 'claims'
                      ? 'bg-[#101828] text-white border-[#101828]'
                      : 'text-[#6a7282] border-gray-200 hover:text-[#101828] hover:bg-gray-50'
                  }`}
                >
                  Claims
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
                  onClick={() => setStepFilter('to-record')}
                  className={`px-3 py-1 rounded-md text-[12px] tracking-[-0.15px] transition-all border ${
                    stepFilter === 'to-record'
                      ? 'bg-[#101828] text-white border-[#101828]'
                      : 'text-[#6a7282] border-gray-200 hover:text-[#101828] hover:bg-gray-50'
                  }`}
                >
                  To record
                </button>
                <button
                  onClick={() => setStepFilter('to-review')}
                  className={`px-3 py-1 rounded-md text-[12px] tracking-[-0.15px] transition-all border ${
                    stepFilter === 'to-review'
                      ? 'bg-[#101828] text-white border-[#101828]'
                      : 'text-[#6a7282] border-gray-200 hover:text-[#101828] hover:bg-gray-50'
                  }`}
                >
                  To review
                </button>
                <button
                  onClick={() => setStepFilter('ready-to-send')}
                  className={`px-3 py-1 rounded-md text-[12px] tracking-[-0.15px] transition-all border ${
                    stepFilter === 'ready-to-send'
                      ? 'bg-[#101828] text-white border-[#101828]'
                      : 'text-[#6a7282] border-gray-200 hover:text-[#101828] hover:bg-gray-50'
                  }`}
                >
                  Ready to send
                </button>
                <button
                  onClick={() => setStepFilter('flagged')}
                  className={`px-3 py-1 rounded-md text-[12px] tracking-[-0.15px] transition-all border ${
                    stepFilter === 'flagged'
                      ? 'bg-[#101828] text-white border-[#101828]'
                      : 'text-[#6a7282] border-gray-200 hover:text-[#101828] hover:bg-gray-50'
                  }`}
                >
                  Flagged claims
                </button>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="w-full overflow-x-auto">
            {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-[13px] text-[#6a7282]">Loading work items...</div>
                </div>
              ) : error ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-[13px] text-red-600">Error: {error}</div>
                </div>
              ) : filteredItems.length === 0 ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-[13px] text-[#6a7282]">No work items found</div>
                </div>
              ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-3 py-2.5 text-left">
                    <span className="text-[11px] text-[#6a7282] tracking-[0.05em] uppercase">Work item</span>
                  </th>
                  <th className="px-3 py-2.5 text-left">
                    <span className="text-[11px] text-[#6a7282] tracking-[0.05em] uppercase">Type / Step</span>
                  </th>
                  <th className="px-3 py-2.5 text-left">
                    <span className="text-[11px] text-[#6a7282] tracking-[0.05em] uppercase">Provider / Payer</span>
                  </th>
                  <th className="px-3 py-2.5 text-right">
                    <span className="text-[11px] text-[#6a7282] tracking-[0.05em] uppercase">Value</span>
                  </th>
                  <th className="px-3 py-2.5 text-left">
                    <span className="text-[11px] text-[#6a7282] tracking-[0.05em] uppercase">Deadline / Age</span>
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
                    onClick={() => item.type === 'visit' ? onOpenVisit(item.id) : onOpenCase(item.id)}
                    className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors cursor-pointer group"
                  >
                    <td className="px-3 py-3">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[13px] font-medium text-[#101828] tracking-[-0.15px]">
                          {item.patientName}
                        </span>
                        <span className="text-[12px] text-[#6a7282] tracking-[-0.15px]">
                          {item.description}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-[11px] font-medium border ${getStepPillStyle(item.step, item.type)}`}>
                        {getStepIcon(item.step)}
                        {getStepLabel(item.step, item.type)}
                      </span>
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
                    <td className="px-3 py-3 text-right">
                      <div className="flex flex-col items-end gap-0.5">
                        <span className={`text-[13px] font-medium tracking-[-0.15px] ${
                          item.valueLabel === 'Est. allowed' ? 'text-emerald-700' : 'text-amber-700'
                        }`}>
                          {item.valueLabel === 'Est. allowed' ? '+' : ''}${item.value}
                        </span>
                        <span className="text-[11px] text-[#6a7282]">
                          {item.valueLabel}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <div className={`size-1.5 rounded-full ${getUrgencyDot(item.urgency)}`} />
                        <span className="text-[12px] text-[#4a5565] tracking-[-0.15px]">
                          {item.deadline}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-right">
                      <button className="text-[12px] text-[#101828] hover:text-[#1f2937] font-medium group-hover:underline flex items-center gap-1 ml-auto">
                        {item.type === 'visit' ? 'Open visit' : 'Open claim'}
                        <ChevronRight className="size-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}