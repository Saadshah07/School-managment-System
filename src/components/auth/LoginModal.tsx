import React, { useState } from 'react';
import {
  School,
  Lock,
  Mail,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  X,
  KeyRound,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import type { UserRole } from '../../types/index.js';

interface LoginModalProps {
  isOpen: boolean;
  onClose?: () => void;
  onOpenForgotPassword: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onOpenForgotPassword
}) => {
  const { login, demoLogin, allUsers, isAuthenticated, currentUser } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password) {
      setError('Please provide both institutional email and password.');
      return;
    }

    setIsSubmitting(true);
    try {
      await login(email, password);
      if (onClose) onClose();
    } catch (err: any) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoSelect = async (role: UserRole) => {
    setError('');
    const target = allUsers.find(u => u.role === role);
    if (target) {
      setEmail(target.email);
      setPassword('Apex2026!');
      setIsSubmitting(true);
      try {
        await demoLogin(role);
        if (onClose) onClose();
      } catch (err: any) {
        setError(err.message || 'Demo login failed');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const rolesCatalog: { role: UserRole; label: string; desc: string; email: string; color: string }[] = [
    { role: 'super_admin', label: 'Super Admin', desc: 'Full institutional governance', email: 'superadmin@edupulse.edu', color: 'bg-rose-500' },
    { role: 'school_admin', label: 'School Admin', desc: 'Student enrollment & records', email: 'admin@edupulse.edu', color: 'bg-indigo-500' },
    { role: 'principal', label: 'Principal', desc: 'Curriculum & faculty oversight', email: 'principal@edupulse.edu', color: 'bg-purple-500' },
    { role: 'teacher', label: 'Teacher', desc: 'Attendance, grades & classes', email: 'sarah.jenkins@edupulse.edu', color: 'bg-emerald-500' },
    { role: 'accountant', label: 'Accountant', desc: 'Tuition fees & fiscal ledgers', email: 'accounts@edupulse.edu', color: 'bg-amber-500' },
    { role: 'receptionist', label: 'Receptionist', desc: 'Front-desk & admissions', email: 'frontdesk@edupulse.edu', color: 'bg-cyan-500' },
    { role: 'student', label: 'Student', desc: 'Self grades & schedule', email: 'liam.vance@student.edupulse.edu', color: 'bg-blue-500' },
    { role: 'parent', label: 'Parent / Guardian', desc: 'Child monitoring & fee dues', email: 'robert.vance@gmail.com', color: 'bg-violet-500' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-md p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full overflow-hidden border border-slate-200 flex flex-col md:flex-row my-auto">
        {/* Left Side: Brand & Quick Demo Roles */}
        <div className="md:w-5/12 bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-900 p-8 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -top-12 -left-12 w-48 h-48 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />

          <div>
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-11 h-11 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-white border border-white/20 shadow-md">
                <School className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-black tracking-tight">EduPulse SMS</h2>
                <p className="text-xs text-indigo-200">Apex Academy Portal</p>
              </div>
            </div>

            <div className="space-y-1 mb-6">
              <h3 className="text-lg font-extrabold text-white">Institutional Sign In</h3>
              <p className="text-xs text-indigo-200 leading-relaxed">
                Secure credentials authorization for faculty, staff, parents, and students.
              </p>
            </div>

            {/* Quick Demo Accounts Selection */}
            <div className="space-y-2">
              <p className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5" />
                1-Click Role Login:
              </p>
              <div className="max-h-56 overflow-y-auto pr-1 space-y-1.5 text-xs">
                {rolesCatalog.map(item => (
                  <button
                    key={item.role}
                    type="button"
                    onClick={() => handleDemoSelect(item.role)}
                    className="w-full text-left p-2 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 transition-all flex items-center justify-between group cursor-pointer"
                  >
                    <div className="flex items-center space-x-2.5 min-w-0">
                      <span className={`w-2.5 h-2.5 rounded-full ${item.color} shrink-0`} />
                      <div className="truncate">
                        <p className="font-bold text-white text-[11px] group-hover:text-indigo-200 transition-colors">
                          {item.label}
                        </p>
                        <p className="text-[10px] text-indigo-300 truncate font-mono">{item.email}</p>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-white/50 group-hover:text-white shrink-0 ml-1" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-white/10 text-[11px] text-indigo-300 flex items-center justify-between font-mono">
            <span>Default Pass: <strong>Apex2026!</strong></span>
            <span className="flex items-center gap-1 text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" /> PBKDF2
            </span>
          </div>
        </div>

        {/* Right Side: Standard Login Form */}
        <div className="md:w-7/12 p-8 flex flex-col justify-between relative bg-white">
          {onClose && (
            <button
              onClick={onClose}
              className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          <div>
            <div className="mb-6">
              <h3 className="text-xl font-black text-slate-900 tracking-tight">Welcome Back</h3>
              <p className="text-xs text-slate-400 mt-1">
                Enter your institutional email address and credentials to access your dashboard.
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2.5 text-rose-700 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">Institutional Email or Username</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="e.g. superadmin@edupulse.edu"
                    className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 font-medium text-slate-800"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-semibold text-slate-700">Password</label>
                  <button
                    type="button"
                    onClick={onOpenForgotPassword}
                    className="text-indigo-600 hover:text-indigo-800 font-bold cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 font-mono text-slate-800"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-slate-600 font-medium">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={e => setRememberMe(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 rounded border-slate-300"
                  />
                  <span>Remember session on this device</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md shadow-indigo-200 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
              >
                <KeyRound className="w-4 h-4" />
                <span>{isSubmitting ? 'Authenticating...' : 'Sign In to Campus'}</span>
              </button>
            </form>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span>Apex Academy Security Policy</span>
            <span>All sessions encrypted</span>
          </div>
        </div>
      </div>
    </div>
  );
};
