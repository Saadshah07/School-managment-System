export type UserRole =
  | 'super_admin'
  | 'school_admin'
  | 'principal'
  | 'teacher'
  | 'accountant'
  | 'receptionist'
  | 'student'
  | 'parent';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  phone?: string;
  linkedStudentId?: string;
  linkedTeacherId?: string;
  passwordHash?: string;
  salt?: string;
  defaultPasswordHint?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface PasswordResetResponse {
  success: boolean;
  message: string;
  demoResetCode?: string;
}

export interface Student {
  id: string;
  admissionNo: string;
  fullName: string;
  photo: string;
  dob: string;
  gender: 'Male' | 'Female' | 'Other';
  bFormOrId: string;
  contactNumber: string;
  email: string;
  homeAddress: string;
  parentName: string;
  parentRelation: string;
  parentContact: string;
  parentEmail: string;
  parentOccupation?: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelation: string;
  admissionDate: string;
  classId: string;
  sectionId: string;
  className: string;
  sectionName: string;
  rollNumber: string;
  previousSchool?: string;
  medicalNotes?: string;
  isMedicalRestricted?: boolean;
  status: 'Active' | 'Inactive' | 'Graduated' | 'Transferred';
  bloodGroup?: string;
  discountCategory?: string;
  discountPercent?: number;
}

export interface Teacher {
  id: string;
  employeeId: string;
  fullName: string;
  photo: string;
  gender: 'Male' | 'Female' | 'Other';
  email: string;
  phone: string;
  qualification: string;
  specialization: string;
  joiningDate: string;
  address: string;
  status: 'Active' | 'On Leave' | 'Inactive';
  salary: {
    basic: number;
    allowances: number;
    deductions: number;
    net: number;
    bankAccount?: string;
  };
  assignedClasses: {
    classId: string;
    className: string;
    sectionId: string;
    sectionName: string;
    subject: string;
  }[];
  attendancePercentage?: number;
}

export interface SubjectItem {
  id: string;
  code: string;
  name: string;
  creditHours: number;
  teacherId?: string;
  teacherName?: string;
}

export interface SectionItem {
  id: string;
  name: string;
  room: string;
  capacity: number;
  classTeacherId?: string;
  classTeacherName?: string;
}

export interface ClassGrade {
  id: string;
  name: string;
  sections: SectionItem[];
  subjects: SubjectItem[];
}

export interface AttendanceRecord {
  id: string;
  personId: string;
  personType: 'student' | 'teacher';
  personName: string;
  date: string; // YYYY-MM-DD
  classId?: string;
  sectionId?: string;
  status: 'Present' | 'Absent' | 'Late' | 'Leave';
  remarks?: string;
  markedBy: string;
  markedAt: string;
  editAudit?: {
    modifiedBy: string;
    modifiedAt: string;
    prevStatus: string;
    reason?: string;
  }[];
}

export interface FeeItem {
  description: string;
  amount: number;
}

export interface FeePaymentTransaction {
  receiptNo: string;
  date: string;
  amount: number;
  paymentMethod: 'Cash' | 'Bank Transfer' | 'Cheque' | 'Online';
  transactionRef?: string;
  recordedBy: string;
  remarks?: string;
}

export interface FeeInvoice {
  id: string;
  invoiceNo: string;
  studentId: string;
  studentName: string;
  admissionNo: string;
  classId: string;
  className: string;
  sectionName: string;
  issueDate: string;
  dueDate: string;
  term: string;
  items: FeeItem[];
  subtotal: number;
  discountAmount: number;
  discountReason?: string;
  lateFee: number;
  totalAmount: number;
  paidAmount: number;
  remainingBalance: number;
  status: 'Paid' | 'Unpaid' | 'Partial' | 'Overdue';
  paymentHistory: FeePaymentTransaction[];
}

export interface ExamSubjectSchedule {
  subjectId: string;
  subjectName: string;
  date: string;
  time: string;
  maxMarks: number;
  passingMarks: number;
  room: string;
}

export interface Exam {
  id: string;
  title: string;
  examType: 'Monthly Test' | 'Midterm' | 'Final' | 'Annual' | 'Unit Quiz';
  academicYear: string;
  term: string;
  startDate: string;
  endDate: string;
  classId: string;
  className: string;
  subjects: ExamSubjectSchedule[];
}

export interface StudentSubjectMark {
  subjectId: string;
  subjectName: string;
  marksObtained: number;
  maxMarks: number;
  passingMarks: number;
  grade: string;
}

export interface ExamResult {
  id: string;
  examId: string;
  examTitle: string;
  studentId: string;
  studentName: string;
  admissionNo: string;
  rollNumber: string;
  classId: string;
  sectionId: string;
  className: string;
  sectionName: string;
  marks: StudentSubjectMark[];
  totalObtained: number;
  totalMax: number;
  percentage: number;
  gpa: number;
  overallGrade: string;
  rank?: number;
  passStatus: 'Pass' | 'Fail';
  teacherRemarks?: string;
  principalRemarks?: string;
}

export interface LeaveApplication {
  id: string;
  teacherId: string;
  teacherName: string;
  employeeId: string;
  leaveType: 'Casual' | 'Medical' | 'Maternity' | 'Unpaid';
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  appliedDate: string;
  reviewedBy?: string;
  reviewedAt?: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  targetRole: 'All' | 'Teachers' | 'Students' | 'Parents';
  date: string;
  author: string;
  priority: 'Normal' | 'Important' | 'Urgent';
}

export interface AuditLog {
  id: string;
  action: string;
  performedBy: string;
  role: string;
  timestamp: string;
  details: string;
}

export interface DashboardStats {
  totalStudents: number;
  totalTeachers: number;
  totalClasses: number;
  totalSections: number;
  studentsPresentToday: number;
  studentsAbsentToday: number;
  studentsLateToday: number;
  attendancePercentageToday: number;
  totalFeeCollection: number;
  outstandingFeeBalance: number;
  upcomingExamsCount: number;
  recentAdmissions: Student[];
  recentPayments: FeePaymentTransaction[];
  attendanceTrends: { day: string; present: number; absent: number; rate: number }[];
  monthlyCollection: { month: string; collected: number; target: number }[];
  announcements: Announcement[];
}
