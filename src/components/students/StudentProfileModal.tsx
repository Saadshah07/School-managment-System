import React, { useState, useEffect } from 'react';
import {
  X,
  CreditCard,
  Award,
  CalendarCheck,
  User,
  ShieldAlert,
  Phone,
  Mail,
  MapPin,
  FileText,
  Printer,
  ChevronRight,
  TrendingUp,
  Clock,
  Sparkles
} from 'lucide-react';
import type { Student, ExamResult, FeeInvoice, AttendanceRecord } from '../../types/index.js';
import { api } from '../../services/api.js';

interface StudentProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student;
  onOpenIdCard: (student: Student) => void;
  onOpenLeavingCert: (student: Student) => void;
  onPromote: (student: Student) => void;
}

export const StudentProfileModal: React.FC<StudentProfileModalProps> = ({
  isOpen,
  onClose,
  student,
  onOpenIdCard,
  onOpenLeavingCert,
  onPromote
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'academics' | 'attendance' | 'fees' | 'guardian'>('overview');
  const [examResults, setExamResults] = useState<ExamResult[]>([]);
  const [invoices, setInvoices] = useState<FeeInvoice[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStudentData() {
      if (!student) return;
      try {
        setLoading(true);
        const [res, inv, att] = await Promise.all([
          api.getExamResults({ studentId: student.id }),
          api.getInvoices({ studentId: student.id }),
          api.getAttendance({ personId: student.id })
        ]);
        setExamResults(res);
        setInvoices(inv);
        setAttendance(att);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadStudentData();
  }, [student, isOpen]);

  if (!isOpen) return null;

  const totalPaid = invoices.reduce((acc, i) => acc + i.paidAmount, 0);
  const totalBalance = invoices.reduce((acc, i) => acc + i.remainingBalance, 0);
  const presentDays = attendance.filter(a => a.status === 'Present' || a.status === 'Late').length;
  const attendanceRate = attendance.length > 0 ? Math.round((presentDays / attendance.length) * 100) : 96;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Header Hero */}
        <div className="bg-gradient-to-r from-indigo-700 via-indigo-800 to-slate-900 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
            <img
              src={student.photo}
              alt={student.fullName}
              className="w-20 h-20 rounded-2xl object-cover ring-4 ring-white/20 shadow-xl shrink-0"
            />
            <div className="space-y-1 text-center sm:text-left flex-1">
              <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 bg-white/10 rounded-full text-[11px] font-mono text-indigo-200">
                <span>{student.admissionNo}</span>
                <span>•</span>
                <span>Roll #{student.rollNumber}</span>
              </div>
              <h2 className="text-2xl font-black">{student.fullName}</h2>
              <p className="text-xs text-indigo-200 font-medium">
                {student.className} • {student.sectionName} • Enrolled: {student.admissionDate}
              </p>
            </div>

            {/* Header Action Buttons */}
            <div className="flex flex-wrap sm:flex-col gap-2 shrink-0">
              <button
                onClick={() => onOpenIdCard(student)}
                className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-white text-indigo-900 rounded-xl text-xs font-bold hover:bg-indigo-50 shadow-sm"
              >
                <FileText className="w-3.5 h-3.5 text-indigo-600" />
                <span>Student ID Card</span>
              </button>
              <button
                onClick={() => onOpenLeavingCert(student)}
                className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-indigo-600/60 hover:bg-indigo-600 text-white rounded-xl text-xs font-semibold border border-indigo-400/30"
              >
                <Printer className="w-3.5 h-3.5 text-indigo-200" />
                <span>Leaving Certificate</span>
              </button>
              <button
                onClick={() => onPromote(student)}
                className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-emerald-600/70 hover:bg-emerald-600 text-white rounded-xl text-xs font-semibold"
              >
                <TrendingUp className="w-3.5 h-3.5 text-emerald-200" />
                <span>Promote Grade</span>
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center space-x-1 mt-6 border-b border-indigo-600/50 pt-2 overflow-x-auto text-xs font-semibold">
            {[
              { id: 'overview', label: 'Overview & Bio' },
              { id: 'academics', label: `Academic Results (${examResults.length})` },
              { id: 'attendance', label: `Attendance (${attendanceRate}%)` },
              { id: 'fees', label: `Fee Ledger ($${totalBalance} Due)` },
              { id: 'guardian', label: 'Guardian & Emergency' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 border-b-2 font-bold transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === tab.id
                    ? 'border-white text-white'
                    : 'border-transparent text-indigo-200 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/70">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Date of Birth</span>
                  <p className="text-sm font-bold text-slate-800 mt-1">{student.dob}</p>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/70">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Gender</span>
                  <p className="text-sm font-bold text-slate-800 mt-1">{student.gender}</p>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/70">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Blood Group</span>
                  <p className="text-sm font-bold text-slate-800 mt-1">{student.bloodGroup || 'N/A'}</p>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/70">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">National ID / B-Form</span>
                  <p className="text-sm font-bold text-slate-800 mt-1 font-mono">{student.bFormOrId}</p>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/70">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Previous School</span>
                  <p className="text-sm font-bold text-slate-800 mt-1">{student.previousSchool || 'Apex Junior'}</p>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/70">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Student Status</span>
                  <p className="text-sm font-bold text-emerald-600 mt-1">{student.status}</p>
                </div>
              </div>

              {/* Medical Notes */}
              <div className="p-4 bg-rose-50/50 rounded-2xl border border-rose-100 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-rose-800 flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4" />
                    Medical History & Allergy Disclosures
                  </span>
                  {student.isMedicalRestricted && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">
                      Restricted Confidential
                    </span>
                  )}
                </div>
                <p className="text-slate-700 leading-relaxed font-medium">
                  {student.medicalNotes || 'No registered chronic ailments or dietary allergies on file.'}
                </p>
              </div>

              {/* Residential Details */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/70">
                <span className="font-bold text-slate-700 flex items-center gap-1.5 mb-2">
                  <MapPin className="w-4 h-4 text-indigo-600" />
                  Residential Address
                </span>
                <p className="text-slate-800 font-medium">{student.homeAddress}</p>
              </div>
            </div>
          )}

          {/* TAB 2: ACADEMICS */}
          {activeTab === 'academics' && (
            <div className="space-y-4">
              {examResults.length > 0 ? (
                examResults.map(res => (
                  <div key={res.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <div>
                        <h4 className="font-bold text-slate-800 text-sm">{res.examTitle}</h4>
                        <p className="text-xs text-slate-500">Overall GPA: {res.gpa} • Grade: {res.overallGrade}</p>
                      </div>
                      <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
                        {res.percentage}% Score ({res.passStatus})
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      {res.marks.map((m, idx) => (
                        <div key={idx} className="p-2.5 bg-white rounded-xl border border-slate-200/80 text-xs">
                          <div className="flex items-center justify-between font-bold text-slate-800">
                            <span>{m.subjectName}</span>
                            <span className="text-indigo-600">{m.grade}</span>
                          </div>
                          <p className="text-slate-500 mt-1">{m.marksObtained} / {m.maxMarks} marks</p>
                        </div>
                      ))}
                    </div>

                    {res.teacherRemarks && (
                      <div className="p-3 bg-indigo-50/60 rounded-xl text-xs text-indigo-900 border border-indigo-100">
                        <span className="font-bold">Teacher Feedback:</span> {res.teacherRemarks}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-xs text-slate-400">No exam results published for this student yet.</div>
              )}
            </div>
          )}

          {/* TAB 3: ATTENDANCE */}
          {activeTab === 'attendance' && (
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-3 gap-4">
                <div className="p-3 bg-emerald-50 rounded-xl text-center border border-emerald-100">
                  <span className="text-emerald-700 font-bold text-lg">{attendanceRate}%</span>
                  <p className="text-emerald-600 text-[11px] font-semibold">Attendance Rate</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-xl text-center border border-blue-100">
                  <span className="text-blue-700 font-bold text-lg">{presentDays}</span>
                  <p className="text-blue-600 text-[11px] font-semibold">Days Present</p>
                </div>
                <div className="p-3 bg-rose-50 rounded-xl text-center border border-rose-100">
                  <span className="text-rose-700 font-bold text-lg">{attendance.filter(a => a.status === 'Absent').length}</span>
                  <p className="text-rose-600 text-[11px] font-semibold">Days Absent</p>
                </div>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase">
                    <tr>
                      <th className="p-2.5">Date</th>
                      <th className="p-2.5">Status</th>
                      <th className="p-2.5">Remarks / Reason</th>
                      <th className="p-2.5">Recorded By</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {attendance.map(a => (
                      <tr key={a.id} className="hover:bg-slate-50/50">
                        <td className="p-2.5 font-medium">{a.date}</td>
                        <td className="p-2.5">
                          <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                            a.status === 'Present' ? 'bg-emerald-50 text-emerald-700' :
                            a.status === 'Late' ? 'bg-amber-50 text-amber-700' : 'bg-rose-50 text-rose-700'
                          }`}>
                            {a.status}
                          </span>
                        </td>
                        <td className="p-2.5 text-slate-500">{a.remarks || 'Regular roll call'}</td>
                        <td className="p-2.5 text-slate-400">{a.markedBy}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: FEES */}
          {activeTab === 'fees' && (
            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-500">Total Billed:</span>
                  <span className="font-bold text-slate-800 ml-1.5">${totalPaid + totalBalance}</span>
                </div>
                <div>
                  <span className="text-emerald-600">Total Paid:</span>
                  <span className="font-bold text-emerald-700 ml-1.5">${totalPaid}</span>
                </div>
                <div>
                  <span className="text-rose-600">Balance Due:</span>
                  <span className="font-bold text-rose-700 ml-1.5">${totalBalance}</span>
                </div>
              </div>

              <div className="space-y-3">
                {invoices.map(inv => (
                  <div key={inv.id} className="p-3.5 bg-white border border-slate-200 rounded-xl flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-800">{inv.invoiceNo} • {inv.term}</p>
                      <p className="text-slate-400 text-[11px]">Due: {inv.dueDate} • Total: ${inv.totalAmount}</p>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                        inv.status === 'Paid' ? 'bg-emerald-50 text-emerald-700' :
                        inv.status === 'Partial' ? 'bg-amber-50 text-amber-700' : 'bg-rose-50 text-rose-700'
                      }`}>
                        {inv.status}
                      </span>
                      <p className="text-slate-500 font-semibold mt-1">Bal: ${inv.remainingBalance}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: GUARDIAN */}
          {activeTab === 'guardian' && (
            <div className="space-y-4 text-xs">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <h4 className="font-bold text-slate-800 text-sm">Primary Parent / Guardian</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <span className="text-slate-400">Name:</span>
                    <p className="font-bold text-slate-800">{student.parentName} ({student.parentRelation})</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Contact Phone:</span>
                    <p className="font-bold text-slate-800 flex items-center gap-1.5 mt-0.5">
                      <Phone className="w-3.5 h-3.5 text-indigo-600" />
                      {student.parentContact}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400">Email Address:</span>
                    <p className="font-bold text-slate-800 flex items-center gap-1.5 mt-0.5">
                      <Mail className="w-3.5 h-3.5 text-indigo-600" />
                      {student.parentEmail || 'Not specified'}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400">Occupation:</span>
                    <p className="font-bold text-slate-800">{student.parentOccupation || 'Professional'}</p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <h4 className="font-bold text-slate-800 text-sm">Emergency Designated Contact</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <span className="text-slate-400">Name & Relation:</span>
                    <p className="font-bold text-slate-800">{student.emergencyContactName} ({student.emergencyContactRelation})</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Emergency Phone:</span>
                    <p className="font-bold text-rose-600 flex items-center gap-1.5 mt-0.5">
                      <Phone className="w-3.5 h-3.5" />
                      {student.emergencyContactPhone}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
