import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { db } from './server/db.js';
import {
  transcribeAudio,
  generateStudentRemarks,
  analyzeClassPerformance,
  generateParentNotice
} from './server/gemini.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Body parser with 50mb limit for audio base64 uploads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Authentication Middleware
app.use((req, res, next) => {
  const authHeader = req.headers['authorization'] || (req.headers['x-auth-token'] as string);
  if (authHeader) {
    const session = db.validateSession(authHeader);
    if (session) {
      req.userRole = session.role;
      req.userId = session.userId;
      req.userEmail = session.email;
      return next();
    }
  }

  // Fallback to role header or default demo user
  const roleHeader = req.headers['x-user-role'] as string;
  const userHeader = req.headers['x-user-id'] as string;
  req.userRole = roleHeader || 'super_admin';
  req.userId = userHeader || 'usr_super_admin';
  next();
});

declare global {
  namespace Express {
    interface Request {
      userRole?: string;
      userId?: string;
      userEmail?: string;
    }
  }
}

// ================= API ROUTES =================

// Auth & Users
app.post('/api/auth/login', (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }
    const result = db.login(email, password);
    res.json(result);
  } catch (err: any) {
    res.status(401).json({ error: err.message || 'Authentication failed.' });
  }
});

app.post('/api/auth/logout', (req, res) => {
  const authHeader = req.headers['authorization'] || (req.headers['x-auth-token'] as string);
  if (authHeader) {
    db.logout(authHeader);
  }
  res.json({ success: true, message: 'Logged out successfully.' });
});

app.post('/api/auth/forgot-password', (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email address is required.' });
    }
    const result = db.requestPasswordReset(email);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to request password reset.' });
  }
});

app.post('/api/auth/reset-password', (req, res) => {
  try {
    const { email, code, newPassword } = req.body;
    if (!email || !code || !newPassword) {
      return res.status(400).json({ error: 'Email, verification code, and new password are required.' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters.' });
    }
    db.resetPassword(email, code, newPassword);
    res.json({ success: true, message: 'Password has been successfully updated.' });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Password reset failed.' });
  }
});

app.post('/api/auth/change-password', (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!req.userId) {
      return res.status(401).json({ error: 'Unauthorized.' });
    }
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required.' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters.' });
    }
    db.changePassword(req.userId, oldPassword, newPassword);
    res.json({ success: true, message: 'Password updated successfully.' });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to change password.' });
  }
});

app.get('/api/auth/users', (req, res) => {
  // Return sanitized users (without passwordHash and salt)
  const users = db.getUsers().map(u => {
    const { passwordHash, salt, ...safe } = u;
    return safe;
  });
  res.json(users);
});

app.get('/api/auth/me', (req, res) => {
  const users = db.getUsers();
  const current = users.find(u => u.id === req.userId || u.role === req.userRole) || users[0];
  const { passwordHash, salt, ...safeUser } = current;
  res.json(safeUser);
});

// Dashboard Stats
app.get('/api/dashboard/stats', (req, res) => {
  try {
    const stats = db.getDashboardStats();
    res.json(stats);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Students
app.get('/api/students', (req, res) => {
  try {
    let list = db.getStudents();
    const { classId, sectionId, status, search } = req.query;

    if (classId) {
      list = list.filter(s => s.classId === classId);
    }
    if (sectionId) {
      list = list.filter(s => s.sectionId === sectionId);
    }
    if (status) {
      list = list.filter(s => s.status === status);
    }
    if (search && typeof search === 'string') {
      const q = search.toLowerCase();
      list = list.filter(s =>
        s.fullName.toLowerCase().includes(q) ||
        s.admissionNo.toLowerCase().includes(q) ||
        s.contactNumber.includes(q) ||
        s.parentName.toLowerCase().includes(q)
      );
    }

    // Role-based filtering: Parents and Students can only see their own profile
    if (req.userRole === 'student') {
      const users = db.getUsers();
      const me = users.find(u => u.id === req.userId || u.role === 'student');
      if (me && me.linkedStudentId) {
        list = list.filter(s => s.id === me.linkedStudentId);
      }
    } else if (req.userRole === 'parent') {
      const users = db.getUsers();
      const me = users.find(u => u.id === req.userId || u.role === 'parent');
      if (me && me.linkedStudentId) {
        list = list.filter(s => s.id === me.linkedStudentId);
      }
    }

    // Role protection on sensitive medical notes
    const sanitized = list.map(student => {
      if (student.isMedicalRestricted && !['super_admin', 'school_admin', 'principal', 'receptionist'].includes(req.userRole || '')) {
        return {
          ...student,
          medicalNotes: 'RESTRICTED: Medical disclosure requires administrative authorization.'
        };
      }
      return student;
    });

    res.json(sanitized);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/students/:id', (req, res) => {
  try {
    const student = db.getStudents().find(s => s.id === req.params.id);
    if (!student) return res.status(404).json({ error: 'Student not found.' });

    if (student.isMedicalRestricted && !['super_admin', 'school_admin', 'principal', 'receptionist'].includes(req.userRole || '')) {
      return res.json({
        ...student,
        medicalNotes: 'RESTRICTED: Medical disclosure requires administrative authorization.'
      });
    }

    res.json(student);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/students', (req, res) => {
  try {
    if (!['super_admin', 'school_admin', 'principal', 'receptionist'].includes(req.userRole || '')) {
      return res.status(403).json({ error: 'Unauthorized to register new students.' });
    }
    const student = db.addStudent(req.body);
    db.logAction('STUDENT_ADMISSION', req.userId || 'admin', req.userRole || 'admin', `Admitted student ${student.fullName} (${student.admissionNo}) into ${student.className}`);
    res.status(201).json(student);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/students/:id', (req, res) => {
  try {
    if (!['super_admin', 'school_admin', 'principal', 'receptionist'].includes(req.userRole || '')) {
      return res.status(403).json({ error: 'Unauthorized to modify student records.' });
    }
    const updated = db.updateStudent(req.params.id, req.body);
    db.logAction('STUDENT_RECORD_UPDATED', req.userId || 'admin', req.userRole || 'admin', `Updated details for ${updated.fullName} (${updated.admissionNo})`);
    res.json(updated);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/api/students/:id', (req, res) => {
  try {
    if (!['super_admin', 'school_admin'].includes(req.userRole || '')) {
      return res.status(403).json({ error: 'Only administrators can delete student records.' });
    }
    const target = db.getStudents().find(s => s.id === req.params.id);
    const success = db.deleteStudent(req.params.id);
    if (success && target) {
      db.logAction('STUDENT_EXPELLED_DELETED', req.userId || 'admin', req.userRole || 'admin', `Deleted record for student ${target.fullName} (${target.admissionNo})`);
    }
    res.json({ success });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/students/:id/promote', (req, res) => {
  try {
    if (!['super_admin', 'school_admin', 'principal'].includes(req.userRole || '')) {
      return res.status(403).json({ error: 'Only administrative authority can promote students.' });
    }
    const { targetClassId, targetClassName, targetSectionId, targetSectionName } = req.body;
    const student = db.updateStudent(req.params.id, {
      classId: targetClassId,
      className: targetClassName,
      sectionId: targetSectionId,
      sectionName: targetSectionName
    });
    db.logAction('STUDENT_PROMOTED', req.userId || 'admin', req.userRole || 'admin', `Promoted ${student.fullName} to ${targetClassName} (${targetSectionName})`);
    res.json(student);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Teachers & Staff
app.get('/api/teachers', (req, res) => {
  try {
    const list = db.getTeachers();
    // Role protection on salary details: Only super_admin, school_admin, principal, and accountant can view
    const isAuthorizedForSalary = ['super_admin', 'school_admin', 'principal', 'accountant'].includes(req.userRole || '');

    const sanitized = list.map(tch => {
      if (!isAuthorizedForSalary) {
        return {
          ...tch,
          salary: {
            basic: 0,
            allowances: 0,
            deductions: 0,
            net: 0,
            bankAccount: 'CONFIDENTIAL'
          }
        };
      }
      return tch;
    });

    res.json(sanitized);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/teachers', (req, res) => {
  try {
    if (!['super_admin', 'school_admin', 'principal'].includes(req.userRole || '')) {
      return res.status(403).json({ error: 'Unauthorized to recruit faculty.' });
    }
    const teacher = db.addTeacher(req.body);
    db.logAction('FACULTY_JOINED', req.userId || 'admin', req.userRole || 'admin', `Added faculty ${teacher.fullName} (${teacher.employeeId})`);
    res.status(201).json(teacher);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/teachers/:id', (req, res) => {
  try {
    if (!['super_admin', 'school_admin', 'principal'].includes(req.userRole || '')) {
      return res.status(403).json({ error: 'Unauthorized to edit faculty records.' });
    }
    const updated = db.updateTeacher(req.params.id, req.body);
    db.logAction('FACULTY_UPDATED', req.userId || 'admin', req.userRole || 'admin', `Updated faculty ${updated.fullName} (${updated.employeeId})`);
    res.json(updated);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Classes & Sections
app.get('/api/classes', (req, res) => {
  res.json(db.getClasses());
});

// Attendance
app.get('/api/attendance', (req, res) => {
  try {
    const { date, classId, sectionId, personId } = req.query;
    let list = db.getAttendance();

    if (date) list = list.filter(a => a.date === date);
    if (classId) list = list.filter(a => a.classId === classId);
    if (sectionId) list = list.filter(a => a.sectionId === sectionId);
    if (personId) list = list.filter(a => a.personId === personId);

    res.json(list);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/attendance', (req, res) => {
  try {
    const record = db.recordAttendance(req.body);
    res.status(201).json(record);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/attendance/bulk', (req, res) => {
  try {
    const { records } = req.body;
    if (!Array.isArray(records)) {
      return res.status(400).json({ error: 'Invalid payload: records array required.' });
    }
    const results = db.bulkRecordAttendance(records);
    if (records.length > 0) {
      db.logAction('ATTENDANCE_BULK_RECORDED', req.userId || 'teacher', req.userRole || 'teacher', `Recorded ${results.length} attendance entries for date ${records[0].date}`);
    }
    res.status(201).json(results);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Fees & Invoices
app.get('/api/fees/invoices', (req, res) => {
  try {
    let list = db.getInvoices();
    const { studentId, status, classId } = req.query;

    if (studentId) list = list.filter(i => i.studentId === studentId);
    if (status) list = list.filter(i => i.status === status);
    if (classId) list = list.filter(i => i.classId === classId);

    // Filter for student / parent roles
    if (req.userRole === 'student' || req.userRole === 'parent') {
      const users = db.getUsers();
      const me = users.find(u => u.id === req.userId || u.role === req.userRole);
      if (me && me.linkedStudentId) {
        list = list.filter(i => i.studentId === me.linkedStudentId);
      }
    }

    res.json(list);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/fees/invoices', (req, res) => {
  try {
    if (!['super_admin', 'school_admin', 'accountant'].includes(req.userRole || '')) {
      return res.status(403).json({ error: 'Unauthorized to issue invoices.' });
    }
    const invoice = db.addInvoice(req.body);
    db.logAction('INVOICE_ISSUED', req.userId || 'accountant', req.userRole || 'accountant', `Issued ${invoice.invoiceNo} for ${invoice.studentName} ($${invoice.totalAmount})`);
    res.status(201).json(invoice);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/fees/pay', (req, res) => {
  try {
    const { invoiceId, amount, paymentMethod, transactionRef, remarks } = req.body;
    const recordedBy = req.userRole === 'parent' || req.userRole === 'student' ? 'Online Portal' : 'David Chen, CPA';
    const result = db.recordPayment(invoiceId, {
      amount: Number(amount),
      paymentMethod,
      transactionRef,
      recordedBy,
      remarks
    });
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/fees/receipts', (req, res) => {
  try {
    const invoices = db.getInvoices();
    const receipts: any[] = [];
    invoices.forEach(inv => {
      inv.paymentHistory.forEach(tx => {
        receipts.push({
          ...tx,
          invoiceId: inv.id,
          invoiceNo: inv.invoiceNo,
          studentName: inv.studentName,
          admissionNo: inv.admissionNo,
          className: inv.className,
          sectionName: inv.sectionName
        });
      });
    });
    res.json(receipts);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/fees/defaulters', (req, res) => {
  try {
    const defaulters = db.getInvoices().filter(inv => inv.status === 'Overdue' || (inv.status === 'Partial' && inv.remainingBalance > 0));
    res.json(defaulters);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Examinations & Results
app.get('/api/exams', (req, res) => {
  res.json(db.getExams());
});

app.post('/api/exams', (req, res) => {
  try {
    if (!['super_admin', 'school_admin', 'principal', 'teacher'].includes(req.userRole || '')) {
      return res.status(403).json({ error: 'Unauthorized to schedule exams.' });
    }
    const exam = db.addExam(req.body);
    db.logAction('EXAM_SCHEDULED', req.userId || 'admin', req.userRole || 'admin', `Scheduled exam "${exam.title}" for ${exam.className}`);
    res.status(201).json(exam);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/exams/results', (req, res) => {
  try {
    let list = db.getExamResults();
    const { examId, studentId, classId } = req.query;

    if (examId) list = list.filter(r => r.examId === examId);
    if (studentId) list = list.filter(r => r.studentId === studentId);
    if (classId) list = list.filter(r => r.classId === classId);

    // Parent/Student filter
    if (req.userRole === 'student' || req.userRole === 'parent') {
      const users = db.getUsers();
      const me = users.find(u => u.id === req.userId || u.role === req.userRole);
      if (me && me.linkedStudentId) {
        list = list.filter(r => r.studentId === me.linkedStudentId);
      }
    }

    res.json(list);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/exams/results', (req, res) => {
  try {
    if (!['super_admin', 'school_admin', 'principal', 'teacher'].includes(req.userRole || '')) {
      return res.status(403).json({ error: 'Unauthorized to enter marks.' });
    }
    const result = db.saveExamResult(req.body);
    db.logAction('EXAM_MARKS_SUBMITTED', req.userId || 'teacher', req.userRole || 'teacher', `Submitted assessment marks for student ${result.studentName} (${result.examTitle})`);
    res.status(201).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Leaves
app.get('/api/leaves', (req, res) => {
  res.json(db.getLeaves());
});

app.post('/api/leaves', (req, res) => {
  try {
    const leave = db.submitLeave(req.body);
    res.status(201).json(leave);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/leaves/:id', (req, res) => {
  try {
    if (!['super_admin', 'school_admin', 'principal'].includes(req.userRole || '')) {
      return res.status(403).json({ error: 'Only administrators or principals can review leaves.' });
    }
    const { status } = req.body;
    const updated = db.updateLeaveStatus(req.params.id, status, req.userId || 'Administrator');
    res.json(updated);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Announcements
app.get('/api/announcements', (req, res) => {
  res.json(db.getAnnouncements());
});

app.post('/api/announcements', (req, res) => {
  try {
    if (!['super_admin', 'school_admin', 'principal'].includes(req.userRole || '')) {
      return res.status(403).json({ error: 'Unauthorized to post announcements.' });
    }
    const anc = db.addAnnouncement(req.body);
    db.logAction('ANNOUNCEMENT_POSTED', req.userId || 'admin', req.userRole || 'admin', `Broadcast notice: "${anc.title}"`);
    res.status(201).json(anc);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Audit Logs
app.get('/api/audit-logs', (req, res) => {
  if (!['super_admin', 'school_admin', 'principal'].includes(req.userRole || '')) {
    return res.status(403).json({ error: 'Audit logs restricted to administrators.' });
  }
  res.json(db.getAuditLogs());
});

// ================= GEMINI AI ROUTES =================

// Audio Transcription using gemini-3.5-transcribe
app.post('/api/ai/transcribe', async (req, res) => {
  try {
    const { audioData, mimeType } = req.body;
    if (!audioData) {
      return res.status(400).json({ error: 'audioData base64 string is required.' });
    }
    const transcription = await transcribeAudio(audioData, mimeType);
    res.json({ text: transcription });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Audio transcription failed.' });
  }
});

// AI Report Card Remarks using gemini-3.8-flash
app.post('/api/ai/student-remarks', async (req, res) => {
  try {
    const { studentName, subjectMarks, attendanceRate } = req.body;
    const remarks = await generateStudentRemarks(studentName, subjectMarks || [], attendanceRate || 95);
    res.json({ remarks });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// AI Academic Analysis using gemini-3.8-flash
app.post('/api/ai/analyze-performance', async (req, res) => {
  try {
    const { className, stats } = req.body;
    const analysis = await analyzeClassPerformance(className, stats);
    res.json({ analysis });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// AI Parent Notice using gemini-3.1-flash-lite
app.post('/api/ai/parent-notice', async (req, res) => {
  try {
    const { studentName, parentName, type, details } = req.body;
    const notice = await generateParentNotice(studentName, parentName, type, details);
    res.json({ notice });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ================= VITE DEV / PRODUCTION MIDDLEWARE =================

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`EduPulse SMS Server active on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
});
