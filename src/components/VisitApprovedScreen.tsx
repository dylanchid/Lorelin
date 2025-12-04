import { useState } from 'react';
import { ChevronLeft, Play, CheckCircle2, ChevronDown, ChevronRight, Copy, Sparkles } from 'lucide-react';

interface VisitApprovedScreenProps {
  onBack: () => void;
}

export function VisitApprovedScreen({ onBack }: VisitApprovedScreenProps) {
  const [transcriptExpanded, setTranscriptExpanded] = useState(true);
  const [showCustomizeFields, setShowCustomizeFields] = useState(false);
  const [selectedDiagnoses, setSelectedDiagnoses] = useState<string[]>(['H35.3211', 'H35.3212']);
  const [selectedProcedures, setSelectedProcedures] = useState<string[]>(['92084', '92250']);
  const [visitStatus, setVisitStatus] = useState<'review' | 'coded'>('review');
  const [selectedEmCode, setSelectedEmCode] = useState<'current' | 'lorelin'>('lorelin');

  // Function to scroll to a specific line in the transcript
  const scrollToTranscriptLine = (time: string) => {
    setTranscriptExpanded(true);
    console.log('Scrolling to transcript line:', time);
  };

  const handleToggleDiagnosis = (code: string) => {
    setSelectedDiagnoses(prev =>
      prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]
    );
  };

  const handleToggleProcedure = (code: string) => {
    setSelectedProcedures(prev =>
      prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]
    );
  };

  const handleMarkAsCoded = () => {
    console.log('Marking visit as coded');
    setVisitStatus('coded');
  };

  const handleCopyCodes = () => {
    const emCode = selectedEmCode === 'lorelin' ? '99214' : '99213';
    const emDesc = selectedEmCode === 'lorelin' ? 'Established patient, moderate complexity' : 'Established patient, low to moderate complexity';
    const codesText = `E/M:\n${emCode} – ${emDesc}\n\nICD-10:\nH35.3211 – Exudative AMD, right eye\nH35.3212 – Exudative AMD, left eye\n\nCPT:\n92084 – Visual field (linked to H35.3211, H35.3212)\n92250 – Fundus photography (linked to H35.3211)`;
    navigator.clipboard.writeText(codesText);
    console.log('Codes copied to clipboard');
  };

  return (
    <div className="h-full flex flex-col bg-[#f5f5f7]">
      <div className="flex-1 overflow-auto">
        <div className="max-w-[1800px] mx-auto px-8 py-8">
          {/* Back button */}
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-[13px] text-[#6a7282] hover:text-[#101828] transition-colors mb-4"
          >
            <ChevronLeft className="size-4" />
            Back to Visits
          </button>

          {/* Patient summary + pipeline */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
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
                <button className="flex items-center gap-1.5 text-[11px] text-[#6a7282] hover:text-[#4a5565]">
                  <Play className="size-3" />
                  Play audio (2:48)
                </button>
              </div>

              {/* Visit pipeline */}
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
                
                <div className="h-0.5 w-8 bg-gray-400" />
                
                <div className="flex items-center gap-2">
                  <div className="flex items-center justify-center size-7 rounded-full bg-blue-600 text-white font-medium text-[12px]">
                    3
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[12px] font-medium text-[#101828]">AI coding review</span>
                    <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded text-[9px] font-medium uppercase tracking-wide">
                      AI
                    </span>
                  </div>
                </div>
                
                <div className={`h-0.5 w-8 ${visitStatus === 'coded' ? 'bg-gray-400' : 'bg-gray-300'}`} />
                
                <div className="flex items-center gap-2">
                  <div className={`flex items-center justify-center size-7 rounded-full ${
                    visitStatus === 'coded' 
                      ? 'bg-gray-400 text-white' 
                      : 'bg-gray-200 text-[#6a7282]'
                  } font-medium text-[12px]`}>
                    {visitStatus === 'coded' ? <CheckCircle2 className="size-4" /> : '4'}
                  </div>
                  <span className="text-[12px] text-[#6a7282]">Ready to send</span>
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
            
            {/* Left side: Clinical context */}
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
                        <span className="font-medium text-[#101828]">[00:00]</span> Good morning Mrs. Brown, how are you feeling today?
                      </p>
                      <p id="transcript-00-05">
                        <span className="font-medium text-[#101828]">[00:05]</span> Not so good doctor. My <mark className="bg-blue-100 text-[#101828] px-1 rounded">vision has gotten worse</mark> in both eyes over the past few weeks.
                      </p>
                      <p id="transcript-00-15">
                        <span className="font-medium text-[#101828]">[00:15]</span> Can you describe what you're experiencing?
                      </p>
                      <p id="transcript-00-18">
                        <span className="font-medium text-[#101828]">[00:18]</span> Everything looks <mark className="bg-blue-100 text-[#101828] px-1 rounded">blurry in the center</mark>, and I see some <mark className="bg-blue-100 text-[#101828] px-1 rounded">wavy lines</mark>.
                      </p>
                      <p id="transcript-01-15">
                        <span className="font-medium text-[#101828]">[01:15]</span> Based on your symptoms and what I'm seeing, this looks like <mark className="bg-blue-100 text-[#101828] px-1 rounded">wet AMD</mark> with <mark className="bg-blue-100 text-[#101828] px-1 rounded">neovascularization</mark> in both eyes.
                      </p>
                      <p id="transcript-02-00">
                        <span className="font-medium text-[#101828]">[02:00]</span> I'm going to order a <mark className="bg-blue-100 text-[#101828] px-1 rounded">visual field test</mark> and <mark className="bg-blue-100 text-[#101828] px-1 rounded">fundus photography</mark> to confirm.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Clinical Note */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-[14px] font-semibold text-[#101828] mb-5">
                  Clinical note
                </h3>
                
                <div className="mb-6">
                  <h4 className="text-[12px] font-semibold text-[#101828] uppercase tracking-wider mb-3">
                    Chief Complaint / HPI
                  </h4>
                  <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-[13px] text-[#4a5565] leading-relaxed">
                    72-year-old female presenting with worsening bilateral vision over the past few weeks. Patient reports central blur and metamorphopsia. No pain or redness.
                  </div>
                </div>

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
                        OD: 20/60, OS: 20/80
                      </div>
                    </div>
                    <div>
                      <label className="text-[11px] text-[#6a7282] uppercase tracking-wider mb-2 block">
                        Fundoscopy
                      </label>
                      <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-[13px] text-[#4a5565] leading-relaxed">
                        OU: Subretinal fluid noted with evidence of choroidal neovascularization. Exudative changes bilateral. Ordered OCT and fundus photography.
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-[12px] font-semibold text-[#101828] uppercase tracking-wider mb-3">
                    Assessment & Plan
                  </h4>
                  <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-[13px] text-[#4a5565] leading-relaxed">
                    Assessment: Exudative (wet) age-related macular degeneration, bilateral. Choroidal neovascularization present bilaterally.
                    <br/><br/>
                    Plan: Visual field testing and fundus photography ordered. Patient counseled on treatment options including anti-VEGF therapy. Will review imaging and schedule follow-up for potential treatment initiation.
                  </div>
                </div>
              </div>
            </div>

            {/* Right side: Coding Copilot */}
            <div className="w-[540px] space-y-4">
              
              {/* Visit Level (E/M) Card */}
              <div className="bg-white border-2 border-blue-200 rounded-lg p-4">
                <h3 className="text-[14px] font-semibold text-[#101828] mb-3">
                  Visit level (E/M)
                </h3>
                
                {/* Current row - muted */}
                <div className="mb-3 pb-3 border-b border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] text-[#99A1AF] uppercase tracking-wide">Current</span>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="em-code"
                        checked={selectedEmCode === 'current'}
                        onChange={() => setSelectedEmCode('current')}
                        className="size-4 text-gray-600 focus:ring-gray-500"
                      />
                    </label>
                  </div>
                  <div className="flex items-start gap-2 opacity-60">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[13px] font-mono font-semibold text-[#4a5565]">99213</span>
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-[9px] font-medium uppercase tracking-wide">
                          E/M
                        </span>
                      </div>
                      <div className="text-[12px] text-[#6a7282]">
                        Established patient, low to moderate complexity
                      </div>
                    </div>
                  </div>
                </div>

                {/* Lorelin row - emphasized */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-[#4a5565] uppercase tracking-wide">Lorelin suggests</span>
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-[9px] font-medium">+1 level</span>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="em-code"
                        checked={selectedEmCode === 'lorelin'}
                        onChange={() => setSelectedEmCode('lorelin')}
                        className="size-4 text-blue-600 focus:ring-blue-500"
                      />
                    </label>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[13px] font-mono font-semibold text-[#101828]">99214</span>
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-[9px] font-medium uppercase tracking-wide">
                          E/M
                        </span>
                        <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-700 rounded text-[9px] font-medium">
                          92%
                        </span>
                      </div>
                      <div className="text-[12px] text-[#4a5565] mb-3">
                        Established patient, moderate complexity
                      </div>
                      
                      {/* Why explanation */}
                      <div className="bg-blue-50 border border-blue-200 rounded px-3 py-2 space-y-1">
                        <div className="text-[11px] text-[#4a5565] font-medium mb-1.5">Why this level:</div>
                        <div className="flex items-start gap-1.5">
                          <span className="text-blue-600 mt-0.5">•</span>
                          <span className="text-[11px] text-[#4a5565]">2 active problems addressed (wet AMD OU, vision loss)</span>
                        </div>
                        <div className="flex items-start gap-1.5">
                          <span className="text-blue-600 mt-0.5">•</span>
                          <span className="text-[11px] text-[#4a5565]">Tests ordered: Visual field + fundus photography</span>
                        </div>
                        <div className="flex items-start gap-1.5">
                          <span className="text-blue-600 mt-0.5">•</span>
                          <span className="text-[11px] text-[#4a5565]">Moderate risk with anti-VEGF therapy discussed</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Diagnoses - Current vs Lorelin */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-[14px] font-semibold text-[#101828] mb-4">
                  Diagnoses (ICD-10)
                </h3>
                
                {/* Current codes */}
                <div className="mb-4 pb-4 border-b border-gray-200">
                  <div className="text-[11px] text-[#99A1AF] uppercase tracking-wide mb-3">Current codes</div>
                  <div className="opacity-60">
                    <div className="flex items-start gap-3 mb-2">
                      <div className="flex-1">
                        <span className="text-[12px] font-mono font-medium text-[#6a7282]">H35.3113</span>
                        <div className="text-[11px] text-[#99A1AF]">Dry AMD, bilateral</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Lorelin suggestions */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-[11px] text-[#4a5565] uppercase tracking-wide">Lorelin suggestions</span>
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-[9px] font-medium">2 new codes</span>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={selectedDiagnoses.includes('H35.3211')}
                        onChange={() => handleToggleDiagnosis('H35.3211')}
                        className="mt-1 size-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 cursor-pointer"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[12px] font-mono font-medium text-[#101828]">H35.3211</span>
                          <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-700 rounded text-[9px] font-medium">95%</span>
                        </div>
                        <div className="text-[12px] text-[#4a5565] mb-2">
                          Exudative age-related macular degeneration, right eye
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-[10px] text-[#6a7282]">Mentioned:</span>
                          <button
                            onClick={() => scrollToTranscriptLine('01:15')}
                            className="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded text-[10px] font-medium hover:bg-blue-200 transition-colors"
                          >
                            "wet AMD" [01:15]
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={selectedDiagnoses.includes('H35.3212')}
                        onChange={() => handleToggleDiagnosis('H35.3212')}
                        className="mt-1 size-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 cursor-pointer"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[12px] font-mono font-medium text-[#101828]">H35.3212</span>
                          <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-700 rounded text-[9px] font-medium">95%</span>
                        </div>
                        <div className="text-[12px] text-[#4a5565] mb-2">
                          Exudative age-related macular degeneration, left eye
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-[10px] text-[#6a7282]">Mentioned:</span>
                          <button
                            onClick={() => scrollToTranscriptLine('01:15')}
                            className="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded text-[10px] font-medium hover:bg-blue-200 transition-colors"
                          >
                            "both eyes" [01:15]
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Procedures - CPT only */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-[14px] font-semibold text-[#101828] mb-4">
                  Procedures (CPT/HCPCS)
                </h3>
                
                {/* Current codes */}
                <div className="mb-4 pb-4 border-b border-gray-200">
                  <div className="text-[11px] text-[#99A1AF] uppercase tracking-wide mb-3">Current codes</div>
                  <div className="text-[11px] text-[#99A1AF] italic">None recorded</div>
                </div>

                {/* Lorelin suggestions */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-[11px] text-[#4a5565] uppercase tracking-wide">Lorelin suggestions</span>
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-[9px] font-medium">2 codes</span>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={selectedProcedures.includes('92084')}
                        onChange={() => handleToggleProcedure('92084')}
                        className="mt-1 size-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 cursor-pointer"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[13px] font-mono font-semibold text-[#101828]">92084</span>
                          <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-700 rounded text-[9px] font-medium">88%</span>
                        </div>
                        <div className="text-[12px] text-[#4a5565] mb-2">
                          Visual field examination
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-[10px] text-[#6a7282]">Mentioned:</span>
                          <button
                            onClick={() => scrollToTranscriptLine('02:00')}
                            className="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded text-[10px] font-medium hover:bg-blue-200 transition-colors"
                          >
                            "visual field test" [02:00]
                          </button>
                        </div>
                        <div className="text-[10px] text-[#6a7282] mt-1">
                          Linked to: H35.3211, H35.3212
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={selectedProcedures.includes('92250')}
                        onChange={() => handleToggleProcedure('92250')}
                        className="mt-1 size-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 cursor-pointer"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[13px] font-mono font-semibold text-[#101828]">92250</span>
                          <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-700 rounded text-[9px] font-medium">90%</span>
                        </div>
                        <div className="text-[12px] text-[#4a5565] mb-2">
                          Fundus photography with interpretation and report
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-[10px] text-[#6a7282]">Mentioned:</span>
                          <button
                            onClick={() => scrollToTranscriptLine('02:00')}
                            className="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded text-[10px] font-medium hover:bg-blue-200 transition-colors"
                          >
                            "fundus photography" [02:00]
                          </button>
                        </div>
                        <div className="text-[10px] text-[#6a7282] mt-1">
                          Linked to: H35.3211
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Decision Section */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-[14px] font-semibold text-[#101828] mb-4">
                  Decision
                </h3>
                
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      setSelectedEmCode('lorelin');
                      console.log('Lorelin codes selected');
                    }}
                    className="w-full px-4 py-2.5 bg-white border-2 border-blue-600 text-blue-700 rounded-lg text-[13px] font-medium hover:bg-blue-50 transition-colors"
                  >
                    Use Lorelin codes
                  </button>
                  
                  <button
                    onClick={() => {
                      setSelectedEmCode('current');
                      console.log('Keeping current codes');
                    }}
                    className="w-full px-4 py-2.5 bg-white border border-gray-300 text-[#101828] rounded-lg text-[13px] font-medium hover:bg-gray-50 transition-colors"
                  >
                    Keep current codes
                  </button>
                  
                  <button
                    onClick={() => setShowCustomizeFields(!showCustomizeFields)}
                    className="w-full px-4 py-2 text-[13px] text-blue-600 hover:text-blue-700 font-medium"
                  >
                    {showCustomizeFields ? 'Hide customization' : 'Customize codes'}
                  </button>
                </div>

                {showCustomizeFields && (
                  <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
                    <div>
                      <label className="text-[11px] text-[#6a7282] uppercase tracking-wider mb-1.5 block">
                        Add ICD-10 code
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., H35.30"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-[#6a7282] uppercase tracking-wider mb-1.5 block">
                        Add CPT code
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., 92134"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[11px] text-[#6a7282] uppercase tracking-wider mb-1.5 block">
                          Units
                        </label>
                        <input
                          type="number"
                          placeholder="1"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-[#6a7282] uppercase tracking-wider mb-1.5 block">
                          Modifiers
                        </label>
                        <input
                          type="text"
                          placeholder="e.g., 26"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Final codes block */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-[13px] font-semibold text-[#101828]">
                    Final selected codes
                  </h4>
                  <button
                    onClick={handleCopyCodes}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded text-[12px] font-medium text-[#101828] transition-colors"
                  >
                    <Copy className="size-3.5" />
                    Copy codes
                  </button>
                </div>
                
                <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-[12px] font-mono text-[#4a5565] leading-relaxed">
                  <div className="mb-3">
                    <div className="font-semibold text-[#101828] mb-1 not-italic">E/M</div>
                    {selectedEmCode === 'lorelin' ? (
                      <>99214 – Established patient, moderate complexity</>
                    ) : (
                      <>99213 – Established patient, low to moderate complexity</>
                    )}
                  </div>
                  <div className="mb-3">
                    <div className="font-semibold text-[#101828] mb-1 not-italic">ICD-10</div>
                    {selectedDiagnoses.length > 0 ? (
                      <>
                        {selectedDiagnoses.includes('H35.3211') && <>H35.3211 – Exudative AMD, right eye<br/></>}
                        {selectedDiagnoses.includes('H35.3212') && <>H35.3212 – Exudative AMD, left eye</>}
                      </>
                    ) : (
                      <span className="text-[#99A1AF] italic">No diagnoses selected</span>
                    )}
                  </div>
                  <div>
                    <div className="font-semibold text-[#101828] mb-1 not-italic">CPT</div>
                    {selectedProcedures.length > 0 ? (
                      <>
                        {selectedProcedures.includes('92084') && <>92084 – Visual field (linked to H35.3211, H35.3212)<br/></>}
                        {selectedProcedures.includes('92250') && <>92250 – Fundus photography (linked to H35.3211)</>}
                      </>
                    ) : (
                      <span className="text-[#99A1AF] italic">No procedures selected</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Ready to finalize */}
              {visitStatus === 'review' && (
                <div className="sticky bottom-6 bg-white border-2 border-blue-200 rounded-lg p-5 shadow-lg">
                  <div className="mb-4">
                    <div className="text-[14px] font-semibold text-[#101828] mb-1">
                      Ready to finalize coding?
                    </div>
                    <div className="text-[12px] text-[#4a5565] bg-blue-50 px-3 py-2 rounded border border-blue-200">
                      2 diagnoses • 2 procedures • Est. allowed: $380
                    </div>
                  </div>

                  <button 
                    onClick={handleMarkAsCoded}
                    className="w-full px-5 py-3 bg-[#101828] text-white rounded-lg text-[13px] font-medium hover:bg-[#1f2937] transition-colors mb-2"
                  >
                    Mark as coded
                  </button>
                  
                  <button 
                    className="w-full px-4 py-2 bg-white border border-gray-300 text-[#101828] rounded-lg text-[12px] font-medium hover:bg-gray-50 transition-colors"
                  >
                    Save for later
                  </button>
                </div>
              )}

              {/* Coded status */}
              {visitStatus === 'coded' && (
                <div className="sticky bottom-6 bg-emerald-50 border-2 border-emerald-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="size-5 text-emerald-600" />
                    <span className="text-[13px] font-semibold text-emerald-900">
                      Visit marked as coded
                    </span>
                  </div>
                  <div className="text-[12px] text-emerald-800 mb-3">
                    Ready to send to Athena in underlying PM
                  </div>
                  <button className="text-[12px] text-emerald-700 hover:text-emerald-800 font-medium">
                    View coding summary →
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}