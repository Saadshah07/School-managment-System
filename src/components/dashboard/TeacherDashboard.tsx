import React, { useState, useEffect } from 'react';
import {
  CalendarCheck,
  Award,
  Users,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Mic,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import { api } from '../../services/api.js';
import type { Teacher, Exam } from '../../types/index.js';

interface TeacherDashboardProps {
  onNavigateTab: (tab: string) => void;
  onOpenVoiceModal: () => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ onNavigateTab, onOpenVoiceModal }) => {
  const { currentUser } = useAuth();
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [upcomingExams, setUpcomingExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const teachers = await api.getTeachers();
        const me = teachers.find(t => t.id === currentUser?.linkedTeacherId) || teachers[0];
        setTeacher(me);
        const exams = await api.getExams();
        setUpcomingExams(exams);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [currentUser]);

  if (loading) {
    return <div className="p-8 text-center text-sm text-slate-400">Loading teacher workspace...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Teacher Profile Banner */}
      <div className="bg-gradient-to-r from-emerald-700 via-emerald-800 to-slate-900 rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <img
            src={teacher?.photo}
            alt={teacher?.fullName}
            className="w-16 h-16 rounded-2xl object-cover ring-4 ring-white/20 shadow-lg"
          />
          <div>
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 bg-emerald-500/30 rounded-full text-[11px] font-semibold text-emerald-200 mb-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-300"></span>
              <span>Faculty Member • {teacher?.employeeId}</span>
            </div>
            <h2 className="text-2xl font-black">{teacher?.fullName}</h2>
            <p className="text-xs text-emerald-200">{teacher?.qualification}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenVoiceModal}
            className="flex items-center gap-2 px-4 py-2.5 bg-white text-emerald-950 font-bold rounded-xl text-xs shadow-md transition-all cursor-pointer"
          >
            <Mic className="w-4 h-4 text-emerald-600" />
            <span>Voice Dictate Remarks</span>
          </button>
          <button
            onClick={() => onNavigateTab('attendance')}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-xs transition-all cursor-pointer"
          >
            <CalendarCheck className="w-4 h-4" />
            <span>Mark Today's Attendance</span>
          </button>
        </div>
      </div>

      {/* Assigned Classes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {teacher?.assignedClasses.map((ac, idx) => (
          <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-emerald-200 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700">
                {ac.className}
              </span>
              <span className="text-xs text-slate-400 font-medium">{ac.sectionName}</span>
            </div>
            <h4 className="text-base font-bold text-slate-800 mt-2">{ac.subject}</h4>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500">Scheduled: Mon - Fri</span>
              <button
                onClick={() => onNavigateTab('attendance')}
                className="text-emerald-600 font-bold hover:underline"
              >
                Roll Call →
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Two Column: Upcoming Assessments & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <Award className="w-4 h-4 text-indigo-600" />
              Upcoming Examinations & Marks Entry
            </h3>
            <button
              onClick={() => onNavigateTab('exams')}
              className="text-xs text-emerald-600 font-bold"
            >
              Open Marks Table
            </button>
          </div>
          <div className="mt-4 space-y-3">
            {upcomingExams.map((ex) => (
              <div key={ex.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-800">{ex.title}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">{ex.className} • Type: {ex.examType}</p>
                </div>
                <button
                  onClick={() => onNavigateTab('exams')}
                  className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700"
                >
                  Enter Scores
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* AI Assistance for Teachers */}
        <div className="bg-gradient-to-br from-indigo-50 to-violet-50 rounded-2xl border border-indigo-100 p-5 shadow-xs">
          <div className="flex items-center gap-2 pb-3 border-b border-indigo-100/80">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <h3 className="font-bold text-indigo-950 text-sm">Teacher AI Co-Pilot</h3>
          </div>
          <p className="text-xs text-indigo-900/80 mt-3 leading-relaxed">
            Use Gemini AI to instantly draft report card comments, proofread term feedback, and transcribe verbal student remarks into structured report card notes.
          </p>
          <div className="mt-4 flex flex-col gap-2">
            <button
              onClick={onOpenVoiceModal}
              className="w-full flex items-center justify-between p-3 bg-white rounded-xl border border-indigo-200 text-xs font-semibold text-indigo-900 hover:bg-indigo-50 shadow-xs"
            >
              <span className="flex items-center gap-2">
                <Mic className="w-4 h-4 text-indigo-600" />
                Audio Speech-to-Text via gemini-3.5-transcribe
              </span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onNavigateTab('exams')}
              className="w-full flex items-center justify-between p-3 bg-white rounded-xl border border-indigo-200 text-xs font-semibold text-indigo-900 hover:bg-indigo-50 shadow-xs"
            >
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                Auto-Generate Student Progress Remarks
              </span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
