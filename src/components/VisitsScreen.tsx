import { useState, useEffect } from 'react';
import { Mic, Play } from 'lucide-react';
import { getVisits, initVisits, Visit as APIVisit, diagnoseDatabase } from '../utils/api';

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
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [diagnostics, setDiagnostics] = useState<any>(null);

  useEffect(() => {
    loadVisits();
  }, []);

  const loadVisits = async () => {
    try {
      setLoading(true);
      setError(null);
      setDiagnostics(null);
      
      // Try to get visits
      let response = await getVisits();
      
      // If no visits exist, initialize them
      if (!response.visits || response.visits.length === 0) {
        console.log('No visits found, initializing...');
        await initVisits();
        response = await getVisits();
      }
      
      // Transform API data to component format
      const transformedVisits: Visit[] = response.visits.map((v: APIVisit) => ({
        id: v.id,
        patientName: v.patient_name,
        dateTime: `${formatDate(v.visit_date)}, ${v.visit_time}`,
        provider: v.provider,
        payer: v.payer,
        status: v.status,
        chargeEstimate: `$${v.charge_estimate}`,
      }));
      
      setVisits(transformedVisits);
    } catch (err) {
      console.error('Error loading visits:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load visits';
      
      // Run diagnostics when error occurs
      try {
        const diagData = await diagnoseDatabase();
        setDiagnostics(diagData);
        console.log('Diagnostics:', diagData);
      } catch (diagErr) {
        console.error('Failed to run diagnostics:', diagErr);
      }
      
      // Check if it's a schema cache error
      if (errorMessage.includes('schema cache') || errorMessage.includes('PGRST205')) {
        setError('SCHEMA_CACHE_ERROR');
      }
      // Check if it's a table not found error
      else if (errorMessage.includes('Could not find the table') || errorMessage.includes('relation') || errorMessage.includes('does not exist')) {
        setError('DATABASE_NOT_SETUP');
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const visitDate = new Date(date);
    visitDate.setHours(0, 0, 0, 0);
    
    if (visitDate.getTime() === today.getTime()) {
      return 'Today';
    }
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

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
      case 'to-record': return 'bg-emerald-50 text-emerald-600';
      case 'transcribing': return 'bg-emerald-100 text-emerald-600';
      case 'to-review': return 'bg-emerald-100 text-emerald-700';
      case 'approved': return 'bg-emerald-100 text-emerald-800';
      case 'sent': return 'bg-slate-100 text-slate-600';
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
          className="flex items-center justify-end gap-1.5 px-3 py-1.5 text-[12px] text-[#101828] hover:text-[#1f2937] font-medium ml-auto"
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
          className="px-3 py-1.5 text-[12px] text-[#101828] hover:text-[#1f2937] font-medium ml-auto"
        >
          Review
        </button>
      );
    }
    if (visit.status === 'approved') {
      return (
        <button
          onClick={() => onSendToAthena(visit.id)}
          className="px-3 py-1.5 text-[12px] text-[#101828] hover:text-[#1f2937] font-medium ml-auto whitespace-nowrap"
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
        
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#101828] mx-auto mb-4"></div>
              <p className="text-[13px] text-[#6a7282]">Loading visits...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
            {error === 'DATABASE_NOT_SETUP' ? (
              <>
                <h3 className="text-[15px] font-semibold text-red-800 mb-2">Database Setup Required</h3>
                <p className="text-[13px] text-red-700 mb-4">
                  The visits table hasn't been created in Supabase yet. Please follow these steps:
                </p>
                <ol className="list-decimal list-inside space-y-2 text-[13px] text-red-700 mb-4">
                  <li>Open your Supabase dashboard</li>
                  <li>Navigate to SQL Editor</li>
                  <li>Run the SQL from <code className="bg-red-100 px-1 py-0.5 rounded">SUPABASE_SETUP.md</code></li>
                </ol>
                <div className="bg-red-100 rounded p-3 mb-4">
                  <p className="text-[11px] font-medium text-red-900 mb-2">Quick SQL:</p>
                  <pre className="text-[10px] text-red-800 overflow-x-auto whitespace-pre-wrap">
{`CREATE TABLE visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_name TEXT NOT NULL,
  patient_age INTEGER,
  visit_date DATE NOT NULL,
  visit_time TEXT NOT NULL,
  provider TEXT NOT NULL,
  payer TEXT NOT NULL,
  visit_reason TEXT NOT NULL,
  status TEXT NOT NULL,
  charge_estimate INTEGER NOT NULL,
  member_id TEXT,
  group_number TEXT,
  pre_visit_step TEXT,
  pre_visit_risk TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE visits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all" ON visits FOR ALL USING (true);

NOTIFY pgrst, 'reload schema';`}
                  </pre>
                </div>
                <button 
                  onClick={loadVisits}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg text-[12px] font-medium hover:bg-red-700 transition-colors"
                >
                  Retry After Setup
                </button>
              </>
            ) : error === 'SCHEMA_CACHE_ERROR' ? (
              <>
                <h3 className="text-[15px] font-semibold text-amber-800 mb-2">⚠️ Schema Cache Refresh Needed</h3>
                <p className="text-[13px] text-amber-700 mb-4">
                  The visits table exists, but Supabase's API needs to refresh its schema cache. Follow one of these options:
                </p>
                
                {diagnostics && (
                  <div className="bg-amber-100 border border-amber-300 rounded-lg p-3 mb-4">
                    <p className="text-[11px] font-semibold text-amber-900 mb-2">Diagnostic Info:</p>
                    <pre className="text-[10px] text-amber-800 overflow-x-auto">
                      {JSON.stringify({
                        errorCode: diagnostics.errorCode,
                        errorMessage: diagnostics.error,
                        tableExists: diagnostics.tableExists,
                        canQuery: diagnostics.canQuery,
                      }, null, 2)}
                    </pre>
                  </div>
                )}
                
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                  <p className="text-[12px] font-semibold text-amber-900 mb-3">Option 1: Reload Schema Cache (Recommended)</p>
                  <ol className="list-decimal list-inside space-y-1.5 text-[12px] text-amber-800 mb-3">
                    <li>Go to your <strong>Supabase Dashboard</strong></li>
                    <li>Navigate to <strong>Settings → API</strong></li>
                    <li>Scroll down and click <strong>\"Reload schema cache\"</strong> button</li>
                    <li>Wait 10-15 seconds for the cache to fully reload</li>
                    <li>Click Retry below</li>
                  </ol>
                </div>
                
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                  <p className="text-[12px] font-semibold text-amber-900 mb-3">Option 2: Verify Table & Policy</p>
                  <p className="text-[12px] text-amber-800 mb-2">Run this SQL in your Supabase SQL Editor to check the table:</p>
                  <pre className="bg-amber-100 rounded p-2 text-[11px] text-amber-900 overflow-x-auto mb-3">
{`-- Check table exists
SELECT schemaname, tablename, tableowner, rowsecurity
FROM pg_tables 
WHERE tablename = 'visits';

-- Check RLS policies
SELECT schemaname, tablename, policyname
FROM pg_policies 
WHERE tablename = 'visits';`}
                  </pre>
                  <p className="text-[11px] text-amber-700 mb-2">If the table doesn't exist or has no policy, run:</p>
                  <pre className="bg-amber-100 rounded p-2 text-[11px] text-amber-900 overflow-x-auto">
{`CREATE POLICY \"Allow all operations on visits\" ON visits
  FOR ALL USING (true) WITH CHECK (true);`}
                  </pre>
                </div>
                
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                  <p className="text-[12px] font-semibold text-amber-900 mb-3">Option 3: Force Cache Reload via SQL</p>
                  <p className="text-[12px] text-amber-800 mb-2">Run this in your Supabase SQL Editor:</p>
                  <pre className="bg-amber-100 rounded p-2 text-[11px] text-amber-900 overflow-x-auto mb-2">
                    NOTIFY pgrst, 'reload schema';
                  </pre>
                  <p className="text-[11px] text-amber-700">Wait 10 seconds, then click Retry below</p>
                </div>
                
                <button 
                  onClick={loadVisits}
                  className="px-4 py-2 bg-amber-600 text-white rounded-lg text-[12px] font-medium hover:bg-amber-700 transition-colors"
                >
                  Retry After Refresh
                </button>
              </>
            ) : (
              <>
                <p className="text-[13px] text-red-700">Error loading visits: {error}</p>
                <button 
                  onClick={loadVisits}
                  className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg text-[12px] font-medium hover:bg-red-700 transition-colors"
                >
                  Retry
                </button>
              </>
            )}
          </div>
        )}

        {!loading && !error && (
          <>
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
                <div className="size-2 rounded-full bg-emerald-500" />
                <span className="text-[12px] text-[#6a7282]">To record:</span>
                <span className="text-[13px] font-semibold text-[#101828]">{stats.toRecord}</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg">
                <div className="size-2 rounded-full bg-emerald-600" />
                <span className="text-[12px] text-[#6a7282]">To review:</span>
                <span className="text-[13px] font-semibold text-[#101828]">{stats.toReview}</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg">
                <div className="size-2 rounded-full bg-emerald-700" />
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
                  className="bg-emerald-500 hover:bg-emerald-600 transition-colors cursor-pointer"
                  style={{ width: `${(stats.toRecord / total) * 100}%` }}
                  title={`${stats.toRecord} / ${total} To record`}
                />
                <div
                  className="bg-emerald-600 hover:bg-emerald-700 transition-colors cursor-pointer"
                  style={{ width: `${(stats.toReview / total) * 100}%` }}
                  title={`${stats.toReview} / ${total} To review`}
                />
                <div
                  className="bg-emerald-700 hover:bg-emerald-800 transition-colors cursor-pointer"
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
                  <span className="ml-2 px-1.5 py-0.5 bg-emerald-100 text-emerald-700 rounded text-[11px] font-medium">
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
                  <span className="ml-2 px-1.5 py-0.5 bg-emerald-200 text-emerald-800 rounded text-[11px] font-medium">
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
                  <span className="ml-2 px-1.5 py-0.5 bg-emerald-300 text-emerald-900 rounded text-[11px] font-medium">
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
        </>
        )}
      </div>
    </div>
  );
}