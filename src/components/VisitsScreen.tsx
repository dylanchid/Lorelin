import { useState } from 'react';
import { Mic, Play } from 'lucide-react';

type StatusTab = 'to-record' | 'to-review' | 'approved' | 'all';
type VisitStatus = 'to-record' | 'transcribing' | 'to-review' | 'approved' | 'sent';

interface Visit {
  id: string;
  patientName: string;
  dateTime: string;
  provider: string;
  payer: string;
  status: VisitStatus;
  chargeEstimate?: string;
}

interface VisitsScreenProps {
  onViewVisit: (visitId: string) => void;
  onRecordVisit: (visitId: string) => void;
  onSendToAthena: (visitId: string) => void;
}

export function VisitsScreen({ onViewVisit, onRecordVisit, onSendToAthena }: VisitsScreenProps) {
  const [activeTab, setActiveTab] = useState<StatusTab>('all');
  const [dateFilter, setDateFilter] = useState('today');
  const [providerFilter, setProviderFilter] = useState('all');

  // Mock data
  const visits: Visit[] = [
    { id: '1', patientName: 'Jane Doe', dateTime: 'Mar 2, 10:00 AM', provider: 'Dr. Lee', payer: 'Medicare', status: 'to-record', chargeEstimate: '$285' },
    { id: '2', patientName: 'Robert Chen', dateTime: 'Mar 2, 10:30 AM', provider: 'Dr. Lee', payer: 'Aetna', status: 'to-record', chargeEstimate: '$320' },
    { id: '3', patientName: 'Maria Garcia', dateTime: 'Mar 2, 11:00 AM', provider: 'Dr. Lee', payer: 'UHC', status: 'to-review', chargeEstimate: '$450' },
    { id: '4', patientName: 'John Smith', dateTime: 'Mar 2, 11:30 AM', provider: 'Dr. Patel', payer: 'BCBS', status: 'to-review', chargeEstimate: '$380' },
    { id: '5', patientName: 'Linda Brown', dateTime: 'Mar 2, 1:00 PM', provider: 'Dr. Lee', payer: 'Medicare', status: 'approved', chargeEstimate: '$295' },
    { id: '6', patientName: 'David Wilson', dateTime: 'Mar 2, 1:30 PM', provider: 'Dr. Patel', payer: 'Cigna', status: 'approved', chargeEstimate: '$340' },
    { id: '7', patientName: 'Sarah Johnson', dateTime: 'Mar 2, 2:00 PM', provider: 'Dr. Lee', payer: 'Medicare', status: 'sent', chargeEstimate: '$310' },
    { id: '8', patientName: 'Michael Davis', dateTime: 'Mar 2, 2:30 PM', provider: 'Dr. Patel', payer: 'Aetna', status: 'transcribing', chargeEstimate: '$275' },
  ];

  // Pipeline stats
  const stats = {
    toRecord: visits.filter(v => v.status === 'to-record').length,
    toReview: visits.filter(v => v.status === 'to-review' || v.status === 'transcribing').length,
    approved: visits.filter(v => v.status === 'approved').length,
    sent: visits.filter(v => v.status === 'sent').length,
  };

  const total = visits.length;

  // Filter visits based on active tab
  const filteredVisits = visits.filter(visit => {
    if (activeTab === 'to-record') return visit.status === 'to-record';
    if (activeTab === 'to-review') return visit.status === 'to-review' || visit.status === 'transcribing';
    if (activeTab === 'approved') return visit.status === 'approved';
    return true; // 'all' shows everything
  });

  const getStatusColor = (status: VisitStatus) => {
    switch (status) {
      case 'to-record': return 'bg-blue-50 text-blue-600';
      case 'transcribing': return 'bg-blue-100 text-blue-700';
      case 'to-review': return 'bg-blue-100 text-blue-700';
      case 'approved': return 'bg-blue-200 text-blue-800';
      case 'sent': return 'bg-slate-200 text-slate-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusLabel = (status: VisitStatus) => {
    switch (status) {
      case 'to-record': return 'To record';
      case 'transcribing': return 'Transcribing';
      case 'to-review': return 'To review';
      case 'approved': return 'Approved';
      case 'sent': return 'Sent';
      default: return status;
    }
  };

  const getActionButton = (visit: Visit) => {
    if (visit.status === 'to-record') {
      return (
        <button
          onClick={() => onRecordVisit(visit.id)}
          className="flex items-center justify-end gap-1.5 px-3 py-1.5 text-[12px] text-blue-600 hover:text-blue-700 font-medium ml-auto"
        >
          <Mic className="size-3.5" />
          Record
        </button>
      );
    }
    if (visit.status === 'to-review' || visit.status === 'transcribing') {
      return (
        <button
          onClick={() => onViewVisit(visit.id)}
          className="px-3 py-1.5 text-[12px] text-blue-600 hover:text-blue-700 font-medium ml-auto"
        >
          Review
        </button>
      );
    }
    if (visit.status === 'approved') {
      return (
        <button
          onClick={() => onSendToAthena(visit.id)}
          className="px-3 py-1.5 text-[12px] text-blue-600 hover:text-blue-700 font-medium ml-auto whitespace-nowrap"
        >
          Send to Athena
        </button>
      );
    }
    if (visit.status === 'sent') {
      return (
        <button className="px-3 py-1.5 text-[12px] text-[#6a7282] hover:text-[#4a5565] font-medium ml-auto whitespace-nowrap">
          View claim
        </button>
      );
    }
    return null;
  };

  return (
    <div className="size-full overflow-auto bg-[#f5f5f7]">
      <div className="max-w-[1600px] mx-auto px-[60px] py-[60px]">
        
        {/* Main white card */}
        <div className="bg-white border border-gray-200 rounded-lg">
          
          {/* Header row */}
          <div className="px-8 py-6 border-b border-gray-200">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-[24px] font-semibold text-[#101828] tracking-[-0.02em] mb-1">
                  Patient visits
                </h1>
                <p className="text-[13px] text-[#6a7282]">
                  Review notes, codes, and approve charges
                </p>
              </div>

              <div className="flex items-center gap-3">
                {/* Date filter */}
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-[13px] text-[#101828] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
                >
                  <option value="today">Today</option>
                  <option value="last-7">Last 7 days</option>
                  <option value="custom">Custom</option>
                </select>

                {/* Provider filter */}
                <select
                  value={providerFilter}
                  onChange={(e) => setProviderFilter(e.target.value)}
                  className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-[13px] text-[#101828] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
                >
                  <option value="all">Provider: All</option>
                  <option value="dr-lee">Dr. Lee</option>
                  <option value="dr-patel">Dr. Patel</option>
                </select>

                {/* Start recording button */}
                <button className="flex items-center gap-2 px-5 py-2.5 bg-[#101828] text-white rounded-lg text-[13px] font-medium hover:bg-[#1f2937] transition-colors">
                  <Mic className="size-4" />
                  Start recording
                </button>
              </div>
            </div>
          </div>

          {/* Visual pipeline strip */}
          <div className="px-8 py-5 border-b border-gray-200 bg-gray-50">
            {/* Stats chips */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg">
                <div className="size-2 rounded-full bg-blue-400" />
                <span className="text-[12px] text-[#6a7282]">To record:</span>
                <span className="text-[13px] font-semibold text-[#101828]">{stats.toRecord}</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg">
                <div className="size-2 rounded-full bg-blue-500" />
                <span className="text-[12px] text-[#6a7282]">To review:</span>
                <span className="text-[13px] font-semibold text-[#101828]">{stats.toReview}</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg">
                <div className="size-2 rounded-full bg-blue-600" />
                <span className="text-[12px] text-[#6a7282]">Approved:</span>
                <span className="text-[13px] font-semibold text-[#101828]">{stats.approved}</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg">
                <div className="size-2 rounded-full bg-slate-500" />
                <span className="text-[12px] text-[#6a7282]">Sent to Athena:</span>
                <span className="text-[13px] font-semibold text-[#101828]">{stats.sent}</span>
              </div>
            </div>

            {/* Pipeline bar */}
            <div className="relative">
              <div className="flex h-3 rounded-full overflow-hidden bg-gray-200">
                <div
                  className="bg-blue-400 hover:bg-blue-500 transition-colors cursor-pointer"
                  style={{ width: `${(stats.toRecord / total) * 100}%` }}
                  title={`${stats.toRecord} / ${total} To record`}
                />
                <div
                  className="bg-blue-500 hover:bg-blue-600 transition-colors cursor-pointer"
                  style={{ width: `${(stats.toReview / total) * 100}%` }}
                  title={`${stats.toReview} / ${total} To review`}
                />
                <div
                  className="bg-blue-600 hover:bg-blue-700 transition-colors cursor-pointer"
                  style={{ width: `${(stats.approved / total) * 100}%` }}
                  title={`${stats.approved} / ${total} Approved`}
                />
                <div
                  className="bg-slate-500 hover:bg-slate-600 transition-colors cursor-pointer"
                  style={{ width: `${(stats.sent / total) * 100}%` }}
                  title={`${stats.sent} / ${total} Sent to Athena`}
                />
              </div>
              <div className="text-[11px] text-[#6a7282] mt-2">
                {total} total visits today
              </div>
            </div>
          </div>

          {/* Status tabs */}
          <div className="px-8 pt-5 pb-0 border-b border-gray-200">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setActiveTab('to-record')}
                className={`px-4 py-2.5 text-[13px] font-medium border-b-2 transition-colors ${
                  activeTab === 'to-record'
                    ? 'border-[#101828] text-[#101828]'
                    : 'border-transparent text-[#6a7282] hover:text-[#4a5565]'
                }`}
              >
                To record
                {stats.toRecord > 0 && (
                  <span className="ml-2 px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded text-[11px] font-medium">
                    {stats.toRecord}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('to-review')}
                className={`px-4 py-2.5 text-[13px] font-medium border-b-2 transition-colors ${
                  activeTab === 'to-review'
                    ? 'border-[#101828] text-[#101828]'
                    : 'border-transparent text-[#6a7282] hover:text-[#4a5565]'
                }`}
              >
                To review
                {stats.toReview > 0 && (
                  <span className="ml-2 px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded text-[11px] font-medium">
                    {stats.toReview}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('approved')}
                className={`px-4 py-2.5 text-[13px] font-medium border-b-2 transition-colors ${
                  activeTab === 'approved'
                    ? 'border-[#101828] text-[#101828]'
                    : 'border-transparent text-[#6a7282] hover:text-[#4a5565]'
                }`}
              >
                Approved
                {stats.approved > 0 && (
                  <span className="ml-2 px-1.5 py-0.5 bg-blue-200 text-blue-800 rounded text-[11px] font-medium">
                    {stats.approved}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('all')}
                className={`px-4 py-2.5 text-[13px] font-medium border-b-2 transition-colors ${
                  activeTab === 'all'
                    ? 'border-[#101828] text-[#101828]'
                    : 'border-transparent text-[#6a7282] hover:text-[#4a5565]'
                }`}
              >
                All
              </button>
            </div>
          </div>

          {/* Visits table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      className="size-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-[11px] text-[#6a7282] uppercase tracking-wider font-medium">
                    Patient
                  </th>
                  <th className="px-6 py-3 text-left text-[11px] text-[#6a7282] uppercase tracking-wider font-medium">
                    Date & time
                  </th>
                  <th className="px-6 py-3 text-left text-[11px] text-[#6a7282] uppercase tracking-wider font-medium">
                    Provider
                  </th>
                  <th className="px-6 py-3 text-left text-[11px] text-[#6a7282] uppercase tracking-wider font-medium">
                    Payer
                  </th>
                  {activeTab === 'all' && (
                    <th className="px-6 py-3 text-left text-[11px] text-[#6a7282] uppercase tracking-wider font-medium">
                      Status
                    </th>
                  )}
                  <th className="px-6 py-3 text-right text-[11px] text-[#6a7282] uppercase tracking-wider font-medium">
                    Charge estimate
                  </th>
                  <th className="px-6 py-3 text-right text-[11px] text-[#6a7282] uppercase tracking-wider font-medium">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredVisits.map((visit) => (
                  <tr
                    key={visit.id}
                    className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        className="size-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[13px] font-medium text-[#101828]">
                        {visit.patientName}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[13px] text-[#4a5565]">
                        {visit.dateTime}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[13px] text-[#4a5565]">
                        {visit.provider}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[13px] text-[#4a5565]">
                        {visit.payer}
                      </span>
                    </td>
                    {activeTab === 'all' && (
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-[11px] font-medium ${getStatusColor(visit.status)}`}>
                          {getStatusLabel(visit.status)}
                        </span>
                      </td>
                    )}
                    <td className="px-6 py-4 text-right">
                      <span className="text-[13px] font-medium text-[#101828]">
                        {visit.chargeEstimate}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {getActionButton(visit)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}