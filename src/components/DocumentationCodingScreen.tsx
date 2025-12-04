import { useState, Fragment } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

type TimeFilter = '3' | '7' | '14';
type RoleFilter = 'all' | 'provider' | 'coder';
type WorkTypeFilter = 'all' | 'documentation' | 'coding' | 'audit';
type StatusFilter = 'all' | 'not-started' | 'in-progress' | 'ready-for-review' | 'completed';

type EncounterStatus = 
  | 'doc-transcript-ready'
  | 'doc-provider-review'
  | 'coding-ai-draft'
  | 'coding-needs-review'
  | 'coding-completed';

interface EncounterItem {
  id: string;
  patientName: string;
  visitType: string;
  status: EncounterStatus;
  provider: string;
  payer: string;
  visitDate: string;
  visitTime: string;
  timing: string;
}

export function DocumentationCodingScreen() {
  const [overviewTimeFilter, setOverviewTimeFilter] = useState<TimeFilter>('7');
  const [workListTimeFilter, setWorkListTimeFilter] = useState<TimeFilter>('7');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');
  const [workTypeFilter, setWorkTypeFilter] = useState<WorkTypeFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  // Mock data
  const encounterItems: EncounterItem[] = [
    {
      id: '1',
      patientName: 'K. Williams',
      visitType: 'Retina consult',
      status: 'doc-provider-review',
      provider: 'Dr. Kim',
      payer: 'BCBS',
      visitDate: 'Today',
      visitTime: '10:30 AM',
      timing: '2 hours ago',
    },
    {
      id: '2',
      patientName: 'J. Martinez',
      visitType: 'Post-op follow-up',
      status: 'coding-needs-review',
      provider: 'Dr. Lee',
      payer: 'Aetna PPO',
      visitDate: 'Today',
      visitTime: '9:00 AM',
      timing: '4 hours ago',
    },
    {
      id: '3',
      patientName: 'Maria Garcia',
      visitType: 'Cataract surgery',
      status: 'coding-ai-draft',
      provider: 'Dr. Patel',
      payer: 'Medicare',
      visitDate: 'Yesterday',
      visitTime: '3:00 PM',
      timing: '1 day ago',
    },
    {
      id: '4',
      patientName: 'S. Chen',
      visitType: 'Annual exam',
      status: 'doc-transcript-ready',
      provider: 'Dr. Kim',
      payer: 'Humana PPO',
      visitDate: 'Yesterday',
      visitTime: '11:00 AM',
      timing: '1 day ago',
    },
    {
      id: '5',
      patientName: 'Linda Brown',
      visitType: 'AMD injection',
      status: 'coding-completed',
      provider: 'Dr. Lee',
      payer: 'UHC',
      visitDate: 'Nov 24',
      visitTime: '2:00 PM',
      timing: '2 days ago',
    },
  ];

  const getStatusLabel = (status: EncounterStatus): string => {
    const labels: Record<EncounterStatus, string> = {
      'doc-transcript-ready': 'Documentation · Transcript ready',
      'doc-provider-review': 'Documentation · Provider review',
      'coding-ai-draft': 'Coding · AI draft',
      'coding-needs-review': 'Coding · Needs coder review',
      'coding-completed': 'Coding · Completed',
    };
    return labels[status];
  };

  const getStatusPillStyle = (status: EncounterStatus): string => {
    if (status === 'coding-completed') {
      return 'bg-emerald-50/60 text-emerald-700/85 border-emerald-200/40';
    }
    if (status === 'coding-needs-review') {
      return 'bg-orange-50/60 text-orange-700/85 border-orange-200/40';
    }
    if (status === 'doc-provider-review') {
      return 'bg-amber-50/70 text-amber-700/85 border-amber-200/40';
    }
    if (status === 'coding-ai-draft') {
      return 'bg-yellow-50/70 text-yellow-700/85 border-yellow-200/40';
    }
    return 'bg-slate-50/60 text-slate-600/85 border-slate-200/40';
  };

  const getActionLabel = (status: EncounterStatus): string => {
    if (status.startsWith('doc-')) return 'Open note';
    if (status === 'coding-completed') return 'Review';
    return 'Open coding';
  };

  const handleRowSelect = (id: string) => {
    setSelectedRows(prev =>
      prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]
    );
  };

  const filteredItems = encounterItems.filter(item => {
    if (roleFilter === 'provider' && !item.status.startsWith('doc-')) return false;
    if (roleFilter === 'coder' && !item.status.startsWith('coding-')) return false;
    
    if (workTypeFilter === 'documentation' && !item.status.startsWith('doc-')) return false;
    if (workTypeFilter === 'coding' && !item.status.startsWith('coding-')) return false;
    
    if (statusFilter === 'completed' && item.status !== 'coding-completed') return false;
    if (statusFilter === 'in-progress' && item.status === 'coding-completed') return false;
    
    return true;
  });

  // Calculate metrics
  const readyToBill = encounterItems.filter(i => i.status === 'coding-completed').length;
  const needsDocumentation = encounterItems.filter(i => i.status.startsWith('doc-')).length;
  const needsCoding = encounterItems.filter(i => i.status.startsWith('coding-') && i.status !== 'coding-completed').length;

  const total = encounterItems.length;
  const readyPercent = Math.round((readyToBill / total) * 100);
  const docPercent = Math.round((needsDocumentation / total) * 100);
  const codingPercent = Math.round((needsCoding / total) * 100);

  return (
    <div className="h-full overflow-auto bg-[#f5f5f7]">
      <div className="max-w-[1400px] mx-auto px-8 py-8">
        {/* Card 1: Overview */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-[16px] font-semibold text-[#101828] tracking-[-0.02em] mb-1">
                Documentation & coding overview
              </h2>
              <p className="text-[12px] text-[#6a7282]">
                Encounters in the next 7 days
              </p>
            </div>
            <div className="relative">
              <select
                value={overviewTimeFilter}
                onChange={(e) => setOverviewTimeFilter(e.target.value as TimeFilter)}
                className="appearance-none px-4 py-2 pr-8 bg-white border border-gray-300 rounded-lg text-[13px] text-[#101828] hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer transition-colors"
              >
                <option value="3">Next 3 days</option>
                <option value="7">Next 7 days</option>
                <option value="14">Next 14 days</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 size-4 text-[#6a7282] pointer-events-none" />
            </div>
          </div>

          {/* Three metrics */}
          <div className="grid grid-cols-3 gap-6 mb-6">
            <div>
              <div className="text-[32px] font-semibold text-[#101828] tracking-[-0.02em] mb-1">
                {readyToBill}
              </div>
              <div className="text-[13px] font-medium text-[#101828] mb-0.5">
                Ready to bill
              </div>
              <div className="text-[12px] text-[#6a7282]">
                Documentation and coding complete
              </div>
            </div>
            <div>
              <div className="text-[32px] font-semibold text-[#101828] tracking-[-0.02em] mb-1">
                {needsDocumentation}
              </div>
              <div className="text-[13px] font-medium text-[#101828] mb-0.5">
                Needs documentation
              </div>
              <div className="text-[12px] text-[#6a7282]">
                Note or transcript needs provider review
              </div>
            </div>
            <div>
              <div className="text-[32px] font-semibold text-[#101828] tracking-[-0.02em] mb-1">
                {needsCoding}
              </div>
              <div className="text-[13px] font-medium text-[#101828] mb-0.5">
                Needs coding
              </div>
              <div className="text-[12px] text-[#6a7282]">
                Awaiting coder review or approval
              </div>
            </div>
          </div>

          {/* Readiness bar */}
          <div className="border-t border-gray-200 pt-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[12px] text-[#6a7282]">Readiness mix</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden flex">
                {readyToBill > 0 && (
                  <div
                    className="bg-emerald-500 h-full"
                    style={{ width: `${readyPercent}%` }}
                  />
                )}
                {needsDocumentation > 0 && (
                  <div
                    className="bg-amber-400 h-full"
                    style={{ width: `${docPercent}%` }}
                  />
                )}
                {needsCoding > 0 && (
                  <div
                    className="bg-orange-500 h-full"
                    style={{ width: `${codingPercent}%` }}
                  />
                )}
              </div>
              <div className="flex items-center gap-4 text-[11px]">
                <div className="flex items-center gap-1.5">
                  <div className="size-2 rounded-full bg-emerald-500" />
                  <span className="text-[#6a7282]">Ready ({readyPercent}%)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="size-2 rounded-full bg-amber-400" />
                  <span className="text-[#6a7282]">Documentation ({docPercent}%)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="size-2 rounded-full bg-orange-500" />
                  <span className="text-[#6a7282]">Coding ({codingPercent}%)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Work to do */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-[16px] font-semibold text-[#101828] tracking-[-0.02em] mb-1">
                Documentation & coding work to do
              </h2>
              <p className="text-[12px] text-[#6a7282]">
                Encounters that need note completion or coding before billing
              </p>
            </div>
            <div className="relative">
              <select
                value={workListTimeFilter}
                onChange={(e) => setWorkListTimeFilter(e.target.value as TimeFilter)}
                className="appearance-none px-4 py-2 pr-8 bg-white border border-gray-300 rounded-lg text-[13px] text-[#101828] hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer transition-colors"
              >
                <option value="3">Next 3 days</option>
                <option value="7">Next 7 days</option>
                <option value="14">Next 14 days</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 size-4 text-[#6a7282] pointer-events-none" />
            </div>
          </div>

          {/* Filter chips */}
          <div className="flex items-center gap-6 mb-5 pb-5 border-b border-gray-200">
            {/* ROLE */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-[#6a7282] uppercase tracking-wider">
                ROLE
              </span>
              <div className="flex gap-1.5">
                {(['all', 'provider', 'coder'] as const).map((role) => (
                  <button
                    key={role}
                    onClick={() => setRoleFilter(role)}
                    className={`px-3 py-1 rounded-md text-[12px] font-medium transition-all ${
                      roleFilter === role
                        ? 'bg-[#101828] text-white'
                        : 'bg-gray-100 text-[#4a5565] hover:bg-gray-200'
                    }`}
                  >
                    {role === 'all' ? 'All' : role.charAt(0).toUpperCase() + role.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* WORK TYPE */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-[#6a7282] uppercase tracking-wider">
                WORK TYPE
              </span>
              <div className="flex gap-1.5">
                {(['all', 'documentation', 'coding', 'audit'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setWorkTypeFilter(type)}
                    className={`px-3 py-1 rounded-md text-[12px] font-medium transition-all ${
                      workTypeFilter === type
                        ? 'bg-[#101828] text-white'
                        : 'bg-gray-100 text-[#4a5565] hover:bg-gray-200'
                    }`}
                  >
                    {type === 'all' ? 'All' : type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* STATUS */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-[#6a7282] uppercase tracking-wider">
                STATUS
              </span>
              <div className="flex gap-1.5">
                {(['all', 'not-started', 'in-progress', 'ready-for-review', 'completed'] as const).map((status) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`px-3 py-1 rounded-md text-[12px] font-medium transition-all ${
                      statusFilter === status
                        ? 'bg-[#101828] text-white'
                        : 'bg-gray-100 text-[#4a5565] hover:bg-gray-200'
                    }`}
                  >
                    {status === 'all' ? 'All' : status.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-3 py-2 text-left">
                    <input
                      type="checkbox"
                      className="size-4 rounded border-gray-300 text-[#101828] focus:ring-2 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-3 py-2 text-left text-[11px] text-[#6a7282] uppercase tracking-wider">
                    Work item
                  </th>
                  <th className="px-3 py-2 text-left text-[11px] text-[#6a7282] uppercase tracking-wider">
                    Step
                  </th>
                  <th className="px-3 py-2 text-left text-[11px] text-[#6a7282] uppercase tracking-wider">
                    Provider / Payer
                  </th>
                  <th className="px-3 py-2 text-left text-[11px] text-[#6a7282] uppercase tracking-wider">
                    Visit date / time
                  </th>
                  <th className="px-3 py-2 text-right text-[11px] text-[#6a7282] uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item) => (
                  <Fragment key={item.id}>
                    <tr className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors cursor-pointer group">
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
                            Visit · {item.visitType}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-medium border ${getStatusPillStyle(item.status)}`}>
                          {getStatusLabel(item.status)}
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
                      <td className="px-3 py-3">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[13px] text-[#4a5565] tracking-[-0.15px]">
                            {item.visitDate} · {item.visitTime}
                          </span>
                          <span className="text-[11px] text-[#6a7282]">
                            {item.timing}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-right">
                        <button className="inline-flex items-center gap-1 text-[13px] text-[#4a5565] hover:text-[#101828] transition-colors group-hover:text-[#101828]">
                          <span>{getActionLabel(item.status)}</span>
                          <ChevronRight className="size-3.5" />
                        </button>
                      </td>
                    </tr>
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
