import React from 'react';
import {
  Users,
  GraduationCap,
  BookOpen,
  CheckCircle2,
  XCircle,
  Clock,
  DollarSign,
  AlertTriangle,
  Award,
  PlusCircle,
  ArrowUpRight,
  TrendingUp,
  CreditCard,
  Calendar,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend
} from 'recharts';
import type { DashboardStats } from '../../types/index.js';

interface AdminDashboardProps {
  stats: DashboardStats;
  onNavigateTab: (tab: string) => void;
  onQuickAction: (action: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ stats, onNavigateTab, onQuickAction }) => {
  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome & Quick Action Bar */}
      <div className="bg-gradient-to-r from-indigo-700 via-indigo-800 to-slate-900 rounded-3xl p-6 text-white shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute -right-8 -bottom-8 w-64 h-64 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 space-y-1.5">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-semibold text-indigo-200">
            <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
            <span>EduPulse Institutional Core • Live Production</span>
          </div>
          <h2 className="text-2xl font-black tracking-tight text-white">Campus Academic & Operational Command</h2>
          <p className="text-sm text-indigo-200 max-w-xl">
            Real-time enrollment, biometric attendance tracking, automated fee billing, and examination monitoring.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="relative z-10 flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => onQuickAction('new_student')}
            className="flex items-center gap-2 px-4 py-2.5 bg-white text-indigo-900 hover:bg-indigo-50 font-bold rounded-xl text-xs shadow-md transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 text-indigo-600" />
            <span>New Admission</span>
          </button>
          <button
            onClick={() => onNavigateTab('attendance')}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600/80 hover:bg-indigo-600 text-white font-semibold rounded-xl text-xs backdrop-blur-sm border border-indigo-400/30 transition-all cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-300" />
            <span>Mark Attendance</span>
          </button>
          <button
            onClick={() => onNavigateTab('fees')}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600/80 hover:bg-indigo-600 text-white font-semibold rounded-xl text-xs backdrop-blur-sm border border-indigo-400/30 transition-all cursor-pointer"
          >
            <CreditCard className="w-4 h-4 text-amber-300" />
            <span>Collect Fee</span>
          </button>
          <button
            onClick={() => onNavigateTab('exams')}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600/80 hover:bg-indigo-600 text-white font-semibold rounded-xl text-xs backdrop-blur-sm border border-indigo-400/30 transition-all cursor-pointer"
          >
            <Award className="w-4 h-4 text-purple-300" />
            <span>Examinations</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Students */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Enrolled</span>
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
              <GraduationCap className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-slate-800">{stats.totalStudents}</span>
            <span className="text-xs text-slate-500 ml-1.5 font-medium">Students</span>
          </div>
          <div className="mt-2 text-xs text-emerald-600 font-semibold flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>100% Active in {stats.totalClasses} Grades</span>
          </div>
        </div>

        {/* Faculty & Staff */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Faculty & Staff</span>
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-slate-800">{stats.totalTeachers}</span>
            <span className="text-xs text-slate-500 ml-1.5 font-medium">Teachers</span>
          </div>
          <div className="mt-2 text-xs text-indigo-600 font-semibold flex items-center gap-1">
            <BookOpen className="w-3.5 h-3.5" />
            <span>{stats.totalSections} Class Sections Assigned</span>
          </div>
        </div>

        {/* Today's Attendance */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Attendance Today</span>
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div>
              <span className="text-2xl font-black text-slate-800">{stats.studentsPresentToday}</span>
              <span className="text-xs text-emerald-600 font-bold ml-1">Present</span>
            </div>
            <span className="text-xs font-mono font-bold px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100">
              {stats.attendancePercentageToday}%
            </span>
          </div>
          <div className="mt-2 flex items-center gap-3 text-xs text-slate-500">
            <span className="flex items-center gap-1 text-rose-600 font-semibold">
              <XCircle className="w-3 h-3" /> {stats.studentsAbsentToday} Absent
            </span>
            <span className="flex items-center gap-1 text-amber-600 font-semibold">
              <Clock className="w-3 h-3" /> {stats.studentsLateToday} Late
            </span>
          </div>
        </div>

        {/* Total Fee Collection & Outstanding */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Fee Invoicing</span>
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-slate-800">${stats.totalFeeCollection.toLocaleString()}</span>
            <span className="text-xs text-emerald-600 font-semibold ml-1.5">Collected</span>
          </div>
          <div className="mt-2 text-xs text-rose-600 font-bold flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>${stats.outstandingFeeBalance.toLocaleString()} Outstanding</span>
          </div>
        </div>
      </div>

      {/* Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Trends Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Weekly Attendance Rate</h3>
              <p className="text-xs text-slate-400">Daily student presence trends</p>
            </div>
            <button
              onClick={() => onNavigateTab('attendance')}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1"
            >
              Details <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.attendanceTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} />
                <YAxis domain={[70, 100]} stroke="#94a3b8" fontSize={11} unit="%" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="rate"
                  name="Attendance %"
                  stroke="#4f46e5"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#4f46e5' }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Fee Collection vs Target Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Monthly Fee Collection</h3>
              <p className="text-xs text-slate-400">Revenue collected vs billed targets (USD)</p>
            </div>
            <button
              onClick={() => onNavigateTab('fees')}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1"
            >
              Invoices <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.monthlyCollection}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(val) => `$${val / 1000}k`} />
                <Tooltip
                  formatter={(val: any) => [`$${val.toLocaleString()}`, '']}
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Legend />
                <Bar dataKey="collected" name="Collected" fill="#4f46e5" radius={[6, 6, 0, 0]} />
                <Bar dataKey="target" name="Target" fill="#cbd5e1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Two-Column Bottom Lists: Recent Admissions & Recent Payments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Admissions */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-indigo-600" />
              <h3 className="font-bold text-slate-800 text-sm">Recent Student Admissions</h3>
            </div>
            <button
              onClick={() => onNavigateTab('students')}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-bold"
            >
              View All ({stats.totalStudents})
            </button>
          </div>
          <div className="divide-y divide-slate-100">
            {stats.recentAdmissions.map((s) => (
              <div key={s.id} className="p-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                <div className="flex items-center space-x-3">
                  <img
                    src={s.photo}
                    alt={s.fullName}
                    className="w-10 h-10 rounded-xl object-cover border border-slate-200"
                  />
                  <div>
                    <p className="text-xs font-bold text-slate-800">{s.fullName}</p>
                    <p className="text-[11px] text-slate-500 font-mono">{s.admissionNo} • {s.className}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                    {s.status}
                  </span>
                  <p className="text-[10px] text-slate-400 mt-0.5">{s.admissionDate}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Payments */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              <h3 className="font-bold text-slate-800 text-sm">Recent Fee Receipts</h3>
            </div>
            <button
              onClick={() => onNavigateTab('fees')}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-bold"
            >
              View Ledger
            </button>
          </div>
          <div className="divide-y divide-slate-100">
            {stats.recentPayments.length > 0 ? (
              stats.recentPayments.map((p, idx) => (
                <div key={idx} className="p-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 font-mono text-xs font-bold">
                      RCP
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800">{p.receiptNo}</p>
                      <p className="text-[11px] text-slate-500">Method: {p.paymentMethod} • Ref: {p.transactionRef || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-emerald-600">+${p.amount.toFixed(2)}</span>
                    <p className="text-[10px] text-slate-400 mt-0.5">{p.date}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-xs text-slate-400">No payment transactions recorded yet.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
