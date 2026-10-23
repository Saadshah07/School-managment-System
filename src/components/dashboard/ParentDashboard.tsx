import React, { useState, useEffect } from 'react';
import {
  Heart,
  CalendarCheck,
  CreditCard,
  Award,
  Bell,
  CheckCircle2,
  Phone,
  Mail,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import { api } from '../../services/api.js';
import type { Student, FeeInvoice, ExamResult } from '../../types/index.js';

interface ParentDashboardProps {
  onNavigateTab: (tab: string) => void;
  onOpenReportCard: (result: ExamResult) => void;
}

export const ParentDashboard: React.FC<ParentDashboardProps> = ({ onNavigateTab, onOpenReportCard }) => {
  const { currentUser } = useAuth();
  const [child, setChild] = useState<Student | null>(null);
  const [invoices, setInvoices] = useState<FeeInvoice[]>([]);
  const [examResults, setExamResults] = useState<ExamResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const students = await api.getStudents();
        const myChild = students.find(s => s.id === currentUser?.linkedStudentId) || students[0];
        setChild(myChild);

        if (myChild) {
          const [inv, res] = await Promise.all([
            api.getInvoices({ studentId: myChild.id }),
            api.getExamResults({ studentId: myChild.id })
          ]);
          setInvoices(inv);
          setExamResults(res);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [currentUser]);

  if (loading || !child) {
    return <div className="p-8 text-center text-sm text-slate-400">Loading parent portal...</div>;
  }

  const outstandingBalance = invoices.reduce((acc, i) => acc + i.remainingBalance, 0);

  return (
    <div className="space-y-6">
      {/* Parent Welcome Banner */}
      <div className="bg-gradient-to-r from-violet-700 via-indigo-800 to-slate-900 rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <img
            src={child.photo}
            alt={child.fullName}
            className="w-16 h-16 rounded-2xl object-cover ring-4 ring-white/20 shadow-lg"
          />
          <div>
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 bg-violet-500/30 rounded-full text-[11px] font-semibold text-violet-200 mb-1">
              <Heart className="w-3 h-3 text-rose-300 fill-rose-300" />
              <span>Parent / Guardian Portal • Child: {child.fullName}</span>
            </div>
            <h2 className="text-2xl font-black">{currentUser?.name}</h2>
            <p className="text-xs text-violet-200">
              Student ID: {child.admissionNo} • {child.className} ({child.sectionName})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigateTab('fees')}
            className="flex items-center gap-2 px-4 py-2.5 bg-white text-violet-950 font-bold rounded-xl text-xs shadow-md transition-all cursor-pointer"
          >
            <CreditCard className="w-4 h-4 text-violet-600" />
            <span>Pay School Dues</span>
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Child's Attendance</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <CalendarCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-slate-800">96.8%</span>
            <span className="text-xs text-emerald-600 font-semibold ml-1.5">Present Today</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Class Teacher: Sarah Jenkins, M.Sc.</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Academic Standing</span>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-slate-800">Grade A+</span>
            <span className="text-xs text-purple-600 font-bold ml-1.5">3.9 GPA</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Class Rank: 1st Position</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Account Balance</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-slate-800">${outstandingBalance}</span>
            <span className="text-xs text-emerald-600 font-semibold ml-1.5">{outstandingBalance === 0 ? 'Clear' : 'Due'}</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Next invoice: November 1st</p>
        </div>
      </div>

      {/* Child Examination Results */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-slate-800 text-sm">Official Assessment Records</h3>
            <p className="text-xs text-slate-400">Verified by Principal Marcus Holloway</p>
          </div>
          {examResults[0] && (
            <button
              onClick={() => onOpenReportCard(examResults[0])}
              className="px-3.5 py-1.5 bg-violet-600 text-white rounded-xl text-xs font-semibold hover:bg-violet-700 transition-colors"
            >
              View Report Card
            </button>
          )}
        </div>

        {examResults.length > 0 ? (
          <div className="mt-4 space-y-3">
            {examResults.map((res) => (
              <div key={res.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200/60 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-800">{res.examTitle}</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">Score: {res.totalObtained}/{res.totalMax} ({res.percentage}%) • Grade {res.overallGrade}</p>
                </div>
                <button
                  onClick={() => onOpenReportCard(res)}
                  className="text-xs font-semibold text-violet-600 hover:text-violet-800 flex items-center gap-1"
                >
                  Full Transcript <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 text-center text-xs text-slate-400">No examination reports yet.</div>
        )}
      </div>
    </div>
  );
};
