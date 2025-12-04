import { useState } from 'react';
import { ChevronLeft, Play, AlertCircle, CheckCircle2, ChevronDown, ChevronRight } from 'lucide-react';

interface VisitDetailScreenProps {
  onBack: () => void;
}

export function VisitDetailScreen({ onBack }: VisitDetailScreenProps) {
  const [transcriptExpanded, setTranscriptExpanded] = useState(true);

  // Function to scroll to a specific line in the transcript
  const scrollToTranscriptLine = (time: string) => {
    setTranscriptExpanded(true);
    // In a real app, this would scroll to the specific timestamp
    console.log('Scrolling to transcript line:', time);
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
                    Maria Garcia
                  </h1>
                  <span className="text-[14px] text-[#6a7282]">68F</span>
                  <span className="text-[14px] text-[#6a7282]">•</span>
                  <span className="text-[14px] text-[#4a5565]">Dr. Lee</span>
                  <span className="text-[14px] text-[#6a7282]">•</span>
                  <span className="text-[14px] text-[#4a5565]">03/02/25</span>
                  <span className="text-[14px] text-[#6a7282]">•</span>
                  <span className="text-[14px] text-[#4a5565]">Medicare</span>
                </div>
                <button className="flex items-center gap-1.5 text-[12px] text-blue-600 hover:text-blue-700 font-medium">
                  <Play className="size-3.5" />
                  Play audio (3:24)
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
                  <div className="flex items-center justify-center size-7 rounded-full bg-blue-600 text-white font-medium text-[12px]">
                    3
                  </div>
                  <span className="text-[12px] font-medium text-[#101828]">Coding review</span>
                </div>
                
                <div className="h-0.5 w-8 bg-gray-300" />
                
                <div className="flex items-center gap-2">
                  <div className="flex items-center justify-center size-7 rounded-full bg-gray-200 text-[#6a7282] font-medium text-[12px]">
                    4
                  </div>
                  <span className="text-[12px] text-[#6a7282]">Approved</span>
                </div>
                
                <div className="h-0.5 w-8 bg-gray-300" />
                
                <div className="flex items-center gap-2">
                  <div className="flex items-center justify-center size-7 rounded-full bg-gray-200 text-[#6a7282] font-medium text-[12px]">
                    5
                  </div>
                  <span className="text-[12px] text-[#6a7282]">Sent</span>
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
                        <span className="font-medium text-[#101828]">[00:00]</span> Good morning Mrs. Garcia, how are you feeling today?
                      </p>
                      <p id="transcript-00-05">
                        <span className="font-medium text-[#101828]">[00:05]</span> Not so good doctor. My <mark className="bg-blue-100 text-[#101828] px-1 rounded">right eye</mark> has been bothering me for the past few weeks. It's gotten worse.
                      </p>
                      <p id="transcript-00-15">
                        <span className="font-medium text-[#101828]">[00:15]</span> Can you describe what you're experiencing?
                      </p>
                      <p id="transcript-00-18">
                        <span className="font-medium text-[#101828]">[00:18]</span> It's <mark className="bg-blue-100 text-[#101828] px-1 rounded">blurry in the center</mark>, and I see some <mark className="bg-blue-100 text-[#101828] px-1 rounded">wavy lines</mark>. It's hard to read.
                      </p>
                      <p id="transcript-00-28">
                        <span className="font-medium text-[#101828]">[00:28]</span> I see. Let me take a look. Have you noticed any pain or redness?
                      </p>
                      <p id="transcript-00-33">
                        <span className="font-medium text-[#101828]">[00:33]</span> No pain, but my vision has definitely changed.
                      </p>
                      <p id="transcript-01-15">
                        <span className="font-medium text-[#101828]">[01:15]</span> Based on your symptoms and what I'm seeing here, this looks like <mark className="bg-blue-100 text-[#101828] px-1 rounded">wet AMD</mark> with possible <mark className="bg-blue-100 text-[#101828] px-1 rounded">neovascularization</mark>.
                      </p>
                      <p id="transcript-02-45">
                        <span className="font-medium text-[#101828]">[02:45]</span> We should do some imaging to confirm. I'll also check for any <mark className="bg-blue-100 text-[#101828] px-1 rounded">subretinal fluid</mark>.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Manual notes */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-[14px] font-semibold text-[#101828] mb-4">
                  Manual notes
                </h3>
                <div>
                  <label className="block text-[11px] text-[#6a7282] uppercase tracking-wider mb-2">
                    Add notes about this visit
                  </label>
                  <textarea
                    placeholder="Type any additional notes here..."
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-[13px] text-[#101828] placeholder:text-[#99A1AF] resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    rows={6}
                  />
                  <p className="text-[11px] text-[#6a7282] mt-2">
                    These notes will be attached to the visit record but won't be sent to the payer.
                  </p>
                </div>
              </div>

              {/* Merged Clinical Note */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-[14px] font-semibold text-[#101828] mb-5">
                  Clinical note
                </h3>
                
                {/* HPI Section */}
                <div className="mb-6">
                  <h4 className="text-[12px] font-semibold text-[#101828] uppercase tracking-wider mb-3">
                    Chief Complaint / HPI
                  </h4>
                  <textarea
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-[13px] text-[#101828] resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={4}
                    defaultValue="68-year-old female with 2-week history of blurred central vision and metamorphopsia in the right eye. Denies pain, redness, or photophobia. Patient has history of dry AMD, now reporting worsening symptoms."
                  />
                </div>

                {/* Exam Section */}
                <div className="mb-6">
                  <h4 className="text-[12px] font-semibold text-[#101828] uppercase tracking-wider mb-3">
                    Exam
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <label className="text-[11px] text-[#6a7282] uppercase tracking-wider mb-2 block">
                        Visual Acuity
                      </label>
                      <input
                        type="text"
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-[13px] text-[#101828] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        defaultValue="OD: 20/80, OS: 20/30"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-[#6a7282] uppercase tracking-wider mb-2 block">
                        Fundoscopy
                      </label>
                      <textarea
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-[13px] text-[#101828] resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows={3}
                        defaultValue="OD: Drusen present, subretinal fluid noted in macula, possible neovascularization. OS: Mild drusen, no active lesions."
                      />
                    </div>
                  </div>
                </div>

                {/* Assessment & Plan Section */}
                <div>
                  <h4 className="text-[12px] font-semibold text-[#101828] uppercase tracking-wider mb-3">
                    Assessment & Plan
                  </h4>
                  <textarea
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-[13px] text-[#101828] resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={5}
                    defaultValue="Assessment: Wet age-related macular degeneration (AMD), right eye, with suspected choroidal neovascularization.&#10;&#10;Plan: OCT imaging to confirm diagnosis. If CNV confirmed, will initiate anti-VEGF therapy. Patient counseled on risks and benefits. Follow-up in 1 week for imaging results and treatment planning."
                  />
                </div>
              </div>
            </div>

            {/* Right side: Coding & charges */}
            <div className="w-[480px] space-y-6">
              
              {/* Diagnoses */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-[14px] font-semibold text-[#101828] mb-4">
                  Diagnoses (ICD-10)
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="mt-0.5 size-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[12px] font-mono font-medium text-[#101828]">
                          H35.3211
                        </span>
                        <CheckCircle2 className="size-4 text-green-600" />
                      </div>
                      <div className="text-[12px] text-[#4a5565] mb-2">
                        Exudative age-related macular degeneration, right eye
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[10px] text-[#6a7282]">Mentioned:</span>
                        <button
                          onClick={() => scrollToTranscriptLine('01:15')}
                          className="px-1.5 py-0.5 bg-blue-200 text-blue-700 rounded text-[10px] font-medium hover:bg-blue-300 transition-colors"
                        >
                          "wet AMD" [01:15]
                        </button>
                        <button
                          onClick={() => scrollToTranscriptLine('01:15')}
                          className="px-1.5 py-0.5 bg-blue-200 text-blue-700 rounded text-[10px] font-medium hover:bg-blue-300 transition-colors"
                        >
                          "neovascularization" [01:15]
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="mt-0.5 size-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[12px] font-mono font-medium text-[#101828]">
                          H35.3212
                        </span>
                      </div>
                      <div className="text-[12px] text-[#4a5565] mb-2">
                        Exudative age-related macular degeneration, left eye
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[10px] text-[#6a7282]">History:</span>
                        <button
                          onClick={() => scrollToTranscriptLine('01:15')}
                          className="px-1.5 py-0.5 bg-gray-200 text-gray-700 rounded text-[10px] font-medium hover:bg-gray-300 transition-colors"
                        >
                          "dry AMD" [01:15]
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                
                <button className="mt-3 text-[12px] text-blue-600 hover:text-blue-700 font-medium">
                  + Add diagnosis
                </button>
              </div>

              {/* Procedures */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-[14px] font-semibold text-[#101828] mb-4">
                  Procedures (CPT/HCPCS)
                </h3>
                
                <div className="space-y-3 mb-4">
                  {/* Procedure 1 */}
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] font-mono font-semibold text-[#101828]">
                          92004
                        </span>
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-[10px] font-medium uppercase tracking-wide">
                          Primary
                        </span>
                      </div>
                      <span className="text-[13px] font-semibold text-[#101828]">
                        $285.00
                      </span>
                    </div>
                    <div className="text-[12px] text-[#4a5565] mb-3">
                      Comprehensive ophthalmological examination, established patient
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <label className="text-[10px] text-[#6a7282] uppercase tracking-wider mb-1 block">
                          Units
                        </label>
                        <input
                          type="number"
                          defaultValue="1"
                          className="w-full px-2 py-1.5 bg-white border border-gray-300 rounded text-[12px] text-[#101828] focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="text-[10px] text-[#6a7282] uppercase tracking-wider mb-1 block">
                          Modifiers
                        </label>
                        <input
                          type="text"
                          placeholder="None"
                          className="w-full px-2 py-1.5 bg-white border border-gray-300 rounded text-[12px] text-[#101828] placeholder:text-[#99A1AF] focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Procedure 2 with warning */}
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="flex items-start gap-2 mb-2">
                      <AlertCircle className="size-4 text-amber-600 mt-0.5" />
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-[13px] font-mono font-semibold text-[#101828]">
                              92250
                            </span>
                          </div>
                          <span className="text-[13px] font-semibold text-[#101828]">
                            $165.00
                          </span>
                        </div>
                        <div className="text-[12px] text-[#4a5565] mb-2">
                          Fundus photography with interpretation and report
                        </div>
                        <div className="text-[11px] text-amber-800 bg-amber-100 px-2 py-1.5 rounded mb-3">
                          <span className="font-medium">Warning:</span> Modifier -25 suggested based on separate E/M
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex-1">
                            <label className="text-[10px] text-[#6a7282] uppercase tracking-wider mb-1 block">
                              Units
                            </label>
                            <input
                              type="number"
                              defaultValue="1"
                              className="w-full px-2 py-1.5 bg-white border border-gray-300 rounded text-[12px] text-[#101828] focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div className="flex-1">
                            <label className="text-[10px] text-[#6a7282] uppercase tracking-wider mb-1 block">
                              Modifiers
                            </label>
                            <input
                              type="text"
                              defaultValue="25"
                              className="w-full px-2 py-1.5 bg-white border border-gray-300 rounded text-[12px] text-[#101828] focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <button className="text-[12px] text-blue-600 hover:text-blue-700 font-medium">
                  + Add procedure
                </button>
              </div>

              {/* Enhanced Charge summary widget */}
              <div className="bg-white border border-gray-200 rounded-lg p-5">
                <h4 className="text-[13px] font-semibold text-[#101828] mb-4">
                  Charge Summary
                </h4>
                
                {/* Visual bar: Billed vs Allowed */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-[11px] mb-2">
                    <span className="text-[#6a7282]">Billed vs. Allowed</span>
                    <span className="text-[#6a7282]">84%</span>
                  </div>
                  <div className="relative h-8 bg-gray-100 rounded-lg overflow-hidden">
                    <div 
                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-end px-3"
                      style={{ width: '84%' }}
                    >
                      <span className="text-[11px] font-semibold text-white">$380</span>
                    </div>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      <span className="text-[11px] font-semibold text-[#6a7282]">$450</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-1.5">
                    <span className="text-[10px] text-green-700 font-medium">Expected allowed</span>
                    <span className="text-[10px] text-[#6a7282]">Total billed</span>
                  </div>
                </div>

                {/* Stats */}
                <div className="space-y-2 mb-4 pb-4 border-b border-gray-200">
                  <div className="flex items-center justify-between text-[12px]">
                    <span className="text-[#6a7282]">Total procedures:</span>
                    <span className="text-[#101828] font-medium">2</span>
                  </div>
                  <div className="flex items-center justify-between text-[12px]">
                    <span className="text-[#6a7282]">Contractual adjustment:</span>
                    <span className="text-red-600 font-medium">−$70</span>
                  </div>
                </div>

                {/* Validation status */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-[11px]">
                    <CheckCircle2 className="size-4 text-green-600 flex-shrink-0" />
                    <span className="text-green-700 font-medium">No validation errors</span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px]">
                    <CheckCircle2 className="size-4 text-green-600 flex-shrink-0" />
                    <span className="text-[#6a7282]">All codes verified</span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px]">
                    <AlertCircle className="size-4 text-amber-600 flex-shrink-0" />
                    <span className="text-amber-700 font-medium">1 modifier suggestion</span>
                  </div>
                </div>
              </div>

              {/* Sticky approve button */}
              <div className="sticky bottom-6 bg-white border border-gray-300 rounded-lg p-4 shadow-lg">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="text-[13px] font-semibold text-[#101828]">
                      Ready to approve?
                    </div>
                    <div className="text-[11px] text-[#6a7282] mt-0.5">
                      2 procedures • Est. $380 allowed
                    </div>
                  </div>
                </div>
                <button className="w-full px-5 py-2.5 bg-[#101828] text-white rounded-lg text-[13px] font-medium hover:bg-[#1f2937] transition-colors">
                  Approve charges
                </button>
                <button className="w-full mt-2 px-4 py-2 bg-white border border-gray-300 text-[#101828] rounded-lg text-[12px] font-medium hover:bg-gray-50 transition-colors">
                  Save draft
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom sticky bar */}
      <div className="bg-white border-t border-gray-200 px-8 py-4">
        <div className="flex items-center justify-between max-w-[1800px] mx-auto">
          <span className="text-[12px] text-[#6a7282]">
            Last saved 1 min ago
          </span>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 bg-white border border-gray-300 text-[#101828] rounded-lg text-[13px] font-medium hover:bg-gray-50 transition-colors">
              Save draft
            </button>
            <button className="px-5 py-2 bg-[#101828] text-white rounded-lg text-[13px] font-medium hover:bg-[#1f2937] transition-colors">
              Approve charges
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}