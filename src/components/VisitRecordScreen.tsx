import { useState, useEffect } from 'react';
import { ChevronLeft, Mic, Play, Pause } from 'lucide-react';

interface VisitRecordScreenProps {
  onBack: () => void;
}

type RecordingState = 'idle' | 'recording' | 'paused' | 'transcribing';

export function VisitRecordScreen({ onBack }: VisitRecordScreenProps) {
  const [recordingState, setRecordingState] = useState<RecordingState>('idle');
  const [recordingTime, setRecordingTime] = useState(0);
  const [hasLastRecording] = useState(false); // Set to true if prior attempt exists

  // Timer for recording
  useEffect(() => {
    let interval: number | undefined;
    
    if (recordingState === 'recording') {
      interval = window.setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [recordingState]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartRecording = () => {
    setRecordingTime(0);
    setRecordingState('recording');
  };

  const handleStopRecording = () => {
    setRecordingState('transcribing');
    // Simulate transcription
    setTimeout(() => {
      // In real app, navigate to "To review" state
      onBack();
    }, 3000);
  };

  const handlePauseRecording = () => {
    setRecordingState('paused');
  };

  const handleResumeRecording = () => {
    setRecordingState('recording');
  };

  return (
    <div className="h-full flex flex-col bg-[#f5f5f7]">
      {/* Split pane content */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-[1600px] mx-auto px-8 py-8">
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
                  <span className="px-2 py-0.5 bg-gray-100 text-[#4a5565] rounded text-[13px]">Medicare</span>
                </div>
              </div>

              {/* Right: Status + Play last recording */}
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-1 border border-blue-300 text-blue-600 rounded text-[12px] font-medium">
                  To record
                </span>
                {hasLastRecording && (
                  <button className="flex items-center gap-1.5 text-[12px] text-[#6a7282] hover:text-[#4a5565] font-medium">
                    <Play className="size-3.5" />
                    Play last recording
                  </button>
                )}
              </div>
            </div>

            {/* Visit pipeline stepper */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center size-7 rounded-full bg-blue-600 text-white font-medium text-[12px]">
                  1
                </div>
                <span className="text-[12px] font-medium text-[#101828]">To record</span>
              </div>
              
              <div className="h-0.5 w-8 bg-gray-300" />
              
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center size-7 rounded-full bg-gray-200 text-[#6a7282] font-medium text-[12px]">
                  2
                </div>
                <span className="text-[12px] text-[#6a7282]">Transcribed</span>
              </div>
              
              <div className="h-0.5 w-8 bg-gray-300" />
              
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center size-7 rounded-full bg-gray-200 text-[#6a7282] font-medium text-[12px]">
                  3
                </div>
                <span className="text-[12px] text-[#6a7282]">Coding review</span>
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

          {/* Main 2-column body */}
          <div className="grid grid-cols-[1fr_auto] gap-6">
            {/* Left column: Recording card (~60%) */}
            <div className="min-w-0">
              <div className="bg-white border border-gray-200 rounded-lg p-8">
                <h2 className="text-[16px] font-semibold text-[#101828] mb-6">
                  Record this visit
                </h2>

                {/* Idle state */}
                {recordingState === 'idle' && (
                  <div className="flex flex-col items-center py-12">
                    <div className="mb-6">
                      <Mic className="size-20 text-blue-600" strokeWidth={1.5} />
                    </div>
                    <p className="text-[14px] text-[#4a5565] mb-8 text-center max-w-md">
                      Ready when you are. Start recording when the patient enters the room.
                    </p>
                    <button
                      onClick={handleStartRecording}
                      className="flex items-center gap-2 px-6 py-3 bg-[#101828] text-white rounded-lg text-[14px] font-medium hover:bg-[#1f2937] transition-colors mb-3"
                    >
                      <div className="size-2 rounded-full bg-red-500" />
                      Start recording
                    </button>
                    <button className="text-[12px] text-blue-600 hover:text-blue-700 font-medium">
                      Or record from phone
                    </button>
                    <p className="text-[12px] text-[#6a7282] mt-6 text-center max-w-md">
                      We'll automatically transcribe and prepare a draft note after you stop.
                    </p>
                  </div>
                )}

                {/* Recording state */}
                {recordingState === 'recording' && (
                  <div className="flex flex-col items-center py-12">
                    <div className="mb-6 relative">
                      <Mic className="size-20 text-blue-600 animate-pulse" strokeWidth={1.5} />
                      <div className="absolute -inset-4 bg-blue-100 rounded-full opacity-30 animate-ping" />
                    </div>
                    
                    <div className="flex items-center gap-3 mb-6">
                      <span className="text-[16px] font-semibold text-[#101828]">
                        Recording…
                      </span>
                      <span className="text-[16px] font-mono text-blue-600">
                        {formatTime(recordingTime)}
                      </span>
                    </div>

                    {/* Waveform visualization */}
                    <div className="flex items-center gap-1 h-12 mb-8">
                      {[...Array(40)].map((_, i) => (
                        <div
                          key={i}
                          className="w-1 bg-blue-400 rounded-full transition-all"
                          style={{
                            height: `${20 + Math.random() * 60}%`,
                            opacity: 0.3 + Math.random() * 0.7,
                          }}
                        />
                      ))}
                    </div>

                    <div className="flex items-center gap-3 mb-6">
                      <button
                        onClick={handleStopRecording}
                        className="flex items-center gap-2 px-6 py-3 bg-[#101828] text-white rounded-lg text-[14px] font-medium hover:bg-[#1f2937] transition-colors"
                      >
                        <div className="size-2 bg-white" />
                        Stop & save
                      </button>
                      <button
                        onClick={handlePauseRecording}
                        className="text-[13px] text-[#6a7282] hover:text-[#4a5565] font-medium"
                      >
                        Pause
                      </button>
                    </div>

                    <p className="text-[12px] text-[#6a7282] text-center max-w-md">
                      Keep this screen open while recording. You can lock your device screen if needed.
                    </p>
                  </div>
                )}

                {/* Paused state */}
                {recordingState === 'paused' && (
                  <div className="flex flex-col items-center py-12">
                    <div className="mb-6">
                      <Pause className="size-20 text-gray-400" strokeWidth={1.5} />
                    </div>
                    
                    <div className="flex items-center gap-3 mb-6">
                      <span className="text-[16px] font-semibold text-[#101828]">
                        Paused
                      </span>
                      <span className="text-[16px] font-mono text-[#6a7282]">
                        {formatTime(recordingTime)}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 mb-6">
                      <button
                        onClick={handleResumeRecording}
                        className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg text-[14px] font-medium hover:bg-blue-700 transition-colors"
                      >
                        <div className="size-2 rounded-full bg-red-500" />
                        Resume
                      </button>
                      <button
                        onClick={handleStopRecording}
                        className="flex items-center gap-2 px-6 py-3 bg-[#101828] text-white rounded-lg text-[14px] font-medium hover:bg-[#1f2937] transition-colors"
                      >
                        <div className="size-2 bg-white" />
                        Stop & save
                      </button>
                    </div>
                  </div>
                )}

                {/* Transcribing state */}
                {recordingState === 'transcribing' && (
                  <div className="flex flex-col items-center py-12">
                    <div className="mb-6">
                      <div className="size-20 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin" />
                    </div>
                    
                    <p className="text-[16px] font-semibold text-[#101828] mb-2">
                      Transcribing audio…
                    </p>
                    <p className="text-[12px] text-[#6a7282] mb-8">
                      This usually takes a few seconds
                    </p>

                    <button
                      onClick={onBack}
                      className="px-5 py-2.5 bg-white border border-gray-300 text-[#101828] rounded-lg text-[13px] font-medium hover:bg-gray-50 transition-colors"
                    >
                      Back to visit list
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Right column: Visit basics (~40%) */}
            <div className="w-[400px]">
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-[14px] font-semibold text-[#101828] mb-4">
                  Visit details
                </h3>

                <div className="space-y-3">
                  <div className="grid grid-cols-[100px_1fr] gap-2">
                    <span className="text-[12px] text-[#6a7282]">Patient:</span>
                    <span className="text-[12px] text-[#101828] font-medium">Maria Garcia (68F)</span>
                  </div>

                  <div className="grid grid-cols-[100px_1fr] gap-2">
                    <span className="text-[12px] text-[#6a7282]">Provider:</span>
                    <span className="text-[12px] text-[#101828]">Dr. Lee</span>
                  </div>

                  <div className="grid grid-cols-[100px_1fr] gap-2">
                    <span className="text-[12px] text-[#6a7282]">Date & time:</span>
                    <span className="text-[12px] text-[#101828]">Mar 02, 2025 · 10:30 AM</span>
                  </div>

                  <div className="grid grid-cols-[100px_1fr] gap-2">
                    <span className="text-[12px] text-[#6a7282]">Location:</span>
                    <span className="text-[12px] text-[#101828]">Retina clinic · Room 4</span>
                  </div>

                  <div className="grid grid-cols-[100px_1fr] gap-2">
                    <span className="text-[12px] text-[#6a7282]">Payer:</span>
                    <span className="text-[12px] text-[#101828]">Medicare</span>
                  </div>

                  <div className="grid grid-cols-[100px_1fr] gap-2">
                    <span className="text-[12px] text-[#6a7282]">Reason:</span>
                    <span className="text-[12px] text-[#101828]">Follow-up: macular degeneration</span>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-200">
                  <p className="text-[11px] text-[#6a7282] italic">
                    You'll see transcript, note, and coding suggestions here after recording.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
