import { useState } from 'react';
import { ChevronLeft, Play, AlertCircle, CheckCircle2, ChevronDown, ChevronRight, RotateCcw } from 'lucide-react';

interface VisitApprovedScreenProps {
  onBack: () => void;
}

export function VisitApprovedScreen({ onBack }: VisitApprovedScreenProps) {
  const [transcriptExpanded, setTranscriptExpanded] = useState(false);
  const [showSendConfirmation, setShowSendConfirmation] = useState(false);
  const [skipConfirmation, setSkipConfirmation] = useState(false);
  const [visitStatus, setVisitStatus] = useState<'approved' | 'sent'>('approved');
  const [claimNumber, setClaimNumber] = useState<string | null>(null);

  // Function to scroll to a specific line in the transcript
  const scrollToTranscriptLine = (time: string) => {
    setTranscriptExpanded(true);
    // In a real app, this would scroll to the specific timestamp
    console.log('Scrolling to transcript line:', time);
  };

  const handleSendToAthena = () => {
    // Simulate sending to Athena
    const newClaimNumber = `CLM-${Math.floor(Math.random() * 100000)}`;
    setClaimNumber(newClaimNumber);
    setVisitStatus('sent');
    setShowSendConfirmation(false);
    
    // In a real app, this would show a toast notification
    console.log(`Sent to Athena as claim #${newClaimNumber}`);
  };

  const handleReopenForEdits = () => {
    // In a real app, this would move the visit back to "Coding review" status
    console.log('Reopening visit for edits - moving back to Coding review');
    onBack();
  };

  return (
    <div className="h-full flex flex-col bg-[#f5f5f7]">
      {/* Split pane content */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-[1800px] mx-auto px-8 py-8">
          {/* Back button on gray background */}
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-[13px] text-[#6a7282] hover:text-[#101828] transition-colors mb-4"
          >
            <ChevronLeft className="size-4" />
            Back to Visits
          </button>

          {/* Patient summary + pipeline on gray background */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              {/* Left: Patient info */}
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-[20px] font-semibold text-[#101828] tracking-[-0.02em]">
                    Linda Brown
                  </h1>
                  <span className="text-[14px] text-[#6a7282]">72F</span>
                  <span className="text-[14px] text-[#6a7282]">•</span>
                  <span className="text-[14px] text-[#4a5565]">Dr. Lee</span>
                  <span className="text-[14px] text-[#6a7282]">•</span>
                  <span className="text-[14px] text-[#4a5565]">03/02/25</span>
                  <span className="text-[14px] text-[#6a7282]">•</span>
                  <span className="text-[14px] text-[#4a5565]">Medicare</span>
                </div>
                <button className="flex items-center gap-1.5 text-[12px] text-blue-600 hover:text-blue-700 font-medium">
                  <Play className="size-3.5" />
                  Play audio (2:48)
                </button>
              </div>

              {/* Right: Visit pipeline */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className="flex items-center justify-center size-7 rounded-full bg-gray-400 text-white">
                    <CheckCircle2 className="size-4" />
                  </div>
                  <span className="text-[12px] text-[#6a7282]">Recorded</span>
                </div>
                
                <div className="h-0.5 w-8 bg-gray-300" />
                
                <div className="flex items-center gap-2">
                  <div className="flex items-center justify-center size-7 rounded-full bg-gray-400 text-white">
                    <CheckCircle2 className="size-4" />
                  </div>
                  <span className="text-[12px] text-[#6a7282]">Transcribed</span>
                </div>
                
                <div className="h-0.5 w-8 bg-gray-300" />
                
                <div className="flex items-center gap-2">
                  <div className="flex items-center justify-center size-7 rounded-full bg-gray-400 text-white">
                    <CheckCircle2 className="size-4" />
                  </div>
                  <span className="text-[12px] text-[#6a7282]">Coding review</span>
                </div>
                
                <div className={`h-0.5 w-8 ${visitStatus === 'sent' ? 'bg-gray-400' : 'bg-gray-300'}`} />
                
                <div className="flex items-center gap-2">
                  <div className={`flex items-center justify-center size-7 rounded-full ${
                    visitStatus === 'sent' 
                      ? 'bg-gray-400 text-white' 
                      : 'bg-blue-600 text-white'
                  } font-medium text-[12px]`}>
                    {visitStatus === 'sent' ? <CheckCircle2 className="size-4" /> : '4'}
                  </div>
                  <span className={`text-[12px] ${
                    visitStatus === 'sent' 
                      ? 'text-[#6a7282]' 
                      : 'font-medium text-[#101828]'
                  }`}>
                    {visitStatus === 'approved' ? 'Ready to send' : 'Approved'}
                  </span>
                </div>
                
                <div className={`h-0.5 w-8 ${visitStatus === 'sent' ? 'bg-gray-400' : 'bg-gray-300'}`} />
                
                <div className="flex items-center gap-2">
                  <div className={`flex items-center justify-center size-7 rounded-full ${
                    visitStatus === 'sent'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-200 text-[#6a7282]'
                  } font-medium text-[12px]`}>
                    {visitStatus === 'sent' ? <CheckCircle2 className="size-4" /> : '5'}
                  </div>
                  <span className={`text-[12px] ${
                    visitStatus === 'sent'
                      ? 'font-medium text-[#101828]'
                      : 'text-[#6a7282]'
                  }`}>
                    Sent
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-8">
            
            {/* Left side: Clinical */}
            <div className="flex-1 space-y-6">
              
              {/* Transcript */}
              <div className="bg-white border border-gray-200 rounded-lg">
                <button
                  onClick={() => setTranscriptExpanded(!transcriptExpanded)}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <h3 className="text-[14px] font-semibold text-[#101828]">
                    Transcript
                  </h3>
                  {transcriptExpanded ? (
                    <ChevronDown className="size-5 text-[#6a7282]" />
                  ) : (
                    <ChevronRight className="size-5 text-[#6a7282]" />
                  )}
                </button>
                
                {transcriptExpanded && (
                  <div className="px-6 pb-6 border-t border-gray-200 pt-4">
                    <div className="text-[13px] text-[#4a5565] leading-relaxed space-y-3 max-h-[400px] overflow-y-auto">
                      <p id="transcript-00-00">
                        <span className="font-medium text-[#101828]">[00:00]</span> Good afternoon Mrs. Brown, how are you today?
                      </p>
                      <p id="transcript-00-05">
                        <span className="font-medium text-[#101828]">[00:05]</span> I'm doing alright, doctor. Just here for my <mark className="bg-blue-100 text-[#101828] px-1 rounded">regular check-up</mark>.
                      </p>
                      <p id="transcript-00-12">
                        <span className="font-medium text-[#101828]">[00:12]</span> Good. Any changes since your last visit?
                      </p>
                      <p id="transcript-00-16">
                        <span className="font-medium text-[#101828]">[00:16]</span> My vision has been <mark className="bg-blue-100 text-[#101828] px-1 rounded">stable</mark>, thankfully.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Merged Clinical Note - View only */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-[14px] font-semibold text-[#101828] mb-5">
                  Clinical note
                </h3>
                
                {/* HPI Section - View only */}
                <div className="mb-6">
                  <h4 className="text-[12px] font-semibold text-[#101828] uppercase tracking-wider mb-3">
                    Chief Complaint / HPI
                  </h4>
                  <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-[13px] text-[#4a5565] leading-relaxed">
                    72-year-old female presenting for routine follow-up examination. Patient reports stable vision with no new concerns. Continues on current treatment regimen without complications.
                  </div>
                </div>

                {/* Exam Section - View only */}
                <div className="mb-6">
                  <h4 className="text-[12px] font-semibold text-[#101828] uppercase tracking-wider mb-3">
                    Exam
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <label className="text-[11px] text-[#6a7282] uppercase tracking-wider mb-2 block">
                        Visual Acuity
                      </label>
                      <div className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-[13px] text-[#4a5565]">
                        OD: 20/30, OS: 20/25
                      </div>
                    </div>
                    <div>
                      <label className="text-[11px] text-[#6a7282] uppercase tracking-wider mb-2 block">
                        Fundoscopy
                      </label>
                      <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-[13px] text-[#4a5565] leading-relaxed">
                        OU: Mild drusen present, stable. No active lesions or hemorrhages noted. Optic discs appear healthy with clear margins.
                      </div>
                    </div>
                  </div>
                </div>

                {/* Assessment & Plan Section - View only */}
                <div>
                  <h4 className="text-[12px] font-semibold text-[#101828] uppercase tracking-wider mb-3">
                    Assessment & Plan
                  </h4>
                  <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-[13px] text-[#4a5565] leading-relaxed">
                    Assessment: Dry age-related macular degeneration, stable bilateral.
                    <br/><br/>
                    Plan: Continue current AREDS2 supplementation. Patient counseled on importance of Amsler grid home monitoring. Return in 6 months for routine follow-up or sooner if any vision changes.
                  </div>
                </div>
              </div>
            </div>

            {/* Right side: Coding & charges - locked */}
            <div className="w-[480px] space-y-6">
              
              {/* Diagnoses - Locked */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[14px] font-semibold text-[#101828]">
                    Diagnoses (ICD-10)
                  </h3>
                  <button 
                    onClick={handleReopenForEdits}
                    className="flex items-center gap-1.5 text-[11px] text-blue-600 hover:text-blue-700 font-medium"
                  >
                    <RotateCcw className="size-3" />
                    Reopen for edits
                  </button>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg opacity-90">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[12px] font-mono font-medium text-[#101828]">
                          H35.3113
                        </span>
                        <CheckCircle2 className="size-4 text-green-600" />
                      </div>
                      <div className="text-[12px] text-[#4a5565] mb-2">
                        Nonexudative age-related macular degeneration, bilateral
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[10px] text-[#6a7282]">Mentioned:</span>
                        <button
                          onClick={() => scrollToTranscriptLine('00:16')}
                          className="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded text-[10px] font-medium hover:bg-blue-200 transition-colors"
                        >
                          "stable" [00:16]
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Procedures - Locked */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[14px] font-semibold text-[#101828]">
                    Procedures (CPT/HCPCS)
                  </h3>
                  <button 
                    onClick={handleReopenForEdits}
                    className="flex items-center gap-1.5 text-[11px] text-blue-600 hover:text-blue-700 font-medium"
                  >
                    <RotateCcw className="size-3" />
                    Reopen for edits
                  </button>
                </div>
                
                <div className="space-y-3">
                  {/* Procedure 1 */}
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg opacity-90">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] font-mono font-semibold text-[#101828]">
                          92014
                        </span>
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-[10px] font-medium uppercase tracking-wide">
                          Primary
                        </span>
                      </div>
                      <span className="text-[13px] font-semibold text-[#101828]">
                        $195.00
                      </span>
                    </div>
                    <div className="text-[12px] text-[#4a5565] mb-2">
                      Comprehensive ophthalmological examination, follow-up
                    </div>
                    <div className="flex items-center gap-4 text-[11px] text-[#6a7282]">
                      <span>Units: 1</span>
                      <span>•</span>
                      <span>Modifiers: None</span>
                    </div>
                  </div>

                  {/* Procedure 2 */}
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg opacity-90">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] font-mono font-semibold text-[#101828]">
                          92250
                        </span>
                      </div>
                      <span className="text-[13px] font-semibold text-[#101828]">
                        $100.00
                      </span>
                    </div>
                    <div className="text-[12px] text-[#4a5565] mb-2">
                      Fundus photography with interpretation and report
                    </div>
                    <div className="flex items-center gap-4 text-[11px] text-[#6a7282]">
                      <span>Units: 1</span>
                      <span>•</span>
                      <span>Modifiers: None</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Charge summary widget - no est. allowed change */}
              <div className="bg-white border border-gray-200 rounded-lg p-5">
                <h4 className="text-[13px] font-semibold text-[#101828] mb-4">
                  Charge Summary
                </h4>
                
                {/* Stats */}
                <div className="space-y-2 pb-4 border-b border-gray-200">
                  <div className="flex items-center justify-between text-[13px]">
                    <span className="text-[#6a7282]">Total procedures:</span>
                    <span className="text-[#101828] font-medium">2</span>
                  </div>
                  <div className="flex items-center justify-between text-[13px]">
                    <span className="text-[#6a7282]">Total billed:</span>
                    <span className="text-[#101828] font-semibold">$295.00</span>
                  </div>
                  <div className="flex items-center justify-between text-[13px]">
                    <span className="text-[#6a7282]">Est. allowed:</span>
                    <span className="text-green-700 font-semibold">$245.00</span>
                  </div>
                </div>

                {/* Validation status */}
                <div className="space-y-2 mt-4">
                  <div className="flex items-center gap-2 text-[11px]">
                    <CheckCircle2 className="size-4 text-green-600 flex-shrink-0" />
                    <span className="text-green-700 font-medium">No validation errors</span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px]">
                    <CheckCircle2 className="size-4 text-green-600 flex-shrink-0" />
                    <span className="text-[#6a7282]">All codes verified</span>
                  </div>
                </div>
              </div>

              {/* Send to Athena control center */}
              {visitStatus === 'approved' && (
                <div className="sticky bottom-6 bg-white border-2 border-blue-200 rounded-lg p-5 shadow-lg">
                  <div className="mb-4">
                    <div className="text-[14px] font-semibold text-[#101828] mb-1">
                      Ready to send to Athena
                    </div>
                    <div className="text-[11px] text-[#6a7282] mb-3">
                      We'll create 1 professional claim in Athena for this visit.
                    </div>
                    <div className="text-[12px] text-[#4a5565] bg-gray-50 px-3 py-2 rounded border border-gray-200">
                      2 procedures · Total billed $295 · Est. allowed $245 · Payer Medicare
                    </div>
                  </div>

                  <button 
                    onClick={() => setShowSendConfirmation(true)}
                    className="w-full px-5 py-3 bg-[#101828] text-white rounded-lg text-[13px] font-medium hover:bg-[#1f2937] transition-colors mb-2"
                  >
                    Send to Athena
                  </button>
                  
                  <button 
                    onClick={handleReopenForEdits}
                    className="w-full px-4 py-2 bg-white border border-gray-300 text-[#101828] rounded-lg text-[12px] font-medium hover:bg-gray-50 transition-colors mb-3"
                  >
                    Reopen for edits
                  </button>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={skipConfirmation}
                      onChange={(e) => setSkipConfirmation(e.target.checked)}
                      className="size-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-[11px] text-[#6a7282]">
                      Skip confirmation next time
                    </span>
                  </label>
                </div>
              )}

              {/* Sent status - passive info strip */}
              {visitStatus === 'sent' && (
                <div className="sticky bottom-6 bg-green-50 border-2 border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="size-5 text-green-600" />
                    <span className="text-[13px] font-semibold text-green-900">
                      Sent to Athena
                    </span>
                  </div>
                  <div className="text-[12px] text-green-800 mb-3">
                    Claim #{claimNumber}
                  </div>
                  <button className="text-[12px] text-green-700 hover:text-green-800 font-medium">
                    View in Claims →
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Send confirmation modal */}
      {showSendConfirmation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-[16px] font-semibold text-[#101828] mb-3">
              Send to Athena?
            </h3>
            <div className="text-[13px] text-[#4a5565] mb-4">
              This will create a professional claim in Athena with the following details:
            </div>
            
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-5 space-y-2 text-[12px]">
              <div className="flex justify-between">
                <span className="text-[#6a7282]">Patient:</span>
                <span className="text-[#101828] font-medium">Linda Brown</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6a7282]">Diagnosis:</span>
                <span className="text-[#101828] font-medium">H35.3113</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6a7282]">Procedures:</span>
                <span className="text-[#101828] font-medium">92014, 92250</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-300">
                <span className="text-[#6a7282]">Total billed:</span>
                <span className="text-[#101828] font-semibold">$295.00</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowSendConfirmation(false)}
                className="flex-1 px-4 py-2.5 bg-white border border-gray-300 text-[#101828] rounded-lg text-[13px] font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSendToAthena}
                className="flex-1 px-4 py-2.5 bg-[#101828] text-white rounded-lg text-[13px] font-medium hover:bg-[#1f2937] transition-colors"
              >
                Confirm & send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
