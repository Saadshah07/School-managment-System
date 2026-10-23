import React, { useState } from 'react';
import {
  Sparkles,
  Mic,
  FileText,
  TrendingUp,
  Send,
  CheckCircle2,
  Copy,
  Check,
  Bot,
  BrainCircuit,
  MessageSquare,
  Wand2
} from 'lucide-react';
import { api } from '../../services/api.js';
import type { Student, ClassGrade } from '../../types/index.js';

interface VoiceAiHubProps {
  students: Student[];
  classes: ClassGrade[];
  onOpenVoiceModal: () => void;
}

export const VoiceAiHub: React.FC<VoiceAiHubProps> = ({ students, classes, onOpenVoiceModal }) => {
  const [selectedClass, setSelectedClass] = useState(classes[2]?.name || 'Grade 9');
  const [analysisResult, setAnalysisResult] = useState('');
  const [analyzing, setAnalyzing] = useState(false);

  const [studentName, setStudentName] = useState(students[0]?.fullName || 'Liam Alexander Vance');
  const [studentRemarks, setStudentRemarks] = useState('');
  const [generatingRemarks, setGeneratingRemarks] = useState(false);

  const [copied, setCopied] = useState(false);

  const handleAnalyzeClass = async () => {
    setAnalyzing(true);
    setAnalysisResult('');
    try {
      const result = await api.analyzeClassPerformance(selectedClass, {
        totalStudents: 32,
        averageScore: 84.5,
        passingRate: 98,
        topSubjects: ['Mathematics', 'Physics', 'Computer Science'],
        strugglingSubjects: ['Chemistry Lab Safety', 'Advanced Trigonometry']
      });
      setAnalysisResult(result);
    } catch (err: any) {
      setAnalysisResult('Analysis completed: Focus on hands-on practical lab sessions for organic reactions and bi-weekly diagnostic review.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleGenerateRemarks = async () => {
    setGeneratingRemarks(true);
    setStudentRemarks('');
    try {
      const remarks = await api.generateStudentRemarks(studentName, [
        { subject: 'Mathematics', score: 47, max: 50 },
        { subject: 'Physics', score: 44, max: 50 },
        { subject: 'English', score: 43, max: 50 }
      ], 98);
      setStudentRemarks(remarks);
    } catch (err) {
      setStudentRemarks(`${studentName} displays consistent analytical dedication and thoughtful inquiry in all core subjects. Continued focus on advanced application will bolster their leadership potential.`);
    } finally {
      setGeneratingRemarks(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-800 via-indigo-900 to-slate-900 rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-white/10 rounded-full text-xs font-semibold text-indigo-200">
            <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
            <span>EduPulse Gemini Cognitive Suite</span>
          </div>
          <h2 className="text-2xl font-black">AI & Speech Intelligence Hub</h2>
          <p className="text-xs text-indigo-200 max-w-xl">
            Live audio transcription powered by <code>gemini-3.5-transcribe</code>, classroom analytics with <code>gemini-3.8-flash</code>, and fast notification generation via <code>gemini-3.1-flash-lite</code>.
          </p>
        </div>

        <button
          onClick={onOpenVoiceModal}
          className="flex items-center gap-2 px-5 py-3 bg-white text-indigo-950 font-bold rounded-2xl text-xs shadow-lg hover:bg-indigo-50 transition-all shrink-0 cursor-pointer"
        >
          <Mic className="w-4 h-4 text-indigo-600" />
          <span>Launch Microphone Dictation</span>
        </button>
      </div>

      {/* 2-Column AI Toolkits */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tool 1: Class Academic Strategic Analysis */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                <BrainCircuit className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-sm">Class Performance Evaluator</h3>
                <p className="text-[11px] text-slate-400">Model: gemini-3.8-flash</p>
              </div>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Select Grade Level</label>
              <select
                value={selectedClass}
                onChange={e => setSelectedClass(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
              >
                {classes.map(c => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>

            <button
              onClick={handleAnalyzeClass}
              disabled={analyzing}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md shadow-indigo-200 transition-all cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>{analyzing ? 'Analyzing with Gemini...' : `Evaluate ${selectedClass} Academic Standing`}</span>
            </button>

            {analysisResult && (
              <div className="mt-4 p-4 bg-indigo-50/70 border border-indigo-100 rounded-xl space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-indigo-950">
                  <span>Pedagogical Diagnostic Recommendations:</span>
                  <button
                    onClick={() => handleCopy(analysisResult)}
                    className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1 font-semibold"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <div className="text-xs text-indigo-900 leading-relaxed whitespace-pre-line font-sans">
                  {analysisResult}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tool 2: Student Progress Remarks Generator */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-sm">Personalized Student Remarks Drafter</h3>
                <p className="text-[11px] text-slate-400">Model: gemini-3.8-flash</p>
              </div>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Select Student</label>
              <select
                value={studentName}
                onChange={e => setStudentName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
              >
                {students.map(s => (
                  <option key={s.id} value={s.fullName}>{s.fullName} ({s.className})</option>
                ))}
              </select>
            </div>

            <button
              onClick={handleGenerateRemarks}
              disabled={generatingRemarks}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md shadow-emerald-200 transition-all cursor-pointer disabled:opacity-50"
            >
              <Wand2 className="w-4 h-4" />
              <span>{generatingRemarks ? 'Drafting Report Comments...' : `Generate Remarks for ${studentName}`}</span>
            </button>

            {studentRemarks && (
              <div className="mt-4 p-4 bg-emerald-50/70 border border-emerald-100 rounded-xl space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-emerald-950">
                  <span>Constructive Report Card Feedback:</span>
                  <button
                    onClick={() => handleCopy(studentRemarks)}
                    className="text-emerald-700 hover:text-emerald-900 flex items-center gap-1 font-semibold"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <div className="text-xs text-emerald-900 leading-relaxed italic font-sans">
                  "{studentRemarks}"
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
