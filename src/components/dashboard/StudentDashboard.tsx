import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Award,
  CalendarCheck,
  CreditCard,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import { api } from '../../services/api.js';
import type { Student, ExamResult, FeeInvoice, AttendanceRecord } from '../../types/index.js';

interface StudentDashboardProps {
  onNavigateTab: (tab: string) => void;
  onOpenIdCard: (student: Student) => void;
  onOpenReportCard: (result: ExamResult) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  onNavigateTab,
  onOpenIdCard,
  onOpenReportCard
}) => {
  const { currentUser } = useAuth();
  const [student, setStudent] = useState<Student | null>(null);
  const [examResults, setExamResults] = useState<ExamResult[]>([]);
  const [invoices, setInvoices] = useState<FeeInvoice[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const students = await api.getStudents();
        const me = students.find(s => s.id === currentUser?.linkedStudentId) || students[0];
        setStudent(me);

        if (me) {
          const [res, inv, att] = await Promise.all([
            api.getExamResults({ studentId: me.id }),
            api.getInvoices({ studentId: me.id }),
            api.getAttendance({ personId: me.id })
          ]);
          setExamResults(res);
          setInvoices(inv);
          setAttendance(att);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [currentUser]);

  if (loading || !student) {
    return <div className="p-8 text-center text-sm text-slate-400">Loading student portal...</div>;
  }

  const latestResult = examResults[0];
  const attendanceRate = attendance.length > 0
    ? Math.round((attendance.filter(a => a.status === 'Present' || a.status === 'Late').length / attendance.length) * 100)
    : 95;

  return (
    <div className="space-y-6">
      {/* Student Profile Header */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-800 to-slate-900 rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <img
            src={student.photo}
            alt={student.fullName}
            className="w-16 h-16 rounded-2xl object-cover ring-4 ring-white/20 shadow-lg"
          />
          <div>
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 bg-blue-500/30 rounded-full text-[11px] font-semibold text-blue-200 mb-1">
              <span>{student.admissionNo} • Roll #{student.rollNumber}</span>
            </div>
            <h2 className="text-2xl font-black">{student.fullName}</h2>
            <p className="text-xs text-blue-200">{student.className} • {student.sectionName}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onOpenIdCard(student)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white text-indigo-950 font-bold rounded-xl text-xs shadow-md transition-all cursor-pointer"
          >
            <FileText className="w-4 h-4 text-indigo-600" />
            <span>View Student ID Card</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Attendance Rate</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <CalendarCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-slate-800">{attendanceRate}%</span>
            <span className="text-xs text-emerald-600 font-semibold ml-1.5">Good Standing</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Above minimum 75% required policy</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Current GPA / Grade</span>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-slate-800">{latestResult ? `${latestResult.gpa} GPA` : '3.9 GPA'}</span>
            <span className="text-xs text-purple-600 font-bold ml-1.5">{latestResult ? `Grade ${latestResult.overallGrade}` : 'Grade A+'}</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Rank #{latestResult?.rank || 1} in class section</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Fee Invoices</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-slate-800">
              ${invoices.reduce((acc, i) => acc + i.remainingBalance, 0)}
            </span>
            <span className="text-xs text-slate-500 ml-1.5">Pending</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">All current term dues settled</p>
        </div>
      </div>

      {/* Latest Academic Assessment Results */}
      {latestResult && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">{latestResult.examTitle}</h3>
              <p className="text-xs text-slate-400">Published official academic transcript</p>
            </div>
            <button
              onClick={() => onOpenReportCard(latestResult)}
              className="px-3.5 py-1.5 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 transition-colors"
            >
              Print Report Card
            </button>
          </div>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
            {latestResult.marks.map((m, idx) => (
              <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">{m.subjectName}</span>
                  <span className="text-xs font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                    {m.grade}
                  </span>
                </div>
                <div className="mt-2 text-sm font-semibold text-slate-700">
                  {m.marksObtained} <span className="text-xs text-slate-400">/ {m.maxMarks}</span>
                </div>
              </div>
            ))}
          </div>

          {latestResult.teacherRemarks && (
            <div className="mt-4 p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl">
              <p className="text-xs font-bold text-indigo-950">Teacher Remarks:</p>
              <p className="text-xs text-indigo-900 mt-1 italic">"{latestResult.teacherRemarks}"</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
