import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.js';
import { Sidebar } from './components/layout/Sidebar.js';
import { Header } from './components/layout/Header.js';
import { AdminDashboard } from './components/dashboard/AdminDashboard.js';
import { TeacherDashboard } from './components/dashboard/TeacherDashboard.js';
import { StudentDashboard } from './components/dashboard/StudentDashboard.js';
import { ParentDashboard } from './components/dashboard/ParentDashboard.js';
import { StudentList } from './components/students/StudentList.js';
import { TeacherList } from './components/teachers/TeacherList.js';
import { ClassesView } from './components/academics/ClassesView.js';
import { AttendanceView } from './components/attendance/AttendanceView.js';
import { FeesView } from './components/fees/FeesView.js';
import { ExamsView } from './components/exams/ExamsView.js';
import { AnnouncementsView } from './components/announcements/AnnouncementsView.js';
import { VoiceAiHub } from './components/ai/VoiceAiHub.js';
import { AudioTranscriberModal } from './components/common/AudioTranscriberModal.js';
import { StudentIdCardModal } from './components/students/StudentIdCardModal.js';
import { StudentLeavingCertModal } from './components/students/StudentLeavingCertModal.js';
import { StudentFormModal } from './components/students/StudentFormModal.js';
import { LoginModal } from './components/auth/LoginModal.js';
import { ForgotPasswordModal } from './components/auth/ForgotPasswordModal.js';
import { ChangePasswordModal } from './components/auth/ChangePasswordModal.js';
import { api } from './services/api.js';
import type {
  Student,
  Teacher,
  ClassGrade,
  FeeInvoice,
  Exam,
  Announcement,
  LeaveApplication,
  DashboardStats,
  ExamResult
} from './types/index.js';

function MainAppContent() {
  const {
    currentRole,
    currentUser,
    isAuthenticated,
    isAuthModalOpen,
    openAuthModal,
    closeAuthModal,
    isChangePasswordOpen,
    closeChangePasswordModal
  } = useAuth();

  const [currentTab, setCurrentTab] = useState('dashboard');
  const [globalSearch, setGlobalSearch] = useState('');
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);

  // App Data State
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [classes, setClasses] = useState<ClassGrade[]>([]);
  const [invoices, setInvoices] = useState<FeeInvoice[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [leaves, setLeaves] = useState<LeaveApplication[]>([]);
  const [loading, setLoading] = useState(true);

  // Global modals
  const [previewIdCardStudent, setPreviewIdCardStudent] = useState<Student | null>(null);
  const [previewCertStudent, setPreviewCertStudent] = useState<Student | null>(null);
  const [isNewStudentOpen, setIsNewStudentOpen] = useState(false);

  const loadAllData = async () => {
    try {
      const [
        dashStats,
        studentList,
        teacherList,
        classList,
        invoiceList,
        examList,
        ancList,
        leaveList
      ] = await Promise.all([
        api.getDashboardStats(),
        api.getStudents(),
        api.getTeachers(),
        api.getClasses(),
        api.getInvoices(),
        api.getExams(),
        api.getAnnouncements(),
        api.getLeaves()
      ]);

      setStats(dashStats);
      setStudents(studentList);
      setTeachers(teacherList);
      setClasses(classList);
      setInvoices(invoiceList);
      setExams(examList);
      setAnnouncements(ancList);
      setLeaves(leaveList);
    } catch (err) {
      console.error('Error fetching institutional records:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, [currentRole]);

  if (loading || !stats) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
        <h2 className="text-base font-bold text-slate-800">EduPulse SMS Initializing...</h2>
        <p className="text-xs text-slate-400 mt-1">Connecting institutional database & AI models</p>
      </div>
    );
  }

  // Dashboard role selector renderer
  const renderDashboard = () => {
    if (currentRole === 'teacher') {
      return (
        <TeacherDashboard
          onNavigateTab={tab => setCurrentTab(tab)}
          onOpenVoiceModal={() => setIsVoiceModalOpen(true)}
        />
      );
    }
    if (currentRole === 'student') {
      return (
        <StudentDashboard
          onNavigateTab={tab => setCurrentTab(tab)}
          onOpenIdCard={s => setPreviewIdCardStudent(s)}
          onOpenReportCard={() => setCurrentTab('exams')}
        />
      );
    }
    if (currentRole === 'parent') {
      return (
        <ParentDashboard
          onNavigateTab={tab => setCurrentTab(tab)}
          onOpenReportCard={() => setCurrentTab('exams')}
        />
      );
    }
    // Default Admin/Principal/Accountant/Receptionist Dashboard
    return (
      <AdminDashboard
        stats={stats}
        onNavigateTab={tab => setCurrentTab(tab)}
        onQuickAction={action => {
          if (action === 'new_student') setIsNewStudentOpen(true);
        }}
      />
    );
  };

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Sidebar */}
      <Sidebar currentTab={currentTab} onSelectTab={tab => setCurrentTab(tab)} />

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          onOpenVoiceModal={() => setIsVoiceModalOpen(true)}
          searchQuery={globalSearch}
          onSearchChange={val => setGlobalSearch(val)}
          onNavigateTab={tab => setCurrentTab(tab)}
        />

        <main className="flex-1 p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {currentTab === 'dashboard' && renderDashboard()}

          {currentTab === 'students' && (
            <StudentList
              students={students}
              classes={classes}
              onRefresh={loadAllData}
            />
          )}

          {currentTab === 'teachers' && (
            <TeacherList
              teachers={teachers}
              leaves={leaves}
              onRefresh={loadAllData}
            />
          )}

          {currentTab === 'academics' && (
            <ClassesView
              classes={classes}
              students={students}
            />
          )}

          {currentTab === 'attendance' && (
            <AttendanceView
              students={students}
              teachers={teachers}
              classes={classes}
              onRefresh={loadAllData}
            />
          )}

          {currentTab === 'fees' && (
            <FeesView
              invoices={invoices}
              students={students}
              classes={classes}
              onRefresh={loadAllData}
            />
          )}

          {currentTab === 'exams' && (
            <ExamsView
              exams={exams}
              students={students}
              classes={classes}
              onRefresh={loadAllData}
              onOpenVoiceModal={() => setIsVoiceModalOpen(true)}
            />
          )}

          {currentTab === 'announcements' && (
            <AnnouncementsView
              announcements={announcements}
              onRefresh={loadAllData}
            />
          )}

          {currentTab === 'voice_ai' && (
            <VoiceAiHub
              students={students}
              classes={classes}
              onOpenVoiceModal={() => setIsVoiceModalOpen(true)}
            />
          )}
        </main>
      </div>

      {/* Audio Transcriber Modal with gemini-3.5-transcribe */}
      <AudioTranscriberModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        onInsertText={text => {
          alert(`Dictation transcribed successfully:\n\n"${text}"`);
        }}
      />

      {/* Student ID Card Quick View */}
      {previewIdCardStudent && (
        <StudentIdCardModal
          isOpen={!!previewIdCardStudent}
          onClose={() => setPreviewIdCardStudent(null)}
          student={previewIdCardStudent}
        />
      )}

      {/* Student Leaving Certificate Quick View */}
      {previewCertStudent && (
        <StudentLeavingCertModal
          isOpen={!!previewCertStudent}
          onClose={() => setPreviewCertStudent(null)}
          student={previewCertStudent}
        />
      )}

      {/* New Student Registration Modal */}
      <StudentFormModal
        isOpen={isNewStudentOpen}
        onClose={() => setIsNewStudentOpen(false)}
        onSaved={() => loadAllData()}
        classes={classes}
      />

      {/* Authentication Login Modal */}
      <LoginModal
        isOpen={isAuthModalOpen || !isAuthenticated}
        onClose={isAuthenticated ? closeAuthModal : undefined}
        onOpenForgotPassword={() => {
          closeAuthModal();
          setIsForgotModalOpen(true);
        }}
      />

      {/* Forgot / Reset Password Modal */}
      <ForgotPasswordModal
        isOpen={isForgotModalOpen}
        onClose={() => setIsForgotModalOpen(false)}
        onBackToLogin={() => {
          setIsForgotModalOpen(false);
          openAuthModal();
        }}
      />

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={isChangePasswordOpen}
        onClose={closeChangePasswordModal}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainAppContent />
    </AuthProvider>
  );
}
