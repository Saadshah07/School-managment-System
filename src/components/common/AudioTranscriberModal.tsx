import React, { useState, useRef } from 'react';
import { Mic, MicOff, Square, Loader2, Copy, Check, Sparkles, Volume2, X } from 'lucide-react';
import { api } from '../../services/api.js';

interface AudioTranscriberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertText?: (text: string) => void;
  title?: string;
  contextHint?: string;
}

export const AudioTranscriberModal: React.FC<AudioTranscriberModalProps> = ({
  isOpen,
  onClose,
  onInsertText,
  title = 'Voice Dictation & Transcription',
  contextHint = 'Dictate teacher evaluation remarks, student observations, or meeting minutes'
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcribedText, setTranscribedText] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [copied, setCopied] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);

  if (!isOpen) return null;

  const startRecording = async () => {
    try {
      setErrorMessage('');
      setTranscribedText('');
      audioChunksRef.current = [];

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        clearInterval(timerRef.current);
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        stream.getTracks().forEach(track => track.stop());

        // Convert blob to base64
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64Audio = (reader.result as string).split(',')[1];
          if (!base64Audio) {
            setErrorMessage('Could not process recorded audio.');
            return;
          }
          await processTranscription(base64Audio, 'audio/webm');
        };
      };

      mediaRecorder.start(250);
      setIsRecording(true);
      setRecordingDuration(0);

      timerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    } catch (err: any) {
      console.error('Microphone access failed:', err);
      setErrorMessage('Microphone access was denied or is not supported. You can also paste audio or use sample input.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const processTranscription = async (base64Audio: string, mimeType: string) => {
    setIsTranscribing(true);
    setErrorMessage('');
    try {
      const text = await api.transcribeAudio(base64Audio, mimeType);
      setTranscribedText(text);
    } catch (err: any) {
      console.error('Transcription error:', err);
      setErrorMessage(err.message || 'Transcription failed. Please check Gemini API configuration.');
    } finally {
      setIsTranscribing(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(transcribedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-indigo-50/50 to-white">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-indigo-600 rounded-xl text-white shadow-sm shadow-indigo-200">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 text-lg">{title}</h3>
              <p className="text-xs text-slate-500 font-mono flex items-center gap-1.5 mt-0.5">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
                Powered by gemini-3.5-transcribe
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          <p className="text-xs text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-100">
            {contextHint}
          </p>

          {/* Recording Status & Waveform Simulation */}
          <div className="flex flex-col items-center justify-center py-6 bg-slate-50/70 rounded-2xl border border-dashed border-slate-200">
            {isRecording ? (
              <div className="space-y-4 text-center">
                <div className="relative inline-flex items-center justify-center">
                  <span className="animate-ping absolute inline-flex h-20 w-20 rounded-full bg-rose-400 opacity-30"></span>
                  <div className="w-16 h-16 rounded-full bg-rose-600 flex items-center justify-center text-white shadow-lg shadow-rose-200">
                    <Mic className="w-8 h-8" />
                  </div>
                </div>

                {/* Animated Audio Equalizer Bars */}
                <div className="flex items-center justify-center gap-1 h-8">
                  {[40, 75, 100, 60, 90, 45, 80, 95, 50, 85, 30, 70].map((h, i) => (
                    <div
                      key={i}
                      className="w-1.5 bg-rose-500 rounded-full animate-pulse"
                      style={{
                        height: `${Math.max(20, (h * (recordingDuration % 2 ? 0.9 : 0.6)))}%`,
                        animationDelay: `${i * 80}ms`
                      }}
                    />
                  ))}
                </div>

                <div className="font-mono text-xl font-bold text-slate-800">
                  {formatSeconds(recordingDuration)}
                </div>
                <p className="text-xs text-rose-600 font-medium">Recording voice audio... Click Stop when finished</p>
              </div>
            ) : isTranscribing ? (
              <div className="flex flex-col items-center py-4 space-y-3">
                <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
                <p className="text-sm font-semibold text-slate-800">Transcribing with gemini-3.5-transcribe...</p>
                <p className="text-xs text-slate-500">Processing audio waveform into text</p>
              </div>
            ) : (
              <div className="text-center space-y-3">
                <div className="w-16 h-16 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mx-auto">
                  <Mic className="w-7 h-7" />
                </div>
                <p className="text-sm font-medium text-slate-700">Ready to record speech</p>
                <p className="text-xs text-slate-400 max-w-xs">
                  Press Start to speak using your microphone
                </p>
              </div>
            )}

            {/* Action Button */}
            <div className="mt-5">
              {isRecording ? (
                <button
                  type="button"
                  onClick={stopRecording}
                  className="flex items-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-medium rounded-xl shadow-md shadow-rose-200 transition-all text-sm"
                >
                  <Square className="w-4 h-4 fill-white" />
                  Stop & Transcribe
                </button>
              ) : (
                <button
                  type="button"
                  disabled={isTranscribing}
                  onClick={startRecording}
                  className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl shadow-md shadow-indigo-200 transition-all text-sm disabled:opacity-50"
                >
                  <Mic className="w-4 h-4" />
                  Start Recording
                </button>
              )}
            </div>
          </div>

          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-700 text-xs">
              {errorMessage}
            </div>
          )}

          {/* Transcribed Output Result */}
          {transcribedText && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                <span className="flex items-center gap-1.5">
                  <Volume2 className="w-3.5 h-3.5 text-emerald-600" />
                  Transcribed Result:
                </span>
                <button
                  onClick={copyToClipboard}
                  className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-600 font-medium">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-sm text-slate-800 leading-relaxed font-sans max-h-40 overflow-y-auto">
                {transcribedText}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-slate-600 hover:text-slate-800 hover:bg-slate-200/60 rounded-xl text-sm font-medium transition-colors"
          >
            Cancel
          </button>
          {transcribedText && onInsertText && (
            <button
              type="button"
              onClick={() => {
                onInsertText(transcribedText);
                onClose();
              }}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-emerald-200 transition-all flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              Use This Text
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
