import type {
  Student,
  Teacher,
  ClassGrade,
  AttendanceRecord,
  FeeInvoice,
  FeePaymentTransaction,
  Exam,
  ExamResult,
  LeaveApplication,
  Announcement,
  AuditLog,
  User,
  DashboardStats,
  AuthResponse,
  PasswordResetResponse
} from '../types/index.js';

let authToken: string | null = typeof window !== 'undefined' ? localStorage.getItem('edupulse_auth_token') : null;
let currentRole = 'super_admin';
let currentUserId = 'usr_super_admin';

export function setApiAuth(role: string, userId: string, token?: string | null) {
  currentRole = role;
  currentUserId = userId;
  if (token !== undefined) {
    authToken = token;
    if (typeof window !== 'undefined') {
      if (token) localStorage.setItem('edupulse_auth_token', token);
      else localStorage.removeItem('edupulse_auth_token');
    }
  }
}

export function getStoredToken(): string | null {
  return authToken || (typeof window !== 'undefined' ? localStorage.getItem('edupulse_auth_token') : null);
}

function getHeaders() {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-user-role': currentRole,
    'x-user-id': currentUserId,
  };
  const token = getStoredToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export const api = {
  // Auth
  async login(email: string, pass: string): Promise<AuthResponse> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: pass }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Invalid email or password.');
    }
    const data: AuthResponse = await res.json();
    setApiAuth(data.user.role, data.user.id, data.token);
    return data;
  },

  async logout(): Promise<void> {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: getHeaders(),
      });
    } finally {
      setApiAuth('super_admin', 'usr_super_admin', null);
    }
  },

  async forgotPassword(email: string): Promise<PasswordResetResponse> {
    const res = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to request password reset.');
    }
    return res.json();
  },

  async resetPassword(email: string, code: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code, newPassword }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to reset password.');
    }
    return res.json();
  },

  async changePassword(oldPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch('/api/auth/change-password', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ oldPassword, newPassword }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to update password.');
    }
    return res.json();
  },

  async getUsers(): Promise<User[]> {
    const res = await fetch('/api/auth/users', { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch users');
    return res.json();
  },

  async getCurrentUser(): Promise<User> {
    const res = await fetch('/api/auth/me', { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch current user');
    return res.json();
  },

  // Dashboard
  async getDashboardStats(): Promise<DashboardStats> {
    const res = await fetch('/api/dashboard/stats', { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch dashboard stats');
    return res.json();
  },

  // Students
  async getStudents(params?: { classId?: string; sectionId?: string; status?: string; search?: string }): Promise<Student[]> {
    const query = new URLSearchParams(params as any).toString();
    const res = await fetch(`/api/students?${query}`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch students');
    return res.json();
  },

  async getStudentById(id: string): Promise<Student> {
    const res = await fetch(`/api/students/${id}`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch student');
    return res.json();
  },

  async createStudent(student: Partial<Student>): Promise<Student> {
    const res = await fetch('/api/students', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(student),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to create student');
    }
    return res.json();
  },

  async updateStudent(id: string, updates: Partial<Student>): Promise<Student> {
    const res = await fetch(`/api/students/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(updates),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to update student');
    }
    return res.json();
  },

  async deleteStudent(id: string): Promise<boolean> {
    const res = await fetch(`/api/students/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to delete student');
    }
    const data = await res.json();
    return data.success;
  },

  async promoteStudent(id: string, target: { targetClassId: string; targetClassName: string; targetSectionId: string; targetSectionName: string }): Promise<Student> {
    const res = await fetch(`/api/students/${id}/promote`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(target),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to promote student');
    }
    return res.json();
  },

  // Teachers
  async getTeachers(): Promise<Teacher[]> {
    const res = await fetch('/api/teachers', { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch teachers');
    return res.json();
  },

  async createTeacher(teacher: Partial<Teacher>): Promise<Teacher> {
    const res = await fetch('/api/teachers', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(teacher),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to create teacher');
    }
    return res.json();
  },

  async updateTeacher(id: string, updates: Partial<Teacher>): Promise<Teacher> {
    const res = await fetch(`/api/teachers/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(updates),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to update teacher');
    }
    return res.json();
  },

  // Classes
  async getClasses(): Promise<ClassGrade[]> {
    const res = await fetch('/api/classes', { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch classes');
    return res.json();
  },

  // Attendance
  async getAttendance(params?: { date?: string; classId?: string; sectionId?: string; personId?: string }): Promise<AttendanceRecord[]> {
    const query = new URLSearchParams(params as any).toString();
    const res = await fetch(`/api/attendance?${query}`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch attendance');
    return res.json();
  },

  async markAttendance(record: Partial<AttendanceRecord>): Promise<AttendanceRecord> {
    const res = await fetch('/api/attendance', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(record),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to mark attendance');
    }
    return res.json();
  },

  async bulkMarkAttendance(records: Partial<AttendanceRecord>[]): Promise<AttendanceRecord[]> {
    const res = await fetch('/api/attendance/bulk', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ records }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to record bulk attendance');
    }
    return res.json();
  },

  // Fees
  async getInvoices(params?: { studentId?: string; status?: string; classId?: string }): Promise<FeeInvoice[]> {
    const query = new URLSearchParams(params as any).toString();
    const res = await fetch(`/api/fees/invoices?${query}`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch invoices');
    return res.json();
  },

  async createInvoice(invoice: Partial<FeeInvoice>): Promise<FeeInvoice> {
    const res = await fetch('/api/fees/invoices', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(invoice),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to create invoice');
    }
    return res.json();
  },

  async payInvoice(payload: { invoiceId: string; amount: number; paymentMethod: string; transactionRef?: string; remarks?: string }): Promise<{ invoice: FeeInvoice; receipt: FeePaymentTransaction }> {
    const res = await fetch('/api/fees/pay', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Payment failed');
    }
    return res.json();
  },

  async getReceipts(): Promise<any[]> {
    const res = await fetch('/api/fees/receipts', { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch receipts');
    return res.json();
  },

  async getDefaulters(): Promise<FeeInvoice[]> {
    const res = await fetch('/api/fees/defaulters', { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch fee defaulters');
    return res.json();
  },

  // Exams
  async getExams(): Promise<Exam[]> {
    const res = await fetch('/api/exams', { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch exams');
    return res.json();
  },

  async createExam(exam: Partial<Exam>): Promise<Exam> {
    const res = await fetch('/api/exams', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(exam),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to create exam');
    }
    return res.json();
  },

  async getExamResults(params?: { examId?: string; studentId?: string; classId?: string }): Promise<ExamResult[]> {
    const query = new URLSearchParams(params as any).toString();
    const res = await fetch(`/api/exams/results?${query}`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch results');
    return res.json();
  },

  async saveExamResult(result: Partial<ExamResult>): Promise<ExamResult> {
    const res = await fetch('/api/exams/results', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(result),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to save exam marks');
    }
    return res.json();
  },

  // Leaves
  async getLeaves(): Promise<LeaveApplication[]> {
    const res = await fetch('/api/leaves', { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch leaves');
    return res.json();
  },

  async applyLeave(leave: Partial<LeaveApplication>): Promise<LeaveApplication> {
    const res = await fetch('/api/leaves', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(leave),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to apply for leave');
    }
    return res.json();
  },

  async reviewLeave(id: string, status: 'Approved' | 'Rejected'): Promise<LeaveApplication> {
    const res = await fetch(`/api/leaves/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ status }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to update leave');
    }
    return res.json();
  },

  // Announcements
  async getAnnouncements(): Promise<Announcement[]> {
    const res = await fetch('/api/announcements', { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch announcements');
    return res.json();
  },

  async createAnnouncement(anc: Partial<Announcement>): Promise<Announcement> {
    const res = await fetch('/api/announcements', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(anc),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to create announcement');
    }
    return res.json();
  },

  // Audit Logs
  async getAuditLogs(): Promise<AuditLog[]> {
    const res = await fetch('/api/audit-logs', { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch audit logs');
    return res.json();
  },

  // Gemini AI Services
  async transcribeAudio(audioBase64: string, mimeType: string = 'audio/webm'): Promise<string> {
    const res = await fetch('/api/ai/transcribe', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ audioData: audioBase64, mimeType }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Audio transcription failed');
    }
    const data = await res.json();
    return data.text;
  },

  async generateStudentRemarks(studentName: string, subjectMarks: any[], attendanceRate: number): Promise<string> {
    const res = await fetch('/api/ai/student-remarks', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ studentName, subjectMarks, attendanceRate }),
    });
    if (!res.ok) throw new Error('Failed to generate remarks');
    const data = await res.json();
    return data.remarks;
  },

  async analyzeClassPerformance(className: string, stats: any): Promise<string> {
    const res = await fetch('/api/ai/analyze-performance', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ className, stats }),
    });
    if (!res.ok) throw new Error('Failed to analyze performance');
    const data = await res.json();
    return data.analysis;
  },

  async generateParentNotice(studentName: string, parentName: string, type: 'fee_overdue' | 'attendance_warning', details: any): Promise<string> {
    const res = await fetch('/api/ai/parent-notice', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ studentName, parentName, type, details }),
    });
    if (!res.ok) throw new Error('Failed to generate notice');
    const data = await res.json();
    return data.notice;
  }
};
