import React, { useState } from 'react';
import {
  Search,
  Bell,
  Mic,
  Calendar,
  Sparkles,
  ChevronDown,
  UserCheck,
  CheckCircle2,
  Shield,
  Layers
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import type { UserRole } from '../../types/index.js';

interface HeaderProps {
  onOpenVoiceModal: () => void;
  onSearchChange?: (val: string) => void;
  searchQuery?: string;
  onNavigateTab?: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenVoiceModal,
  onSearchChange,
  searchQuery = '',
  onNavigateTab
}) => {
  const { currentRole, switchRole, allUsers, currentUser } = useAuth();
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [notifMenuOpen, setNotifMenuOpen] = useState(false);

  const rolesList: { role: UserRole; label: string; desc: string; color: string }[] = [
    { role: 'super_admin', label: 'Super Admin', desc: 'Full institutional governance & audits', color: 'bg-rose-500' },
    { role: 'school_admin', label: 'School Admin', desc: 'Admissions, records & operations', color: 'bg-indigo-500' },
    { role: 'principal', label: 'Principal', desc: 'Academic oversight, leaves & reports', color: 'bg-purple-500' },
    { role: 'teacher', label: 'Teacher', desc: 'Attendance, marks entry & classes', color: 'bg-emerald-500' },
    { role: 'accountant', label: 'Accountant', desc: 'Fee invoicing, collections & receipts', color: 'bg-amber-500' },
    { role: 'receptionist', label: 'Receptionist', desc: 'Front-desk admissions & inquiries', color: 'bg-cyan-500' },
    { role: 'student', label: 'Student', desc: 'Self grades, attendance & schedule', color: 'bg-blue-500' },
    { role: 'parent', label: 'Parent / Guardian', desc: 'Child progress & fee payments', color: 'bg-violet-500' }
  ];

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Search Bar */}
      <div className="flex items-center space-x-3 w-96">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search students, admission no, faculty..."
            value={searchQuery}
            onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* Right Controls: Academic Year, Voice Dictation, Role Switcher, Notifications */}
      <div className="flex items-center space-x-3">
        {/* Academic Session Tag */}
        <div className="hidden lg:flex items-center space-x-1.5 px-3 py-1 bg-slate-100 rounded-lg text-xs font-semibold text-slate-600 border border-slate-200">
          <Calendar className="w-3.5 h-3.5 text-indigo-600" />
          <span>Fall Term 2026-27</span>
        </div>

        {/* AI Voice Transcribe Quick Button */}
        <button
          onClick={onOpenVoiceModal}
          className="flex items-center space-x-1.5 px-3 py-1.5 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs shadow-indigo-200 transition-all cursor-pointer"
          title="Transcribe speech with gemini-3.5-transcribe"
        >
          <Mic className="w-3.5 h-3.5 text-indigo-100" />
          <span>Voice Dictation</span>
          <span className="text-[10px] bg-white/20 px-1 py-0.2 rounded font-mono">Gemini</span>
        </button>

        {/* Role Switcher Dropdown */}
        <div className="relative">
          <button
            onClick={() => setRoleMenuOpen(!roleMenuOpen)}
            className="flex items-center space-x-2 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 transition-all cursor-pointer"
          >
            <Shield className="w-3.5 h-3.5 text-indigo-600" />
            <span>Switch Role:</span>
            <span className="capitalize text-indigo-600 font-bold">{currentRole.replace('_', ' ')}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {roleMenuOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setRoleMenuOpen(false)} />
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3.5 py-2 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-800">Role-Based Access Control</p>
                  <p className="text-[11px] text-slate-400">Select any role to preview its dashboard & permissions</p>
                </div>
                <div className="max-h-72 overflow-y-auto p-1.5 space-y-0.5">
                  {rolesList.map((item) => {
                    const isSelected = currentRole === item.role;
                    return (
                      <button
                        key={item.role}
                        onClick={() => {
                          switchRole(item.role);
                          setRoleMenuOpen(false);
                        }}
                        className={`w-full flex items-start space-x-2.5 p-2 rounded-xl text-left transition-colors ${
                          isSelected ? 'bg-indigo-50 border border-indigo-100' : 'hover:bg-slate-50'
                        }`}
                      >
                        <span className={`w-2.5 h-2.5 rounded-full mt-1 shrink-0 ${item.color}`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className={`text-xs font-bold ${isSelected ? 'text-indigo-700' : 'text-slate-800'}`}>
                              {item.label}
                            </span>
                            {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />}
                          </div>
                          <p className="text-[10px] text-slate-400 truncate">{item.desc}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Notifications Icon */}
        <div className="relative">
          <button
            onClick={() => setNotifMenuOpen(!notifMenuOpen)}
            className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors relative cursor-pointer"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white"></span>
          </button>

          {notifMenuOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setNotifMenuOpen(false)} />
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 p-3 z-50">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="text-xs font-bold text-slate-800">Campus Alerts</span>
                  <span className="text-[10px] bg-indigo-50 text-indigo-600 font-bold px-1.5 py-0.5 rounded">3 Active</span>
                </div>
                <div className="divide-y divide-slate-100 text-xs">
                  <div className="py-2.5">
                    <p className="font-semibold text-slate-800">Midterm Schedule Released</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">Exams commence November 10. Check examinations tab.</p>
                  </div>
                  <div className="py-2.5">
                    <p className="font-semibold text-slate-800">Daily Attendance Logged</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">95% attendance recorded across senior grades.</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* User Profile & Auth Menu */}
        <UserHeaderMenu />
      </div>
    </header>
  );
};

const UserHeaderMenu: React.FC = () => {
  const { currentUser, currentRole, logout, openAuthModal, openChangePasswordModal } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center space-x-2 pl-2 pr-1.5 py-1 hover:bg-slate-100 rounded-xl transition-all cursor-pointer border border-transparent hover:border-slate-200"
      >
        <img
          src={currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=128&q=80'}
          alt={currentUser?.name}
          className="w-7 h-7 rounded-lg object-cover border border-slate-200"
        />
        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 text-xs">
            <div className="px-4 py-3 border-b border-slate-100">
              <p className="font-bold text-slate-800 truncate">{currentUser?.name}</p>
              <p className="text-[11px] text-slate-400 truncate">{currentUser?.email}</p>
              <div className="mt-2 inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 capitalize border border-indigo-100">
                {currentRole.replace('_', ' ')}
              </div>
            </div>

            <div className="p-1 space-y-0.5">
              <button
                onClick={() => {
                  setOpen(false);
                  openChangePasswordModal();
                }}
                className="w-full flex items-center space-x-2.5 px-3 py-2 text-slate-700 hover:bg-slate-50 hover:text-indigo-600 rounded-xl transition-colors cursor-pointer text-left"
              >
                <span>Change Password</span>
              </button>

              <button
                onClick={() => {
                  setOpen(false);
                  openAuthModal();
                }}
                className="w-full flex items-center space-x-2.5 px-3 py-2 text-slate-700 hover:bg-slate-50 hover:text-indigo-600 rounded-xl transition-colors cursor-pointer text-left"
              >
                <span>Switch Account / Sign In</span>
              </button>

              <button
                onClick={() => {
                  setOpen(false);
                  logout();
                }}
                className="w-full flex items-center space-x-2.5 px-3 py-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer text-left font-semibold"
              >
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

