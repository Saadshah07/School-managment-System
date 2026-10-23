import React from 'react';
import {
  LayoutDashboard,
  GraduationCap,
  Users,
  BookOpen,
  CalendarCheck,
  CreditCard,
  Award,
  Bell,
  Sparkles,
  School,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onSelectTab }) => {
  const { currentRole, currentUser } = useAuth();

  // Role definitions and access rules
  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      roles: ['super_admin', 'school_admin', 'principal', 'teacher', 'accountant', 'receptionist', 'student', 'parent']
    },
    {
      id: 'students',
      label: 'Students',
      icon: GraduationCap,
      roles: ['super_admin', 'school_admin', 'principal', 'teacher', 'receptionist', 'student', 'parent']
    },
    {
      id: 'teachers',
      label: 'Faculty & Staff',
      icon: Users,
      roles: ['super_admin', 'school_admin', 'principal', 'teacher', 'accountant']
    },
    {
      id: 'academics',
      label: 'Classes & Subjects',
      icon: BookOpen,
      roles: ['super_admin', 'school_admin', 'principal', 'teacher', 'student']
    },
    {
      id: 'attendance',
      label: 'Attendance',
      icon: CalendarCheck,
      roles: ['super_admin', 'school_admin', 'principal', 'teacher', 'student', 'parent']
    },
    {
      id: 'fees',
      label: 'Fees & Accounts',
      icon: CreditCard,
      roles: ['super_admin', 'school_admin', 'principal', 'accountant', 'receptionist', 'parent', 'student']
    },
    {
      id: 'exams',
      label: 'Examinations',
      icon: Award,
      roles: ['super_admin', 'school_admin', 'principal', 'teacher', 'student', 'parent']
    },
    {
      id: 'announcements',
      label: 'Notice Board',
      icon: Bell,
      roles: ['super_admin', 'school_admin', 'principal', 'teacher', 'accountant', 'receptionist', 'student', 'parent']
    },
    {
      id: 'voice_ai',
      label: 'AI & Voice Dictation',
      icon: Sparkles,
      roles: ['super_admin', 'school_admin', 'principal', 'teacher', 'accountant']
    }
  ];

  const filteredNav = navItems.filter(item => item.roles.includes(currentRole));

  const roleBadgeColors: Record<string, string> = {
    super_admin: 'bg-rose-100 text-rose-700 border-rose-200',
    school_admin: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    principal: 'bg-purple-100 text-purple-700 border-purple-200',
    teacher: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    accountant: 'bg-amber-100 text-amber-700 border-amber-200',
    receptionist: 'bg-cyan-100 text-cyan-700 border-cyan-200',
    student: 'bg-blue-100 text-blue-700 border-blue-200',
    parent: 'bg-violet-100 text-violet-700 border-violet-200'
  };

  const roleFormatted: Record<string, string> = {
    super_admin: 'Super Admin',
    school_admin: 'School Admin',
    principal: 'Principal',
    teacher: 'Teacher',
    accountant: 'Chief Accountant',
    receptionist: 'Receptionist',
    student: 'Student',
    parent: 'Parent / Guardian'
  };

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-screen shrink-0 sticky top-0 select-none">
      {/* School Brand */}
      <div className="p-5 border-b border-slate-100 flex items-center space-x-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-200">
          <School className="w-6 h-6" />
        </div>
        <div>
          <h1 className="font-extrabold text-slate-800 tracking-tight text-base flex items-center gap-1.5">
            EduPulse <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 bg-indigo-50 text-indigo-600 rounded">SMS</span>
          </h1>
          <p className="text-xs text-slate-400 font-medium">Apex Academy 2026-27</p>
        </div>
      </div>

      {/* Role Banner / Badge */}
      <div className="px-4 py-3 bg-slate-50 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Current Role</span>
          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${roleBadgeColors[currentRole] || 'bg-slate-100 text-slate-700'}`}>
            {roleFormatted[currentRole] || currentRole}
          </span>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {filteredNav.map(item => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-indigo-600'}`} />
                <span>{item.label}</span>
              </div>
              {isActive && <ChevronRight className="w-4 h-4 text-white/80" />}
            </button>
          );
        })}
      </nav>

      {/* User Card */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/50">
        <div className="flex items-center space-x-3 p-2 rounded-xl bg-white border border-slate-200/80 shadow-xs">
          <img
            src={currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=128&q=80'}
            alt={currentUser?.name}
            className="w-9 h-9 rounded-lg object-cover border border-slate-200 shrink-0"
          />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-slate-800 truncate">{currentUser?.name}</p>
            <p className="text-[11px] text-slate-400 truncate">{currentUser?.email}</p>
          </div>
        </div>
      </div>
    </aside>
  );
};
