import React, { useState } from 'react';
import {
  Users,
  Plus,
  Search,
  Eye,
  Edit,
  DollarSign,
  Calendar,
  Clock,
  BookOpen,
  Mail,
  Phone,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  FileText
} from 'lucide-react';
import type { Teacher, LeaveApplication } from '../../types/index.js';
import { useAuth } from '../../context/AuthContext.js';
import { api } from '../../services/api.js';

interface TeacherListProps {
  teachers: Teacher[];
  leaves: LeaveApplication[];
  onRefresh: () => void;
}

export const TeacherList: React.FC<TeacherListProps> = ({ teachers, leaves, onRefresh }) => {
  const { canManageTeachers, canViewSalaries, currentRole } = useAuth();
  const [activeTab, setActiveTab] = useState<'directory' | 'leaves'>('directory');
  const [search, setSearch] = useState('');
  const [selectedTeacherForDetail, setSelectedTeacherForDetail] = useState<Teacher | null>(null);

  // New/Edit teacher state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [formData, setFormData] = useState({
    fullName: '',
    photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
    gender: 'Female',
    email: '',
    phone: '',
    qualification: '',
    specialization: '',
    joiningDate: new Date().toISOString().split('T')[0],
    address: '',
    basicSalary: 4500,
    allowances: 500,
    deductions: 200,
    status: 'Active'
  });

  const filteredTeachers = teachers.filter(t =>
    t.fullName.toLowerCase().includes(search.toLowerCase()) ||
    t.specialization.toLowerCase().includes(search.toLowerCase()) ||
    t.employeeId.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpenForm = (tch?: Teacher) => {
    if (tch) {
      setEditingTeacher(tch);
      setFormData({
        fullName: tch.fullName,
        photo: tch.photo,
        gender: tch.gender,
        email: tch.email,
        phone: tch.phone,
        qualification: tch.qualification,
        specialization: tch.specialization,
        joiningDate: tch.joiningDate,
        address: tch.address,
        basicSalary: tch.salary.basic,
        allowances: tch.salary.allowances,
        deductions: tch.salary.deductions,
        status: tch.status
      });
    } else {
      setEditingTeacher(null);
      setFormData({
        fullName: '',
        photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
        gender: 'Female',
        email: '',
        phone: '',
        qualification: 'M.Sc. Education',
        specialization: 'Core Curriculum',
        joiningDate: new Date().toISOString().split('T')[0],
        address: '',
        basicSalary: 4800,
        allowances: 600,
        deductions: 200,
        status: 'Active'
      });
    }
    setIsFormOpen(true);
  };

  const handleSaveTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: Partial<Teacher> = {
        fullName: formData.fullName,
        photo: formData.photo,
        gender: formData.gender as any,
        email: formData.email,
        phone: formData.phone,
        qualification: formData.qualification,
        specialization: formData.specialization,
        joiningDate: formData.joiningDate,
        address: formData.address,
        status: formData.status as any,
        salary: {
          basic: Number(formData.basicSalary),
          allowances: Number(formData.allowances),
          deductions: Number(formData.deductions),
          net: Number(formData.basicSalary) + Number(formData.allowances) - Number(formData.deductions)
        },
        assignedClasses: editingTeacher?.assignedClasses || []
      };

      if (editingTeacher) {
        await api.updateTeacher(editingTeacher.id, payload);
      } else {
        await api.createTeacher(payload);
      }
      setIsFormOpen(false);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to save faculty record.');
    }
  };

  const handleReviewLeave = async (leaveId: string, status: 'Approved' | 'Rejected') => {
    try {
      await api.reviewLeave(leaveId, status);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to update leave.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-800 tracking-tight">Faculty & Staff Management</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Academic departments, employee payroll oversight, class assignments, and leave approvals
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Tabs */}
          <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setActiveTab('directory')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'directory' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Faculty Directory ({teachers.length})
            </button>
            <button
              onClick={() => setActiveTab('leaves')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'leaves' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Staff Leaves ({leaves.filter(l => l.status === 'Pending').length} Pending)
            </button>
          </div>

          {canManageTeachers && activeTab === 'directory' && (
            <button
              onClick={() => handleOpenForm()}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-200 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Faculty</span>
            </button>
          )}
        </div>
      </div>

      {activeTab === 'directory' ? (
        <>
          {/* Search */}
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3 text-xs">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search teacher by name, specialization, or employee ID..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            {!canViewSalaries && (
              <span className="text-[11px] text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 flex items-center gap-1 font-semibold">
                <ShieldAlert className="w-3.5 h-3.5" />
                Salary data restricted for current role
              </span>
            )}
          </div>

          {/* Teacher Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredTeachers.map(tch => (
              <div
                key={tch.id}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all p-5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <img
                        src={tch.photo}
                        alt={tch.fullName}
                        className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                      />
                      <div>
                        <h3 className="font-bold text-slate-800 text-sm">{tch.fullName}</h3>
                        <p className="text-[11px] font-mono text-indigo-600 font-bold">{tch.employeeId}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                      {tch.status}
                    </span>
                  </div>

                  <div className="mt-4 space-y-2 text-xs">
                    <div>
                      <span className="text-slate-400 font-medium">Specialization:</span>
                      <p className="font-semibold text-slate-700">{tch.specialization}</p>
                    </div>

                    <div className="flex items-center gap-3 text-slate-500 pt-1">
                      <span className="flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5 text-indigo-500" />
                        <span className="truncate max-w-[130px]">{tch.email}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-indigo-500" />
                        <span>{tch.phone}</span>
                      </span>
                    </div>

                    {/* Classes Assigned */}
                    <div className="pt-2">
                      <span className="text-slate-400 font-medium">Assigned Classes:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {tch.assignedClasses.map((ac, idx) => (
                          <span key={idx} className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                            {ac.className} ({ac.subject})
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Salary Box (Role Protected) */}
                    {canViewSalaries && (
                      <div className="mt-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Net Monthly Salary</span>
                          <p className="text-xs font-black text-slate-800">${tch.salary.net.toLocaleString()}/mo</p>
                        </div>
                        <span className="text-[10px] font-mono text-slate-400">{tch.salary.bankAccount || 'Direct Deposit'}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-400 text-[11px]">Joined: {tch.joiningDate}</span>
                  <div className="flex items-center gap-1">
                    {canManageTeachers && (
                      <button
                        onClick={() => handleOpenForm(tch)}
                        className="px-2.5 py-1 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg font-semibold transition-colors cursor-pointer"
                      >
                        Edit Details
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        /* Staff Leaves Management */
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between text-xs">
            <span className="font-bold text-slate-800">Faculty Leave Applications & Formal Approvals</span>
            <span className="text-slate-400">Principal / Administrator Authority</span>
          </div>

          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase text-[11px]">
              <tr>
                <th className="py-3 px-4">Faculty Member</th>
                <th className="py-3 px-4">Leave Type</th>
                <th className="py-3 px-4">Duration</th>
                <th className="py-3 px-4">Reason</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Approval Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {leaves.map(lv => (
                <tr key={lv.id} className="hover:bg-slate-50/50">
                  <td className="py-3.5 px-4">
                    <p className="font-bold text-slate-800">{lv.teacherName}</p>
                    <p className="text-[11px] text-slate-400 font-mono">{lv.employeeId}</p>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-700">
                    {lv.leaveType}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-semibold text-slate-800">{lv.startDate} to {lv.endDate}</span>
                    <p className="text-[11px] text-slate-400">({lv.totalDays} Days)</p>
                  </td>
                  <td className="py-3.5 px-4 max-w-xs text-slate-600">
                    {lv.reason}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                      lv.status === 'Approved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                      lv.status === 'Rejected' ? 'bg-rose-50 text-rose-700 border border-rose-100' :
                      'bg-amber-50 text-amber-700 border border-amber-100'
                    }`}>
                      {lv.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    {lv.status === 'Pending' && ['super_admin', 'school_admin', 'principal'].includes(currentRole) ? (
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => handleReviewLeave(lv.id, 'Approved')}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold cursor-pointer"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleReviewLeave(lv.id, 'Rejected')}
                          className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold cursor-pointer"
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span className="text-[11px] text-slate-400">
                        {lv.reviewedBy ? `Reviewed by ${lv.reviewedBy}` : 'Processed'}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Teacher Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full p-6 space-y-4 border border-slate-200">
            <h3 className="font-bold text-slate-800 text-base">
              {editingTeacher ? `Edit Faculty: ${editingTeacher.fullName}` : 'Recruit New Faculty Member'}
            </h3>

            <form onSubmit={handleSaveTeacher} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Phone *</label>
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Qualification</label>
                  <input
                    type="text"
                    value={formData.qualification}
                    onChange={e => setFormData({ ...formData, qualification: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Specialization</label>
                  <input
                    type="text"
                    value={formData.specialization}
                    onChange={e => setFormData({ ...formData, specialization: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Basic Monthly Salary ($)</label>
                  <input
                    type="number"
                    value={formData.basicSalary}
                    onChange={e => setFormData({ ...formData, basicSalary: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Monthly Allowances ($)</label>
                  <input
                    type="number"
                    value={formData.allowances}
                    onChange={e => setFormData({ ...formData, allowances: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 text-slate-600 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md cursor-pointer"
                >
                  Save Faculty Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
