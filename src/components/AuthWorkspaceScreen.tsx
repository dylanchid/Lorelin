import { useState } from 'react';
import { ArrowLeft, Check, X, AlertCircle, Loader2, ChevronDown } from 'lucide-react';

interface AuthWorkspaceScreenProps {
  onBack: () => void;
  initialAuthStatus?: AuthStatus;
}

type AuthStatus = 'needed' | 'draft-ready' | 'submitting' | 'submitted' | 'approved' | 'denied';
type SubmitStatus = 'draft' | 'submitting' | 'success' | 'failure' | 'needs-mfa';

export function AuthWorkspaceScreen({ onBack, initialAuthStatus = 'draft-ready' }: AuthWorkspaceScreenProps) {
  const [authStatus, setAuthStatus] = useState<AuthStatus>(initialAuthStatus);
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>(initialAuthStatus === 'submitted' || initialAuthStatus === 'approved' ? 'success' : 'draft');
  const [reviewedChecked, setReviewedChecked] = useState(false);
  const [clinicalJustification, setClinicalJustification] = useState(
    "76-year-old patient with visually significant cataract OD. Best corrected visual acuity 20/60 with significant glare and difficulty with daily activities including reading and driving. Conservative measures including updated glasses prescription have been unsuccessful. Patient is appropriate candidate for cataract extraction with IOL implantation."
  );
  const [notes, setNotes] = useState('');
  const [submittingStep, setSubmittingStep] = useState(0);
  const [overallReady, setOverallReady] = useState(false);

  // Mock data for approved state
  const approvedData = {
    paId: 'ABC123456',
    validFrom: '12/01/25',
    validTo: '02/28/26',
    approvedDate: 'Dec 1 09:15',
    approvedBy: 'Amy'
  };

  const handleSubmit = () => {
    setSubmitStatus('submitting');
    setSubmittingStep(0);
    
    // Simulate submission progress
    const steps = [
      { delay: 500, step: 1 },
      { delay: 1500, step: 2 },
      { delay: 2500, step: 3 },
      { delay: 3500, step: 4 },
    ];
    
    steps.forEach(({ delay, step }) => {
      setTimeout(() => setSubmittingStep(step), delay);
    });
    
    // Simulate success after all steps
    setTimeout(() => {
      setSubmitStatus('success');
    }, 4000);
  };

  const handleRetry = () => {
    setSubmitStatus('draft');
    setReviewedChecked(false);
  };

  const handleCopyRequest = () => {
    // Copy all request details to clipboard
    const requestText = `
PRIOR AUTHORIZATION REQUEST

Patient: K. Williams (ID 12345)
DOB: 03/15/1949
Service: Cataract surgery · Right eye
Provider: Dr. Ganti
Payer: BCBS PPO

CPT Codes:
- 66984: Cataract extraction with IOL

ICD-10 Codes:
- H25.13: Age-related nuclear cataract, bilateral

Clinical Justification:
${clinicalJustification}
    `.trim();
    
    navigator.clipboard.writeText(requestText);
    // Could show a toast notification here
  };

  return (
    <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col items-start pb-8 pt-6 px-8 relative w-full min-h-full bg-[#f5f5f7]">
      {/* Dev Controls - for testing different states */}
      <div className="w-full mb-4 p-3 bg-white rounded-lg border border-gray-200">
        <div className="text-[11px] text-[#6a7282] uppercase tracking-[0.05em] mb-2">Demo Controls (dev only)</div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => { setAuthStatus('needed'); setSubmitStatus('draft'); }} className="px-2 py-1 text-[11px] border border-gray-200 rounded hover:bg-gray-50">Auth Needed</button>
          <button onClick={() => { setAuthStatus('draft-ready'); setSubmitStatus('draft'); }} className="px-2 py-1 text-[11px] border border-gray-200 rounded hover:bg-gray-50">Draft Ready</button>
          <button onClick={() => { setAuthStatus('submitted'); setSubmitStatus('success'); }} className="px-2 py-1 text-[11px] border border-gray-200 rounded hover:bg-gray-50">Submitted</button>
          <button onClick={() => { setAuthStatus('approved'); setSubmitStatus('success'); setOverallReady(true); }} className="px-2 py-1 text-[11px] border border-gray-200 rounded hover:bg-gray-50">Approved</button>
          <button onClick={() => setSubmitStatus('failure')} className="px-2 py-1 text-[11px] border border-gray-200 rounded hover:bg-gray-50">Test Failure</button>
          <button onClick={() => setSubmitStatus('needs-mfa')} className="px-2 py-1 text-[11px] border border-gray-200 rounded hover:bg-gray-50">Test MFA</button>
        </div>
      </div>
      
      {/* Header Bar */}
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
              K. Williams · Cataract surgery – Right eye
            </h1>
            <p className="text-[13px] text-[#6a7282] tracking-[-0.15px]">
              ID 12345 · BCBS PPO · Dr. Ganti · Dec 8 · 10:30 AM
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] border ${
                authStatus === 'approved' ? 'bg-emerald-50/80 text-emerald-700/90 border-emerald-200/40' :
                authStatus === 'submitted' ? 'bg-blue-50/70 text-blue-700/90 border-blue-200/40' :
                authStatus === 'submitting' ? 'bg-blue-50/70 text-blue-700/90 border-blue-200/40' :
                authStatus === 'denied' ? 'bg-red-50/80 text-red-700/90 border-red-200/40' :
                authStatus === 'needed' ? 'bg-amber-50/80 text-amber-700/90 border-amber-200/40' :
                'bg-gray-50/70 text-gray-600/90 border-gray-200/40'
              }`}>
                {authStatus === 'approved' ? 'Auth – Approved' :
                 authStatus === 'submitted' ? 'Auth – Submitted' :
                 authStatus === 'submitting' ? 'Auth – Submitting' :
                 authStatus === 'denied' ? 'Auth – Denied' :
                 authStatus === 'needed' ? 'Auth – Needed' :
                 'Auth – Draft ready'}
              </span>
              {overallReady && (
                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] border bg-emerald-50/80 text-emerald-700/90 border-emerald-200/40">
                  Overall: Ready
                </span>
              )}
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] border bg-emerald-50/80 text-emerald-700/90 border-emerald-200/40">
                <div className="size-1.5 rounded-full bg-emerald-500" />
                Auto-submit
              </span>
            </div>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-[13px] text-[#4a5565] border border-gray-200 rounded-md hover:bg-gray-50 transition-colors tracking-[-0.15px]">
              <span>Assign</span>
              <ChevronDown className="size-3.5" />
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-[13px] text-[#4a5565] border border-gray-200 rounded-md hover:bg-gray-50 transition-colors tracking-[-0.15px]">
              <span>More</span>
              <ChevronDown className="size-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="flex gap-6 w-full flex-1">
        {/* Left Column - Case Context */}
        <div className="w-[400px] flex-shrink-0 space-y-4">
          {/* Patient & Insurance Card */}
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <h3 className="text-[14px] font-semibold text-[#101828] mb-4">Patient & insurance</h3>
            <div className="space-y-3">
              <div>
                <div className="text-[11px] text-[#6a7282] uppercase tracking-[0.05em] mb-1">Name</div>
                <div className="text-[13px] text-[#101828]">Katherine Williams</div>
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <div className="text-[11px] text-[#6a7282] uppercase tracking-[0.05em] mb-1">DOB</div>
                  <div className="text-[13px] text-[#101828]">03/15/1949</div>
                </div>
                <div className="flex-1">
                  <div className="text-[11px] text-[#6a7282] uppercase tracking-[0.05em] mb-1">Sex</div>
                  <div className="text-[13px] text-[#101828]">F</div>
                </div>
              </div>
              <div className="h-px bg-gray-200 my-3" />
              <div>
                <div className="text-[11px] text-[#6a7282] uppercase tracking-[0.05em] mb-1">Plan name</div>
                <div className="text-[13px] text-[#101828]">Blue Cross Blue Shield PPO</div>
              </div>
              <div>
                <div className="text-[11px] text-[#6a7282] uppercase tracking-[0.05em] mb-1">Member ID</div>
                <div className="text-[13px] text-[#101828]">XYZ987654321</div>
              </div>
              <div>
                <div className="text-[11px] text-[#6a7282] uppercase tracking-[0.05em] mb-1">Group ID</div>
                <div className="text-[13px] text-[#101828]">GRP456789</div>
              </div>
              <div className="pt-2">
                <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-emerald-50 text-emerald-700 rounded text-[11px] font-medium">
                  <Check className="size-3" />
                  Eligibility verified
                </div>
              </div>
            </div>
          </div>

          {/* Clinical Summary Card */}
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <h3 className="text-[14px] font-semibold text-[#101828] mb-4">Clinical summary</h3>
            <div className="space-y-4">
              <div>
                <div className="text-[11px] text-[#6a7282] uppercase tracking-[0.05em] mb-2">Requested service</div>
                <div className="text-[13px] text-[#101828]">
                  CPT 66984 · Cataract extraction with IOL
                </div>
              </div>
              <div>
                <div className="text-[11px] text-[#6a7282] uppercase tracking-[0.05em] mb-2">Diagnoses</div>
                <div className="space-y-1.5">
                  <div className="text-[13px] text-[#101828]">
                    H25.13 – Age-related nuclear cataract, bilateral
                  </div>
                  <div className="text-[13px] text-[#101828]">
                    H25.11 – Age-related nuclear cataract, right eye
                  </div>
                </div>
              </div>
              <div>
                <div className="text-[11px] text-[#6a7282] uppercase tracking-[0.05em] mb-2">Key prior info</div>
                <ul className="space-y-1 text-[13px] text-[#4a5565]">
                  <li className="flex gap-2">
                    <span className="text-[#6a7282]">•</span>
                    <span>Prior meds: artificial tears, cyclosporine</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[#6a7282]">•</span>
                    <span>Prior imaging/tests: OCT 10/10/25, HVF 09/12/25</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[#6a7282]">•</span>
                    <span>BCVA OD: 20/60 with glare</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Notes Card */}
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <h3 className="text-[14px] font-semibold text-[#101828] mb-2">Notes for this PA</h3>
            <p className="text-[11px] text-[#6a7282] mb-3">Internal notes only. Not sent to payer.</p>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add internal notes here..."
              className="w-full h-24 px-3 py-2 text-[13px] text-[#101828] border border-gray-200 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
            />
          </div>
        </div>

        {/* Right Column - Auth Actions */}
        <div className="flex-1 space-y-4">
          {/* Auth Request Details Card */}
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <h3 className="text-[14px] font-semibold text-[#101828] mb-4">Auth request details</h3>
            <div className="space-y-4">
              <div>
                <div className="text-[11px] text-[#6a7282] uppercase tracking-[0.05em] mb-2">Service</div>
                <div className="text-[13px] text-[#101828]">BCBS · Cataract surgery – Right eye</div>
              </div>
              
              <div>
                <div className="text-[11px] text-[#6a7282] uppercase tracking-[0.05em] mb-2">CPT/HCPCS codes</div>
                <div className="flex flex-wrap gap-2">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 text-gray-700 rounded text-[12px] font-medium">
                    66984 – Cataract extraction with IOL
                  </div>
                </div>
              </div>

              <div>
                <div className="text-[11px] text-[#6a7282] uppercase tracking-[0.05em] mb-2">ICD-10 codes</div>
                <div className="flex flex-wrap gap-2">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 text-gray-700 rounded text-[12px] font-medium">
                    H25.13
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 text-gray-700 rounded text-[12px] font-medium">
                    H25.11
                  </div>
                </div>
              </div>

              <div>
                <div className="text-[11px] text-[#6a7282] uppercase tracking-[0.05em] mb-2">Clinical justification</div>
                <textarea
                  value={clinicalJustification}
                  onChange={(e) => setClinicalJustification(e.target.value)}
                  className="w-full h-32 px-3 py-2 text-[13px] text-[#101828] border border-gray-200 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                />
              </div>

              <p className="text-[11px] text-[#6a7282]">
                These fields are what Lorelin will submit to the payer. You can edit before submitting.
              </p>
            </div>
          </div>

          {/* Submit to Payer Card */}
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <h3 className="text-[14px] font-semibold text-[#101828] mb-4">Submit to payer</h3>
            
            {submitStatus === 'draft' && (
              <div className="space-y-4">
                <div className="flex items-start gap-2 p-3 bg-emerald-50 rounded-lg">
                  <Check className="size-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <p className="text-[13px] text-emerald-900">
                    Lorelin can submit this prior auth directly to BCBS on your behalf.
                  </p>
                </div>

                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={reviewedChecked}
                    onChange={(e) => setReviewedChecked(e.target.checked)}
                    className="mt-1 size-4 rounded border-gray-300 text-black focus:ring-black cursor-pointer"
                  />
                  <span className="text-[13px] text-[#101828] group-hover:text-black">
                    I've reviewed the request details above
                  </span>
                </label>

                <button
                  onClick={handleSubmit}
                  disabled={!reviewedChecked}
                  className="w-full px-4 py-3 bg-black text-white text-[14px] font-medium rounded-lg hover:bg-[#1f2937] disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  Submit via Lorelin
                </button>

                <button
                  onClick={handleCopyRequest}
                  className="w-full text-[13px] text-[#4a5565] hover:text-[#101828] font-medium"
                >
                  Or submit manually using this info
                </button>
              </div>
            )}

            {submitStatus === 'submitting' && (
              <div className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    {submittingStep > 0 ? (
                      <Check className="size-5 text-emerald-600" />
                    ) : (
                      <Loader2 className="size-5 text-blue-600 animate-spin" />
                    )}
                    <span className={`text-[13px] ${submittingStep > 0 ? 'text-emerald-700' : 'text-[#101828]'}`}>
                      Preparing request
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {submittingStep > 1 ? (
                      <Check className="size-5 text-emerald-600" />
                    ) : submittingStep > 0 ? (
                      <Loader2 className="size-5 text-blue-600 animate-spin" />
                    ) : (
                      <div className="size-5 rounded-full border-2 border-gray-200" />
                    )}
                    <span className={`text-[13px] ${submittingStep > 1 ? 'text-emerald-700' : submittingStep > 0 ? 'text-[#101828]' : 'text-[#6a7282]'}`}>
                      Connecting to BCBS portal
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    {submittingStep > 2 ? (
                      <Check className="size-5 text-emerald-600" />
                    ) : submittingStep > 1 ? (
                      <Loader2 className="size-5 text-blue-600 animate-spin" />
                    ) : (
                      <div className="size-5 rounded-full border-2 border-gray-200" />
                    )}
                    <span className={`text-[13px] ${submittingStep > 2 ? 'text-emerald-700' : submittingStep > 1 ? 'text-[#101828]' : 'text-[#6a7282]'}`}>
                      Submitting request
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    {submittingStep > 3 ? (
                      <Check className="size-5 text-emerald-600" />
                    ) : submittingStep > 2 ? (
                      <Loader2 className="size-5 text-blue-600 animate-spin" />
                    ) : (
                      <div className="size-5 rounded-full border-2 border-gray-200" />
                    )}
                    <span className={`text-[13px] ${submittingStep > 3 ? 'text-emerald-700' : submittingStep > 2 ? 'text-[#101828]' : 'text-[#6a7282]'}`}>
                      Capturing confirmation
                    </span>
                  </div>
                </div>

                <p className="text-[11px] text-[#6a7282] pt-2">
                  This usually takes 10–30 seconds. You can keep working in another tab; we'll update the status automatically.
                </p>
              </div>
            )}

            {submitStatus === 'success' && (
              <div className="space-y-4">
                <div className="flex items-start gap-2 p-3 bg-emerald-50 rounded-lg">
                  <Check className="size-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="text-[14px] font-medium text-emerald-900 mb-3">
                      Submitted via BCBS portal
                    </div>
                    <div className="space-y-2 text-[13px]">
                      <div className="flex justify-between">
                        <span className="text-emerald-700">PA ID / Reference:</span>
                        <span className="text-emerald-900 font-medium">ABC123456</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-emerald-700">Submitted:</span>
                        <span className="text-emerald-900">Today · 10:42 AM</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-emerald-700">Method:</span>
                        <span className="text-emerald-900">BCBS portal (Lorelin)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-emerald-700">Expected decision:</span>
                        <span className="text-emerald-900">3–5 business days</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button className="flex-1 px-4 py-2 text-[13px] text-[#101828] font-medium border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    View confirmation screenshot
                  </button>
                  <button className="flex-1 px-4 py-2 text-[13px] text-[#101828] font-medium border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    View raw confirmation text
                  </button>
                </div>
              </div>
            )}

            {submitStatus === 'failure' && (
              <div className="space-y-4">
                <div className="flex items-start gap-2 p-3 bg-red-50 rounded-lg">
                  <X className="size-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="text-[14px] font-medium text-red-900 mb-2">
                      We couldn't submit this one automatically
                    </div>
                    <p className="text-[13px] text-red-700">
                      Something went wrong while talking to the BCBS portal. You can still submit this prior auth manually — all the details are ready above.
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleCopyRequest}
                    className="flex-1 px-4 py-3 bg-black text-white text-[14px] font-medium rounded-lg hover:bg-[#1f2937] transition-colors"
                  >
                    Copy full request
                  </button>
                  <button
                    onClick={handleRetry}
                    className="flex-1 px-4 py-3 text-[14px] text-[#101828] font-medium border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Try again
                  </button>
                </div>
              </div>
            )}

            {submitStatus === 'needs-mfa' && (
              <div className="space-y-4">
                <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-lg">
                  <AlertCircle className="size-5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="text-[14px] font-medium text-amber-900 mb-2">
                      BCBS needs a fresh login
                    </div>
                    <p className="text-[13px] text-amber-700">
                      BCBS is asking for additional verification. Please log into the BCBS provider portal in your browser. Once that's done, click 'Retry now' and Lorelin will submit this request.
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <button
                    onClick={handleRetry}
                    className="w-full px-4 py-3 bg-black text-white text-[14px] font-medium rounded-lg hover:bg-[#1f2937] transition-colors"
                  >
                    I've logged in, retry now
                  </button>
                  <button
                    onClick={handleCopyRequest}
                    className="w-full text-[13px] text-[#4a5565] hover:text-[#101828] font-medium"
                  >
                    I'll submit manually instead
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Status & History Card */}
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <h3 className="text-[14px] font-semibold text-[#101828] mb-4">Status & history</h3>
            
            <div className="mb-4 pb-4 border-b border-gray-200">
              <div className="text-[11px] text-[#6a7282] uppercase tracking-[0.05em] mb-2">Current status</div>
              {submitStatus === 'success' ? (
                <div className="text-[13px] text-[#101828]">
                  Status: Submitted · PA ID ABC123456 · Submitted via Lorelin by Amy · Today 10:42 AM
                </div>
              ) : submitStatus === 'submitting' ? (
                <div className="text-[13px] text-[#101828]">
                  Status: Submitting to BCBS portal...
                </div>
              ) : (
                <div className="text-[13px] text-[#101828]">
                  Status: Draft ready
                </div>
              )}
            </div>

            <div>
              <div className="text-[11px] text-[#6a7282] uppercase tracking-[0.05em] mb-3">Activity timeline</div>
              <div className="space-y-2.5">
                {submitStatus === 'success' && (
                  <div className="text-[12px] text-[#4a5565]">
                    <span className="text-[#6a7282]">10:42</span> – Submitted to BCBS via portal (PA ID ABC123456)
                  </div>
                )}
                <div className="text-[12px] text-[#4a5565]">
                  <span className="text-[#6a7282]">10:30</span> – Draft generated by Lorelin
                </div>
                <div className="text-[12px] text-[#4a5565]">
                  <span className="text-[#6a7282]">10:15</span> – Auth workspace opened by Amy
                </div>
              </div>
            </div>

            {submitStatus === 'success' && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <button className="px-4 py-2 text-[13px] text-[#101828] font-medium border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  Log decision
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}