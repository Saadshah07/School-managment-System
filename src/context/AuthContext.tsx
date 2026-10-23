import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, UserRole, PasswordResetResponse } from '../types/index.js';
import { api, setApiAuth, getStoredToken } from '../services/api.js';

interface AuthContextType {
  currentUser: User | null;
  allUsers: User[];
  currentRole: UserRole;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  demoLogin: (role: UserRole) => Promise<void>;
  switchRole: (role: UserRole) => void;
  forgotPassword: (email: string) => Promise<PasswordResetResponse>;
  resetPassword: (email: string, code: string, newPass: string) => Promise<void>;
  changePassword: (oldPass: string, newPass: string) => Promise<void>;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  isChangePasswordOpen: boolean;
  openChangePasswordModal: () => void;
  closeChangePasswordModal: () => void;
  canManageStudents: boolean;
  canManageTeachers: boolean;
  canViewSalaries: boolean;
  canManageFees: boolean;
  canMarkAttendance: boolean;
  canManageExams: boolean;
  canViewAuditLogs: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(getStoredToken());
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

  useEffect(() => {
    async function initAuth() {
      try {
        const users = await api.getUsers();
        setAllUsers(users);

        const storedToken = getStoredToken();
        if (storedToken) {
          try {
            const me = await api.getCurrentUser();
            setCurrentUser(me);
            setToken(storedToken);
            setApiAuth(me.role, me.id, storedToken);
          } catch (err) {
            console.warn('Session expired or invalid token:', err);
            api.logout();
            const defaultUser = users.find(u => u.role === 'super_admin') || users[0];
            setCurrentUser(defaultUser);
            setToken('edupulse_demo_super_admin');
            setApiAuth(defaultUser.role, defaultUser.id, 'edupulse_demo_super_admin');
          }
        } else {
          // Default authenticated session with Super Admin
          const defaultUser = users.find(u => u.role === 'super_admin') || users[0];
          setCurrentUser(defaultUser);
          setToken('edupulse_demo_super_admin');
          setApiAuth(defaultUser.role, defaultUser.id, 'edupulse_demo_super_admin');
        }
      } catch (err) {
        console.error('Failed to load users:', err);
      } finally {
        setIsLoading(false);
      }
    }
    initAuth();
  }, []);

  const login = async (email: string, pass: string) => {
    const res = await api.login(email, pass);
    setCurrentUser(res.user);
    setToken(res.token);
    setApiAuth(res.user.role, res.user.id, res.token);
    setIsAuthModalOpen(false);
  };

  const demoLogin = async (role: UserRole) => {
    const targetUser = allUsers.find(u => u.role === role);
    if (!targetUser) return;
    try {
      const res = await api.login(targetUser.email, 'Apex2026!');
      setCurrentUser(res.user);
      setToken(res.token);
      setApiAuth(res.user.role, res.user.id, res.token);
      setIsAuthModalOpen(false);
    } catch {
      switchRole(role);
      setIsAuthModalOpen(false);
    }
  };

  const switchRole = (role: UserRole) => {
    const userForRole = allUsers.find(u => u.role === role);
    if (userForRole) {
      setCurrentUser(userForRole);
      setApiAuth(userForRole.role, userForRole.id, token || 'edupulse_demo_super_admin');
    }
  };

  const logout = async () => {
    await api.logout();
    setToken(null);
    setCurrentUser(null);
    setIsAuthModalOpen(true);
  };

  const forgotPassword = async (email: string) => {
    return api.forgotPassword(email);
  };

  const resetPassword = async (email: string, code: string, newPass: string) => {
    await api.resetPassword(email, code, newPass);
  };

  const changePassword = async (oldPass: string, newPass: string) => {
    await api.changePassword(oldPass, newPass);
    setIsChangePasswordOpen(false);
  };

  const role = currentUser?.role || 'super_admin';

  const canManageStudents = ['super_admin', 'school_admin', 'principal', 'receptionist'].includes(role);
  const canManageTeachers = ['super_admin', 'school_admin', 'principal'].includes(role);
  const canViewSalaries = ['super_admin', 'school_admin', 'principal', 'accountant'].includes(role);
  const canManageFees = ['super_admin', 'school_admin', 'accountant'].includes(role);
  const canMarkAttendance = ['super_admin', 'school_admin', 'principal', 'teacher'].includes(role);
  const canManageExams = ['super_admin', 'school_admin', 'principal', 'teacher'].includes(role);
  const canViewAuditLogs = ['super_admin', 'school_admin', 'principal'].includes(role);

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        allUsers,
        currentRole: role,
        token,
        isAuthenticated: !!currentUser && !!token,
        isLoading,
        login,
        logout,
        demoLogin,
        switchRole,
        forgotPassword,
        resetPassword,
        changePassword,
        isAuthModalOpen,
        openAuthModal: () => setIsAuthModalOpen(true),
        closeAuthModal: () => setIsAuthModalOpen(false),
        isChangePasswordOpen,
        openChangePasswordModal: () => setIsChangePasswordOpen(true),
        closeChangePasswordModal: () => setIsChangePasswordOpen(false),
        canManageStudents,
        canManageTeachers,
        canViewSalaries,
        canManageFees,
        canMarkAttendance,
        canManageExams,
        canViewAuditLogs
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
