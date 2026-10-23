import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Plus,
  Download,
  Printer,
  Eye,
  Edit,
  Trash2,
  FileText,
  TrendingUp,
  Award,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  ArrowUpDown
} from 'lucide-react';
import type { Student, ClassGrade } from '../../types/index.js';
import { useAuth } from '../../context/AuthContext.js';
import { api } from '../../services/api.js';
import { StudentFormModal } from './StudentFormModal.js';
import { StudentProfileModal } from './StudentProfileModal.js';
import { StudentIdCardModal } from './StudentIdCardModal.js';
import { StudentLeavingCertModal } from './StudentLeavingCertModal.js';
import { StudentPromoteModal } from './StudentPromoteModal.js';

interface StudentListProps {
  students: Student[];
  classes: ClassGrade[];
  onRefresh: () => void;
}

export const StudentList: React.FC<StudentListProps> = ({ students, classes, onRefresh }) => {
  const { canManageStudents, currentRole } = useAuth();

  // Search & Filter state
  const [search, setSearch] = useState('');
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedGender, setSelectedGender] = useState<string>('all');
  const [sortField, setSortField] = useState<'name' | 'admissionNo' | 'date'>('admissionNo');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [selectedStudentForProfile, setSelectedStudentForProfile] = useState<Student | null>(null);
  const [selectedStudentForIdCard, setSelectedStudentForIdCard] = useState<Student | null>(null);
  const [selectedStudentForCert, setSelectedStudentForCert] = useState<Student | null>(null);
  const [selectedStudentForPromote, setSelectedStudentForPromote] = useState<Student | null>(null);

  // Filter & Sort
  const filteredStudents = useMemo(() => {
    let list = [...students];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(s =>
        s.fullName.toLowerCase().includes(q) ||
        s.admissionNo.toLowerCase().includes(q) ||
        s.contactNumber.includes(q) ||
        s.parentName.toLowerCase().includes(q)
      );
    }

    if (selectedClass !== 'all') {
      list = list.filter(s => s.classId === selectedClass);
    }

    if (selectedStatus !== 'all') {
      list = list.filter(s => s.status === selectedStatus);
    }

    if (selectedGender !== 'all') {
      list = list.filter(s => s.gender === selectedGender);
    }

    // Sort
    list.sort((a, b) => {
      let valA = '';
      let valB = '';
      if (sortField === 'name') {
        valA = a.fullName.toLowerCase();
        valB = b.fullName.toLowerCase();
      } else if (sortField === 'admissionNo') {
        valA = a.admissionNo;
        valB = b.admissionNo;
      } else if (sortField === 'date') {
        valA = a.admissionDate;
        valB = b.admissionDate;
      }
      return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
    });

    return list;
  }, [students, search, selectedClass, selectedStatus, selectedGender, sortField, sortOrder]);

  // Paginated students
  const totalPages = Math.ceil(filteredStudents.length / pageSize) || 1;
  const paginatedStudents = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredStudents.slice(start, start + pageSize);
  }, [filteredStudents, currentPage]);

  const handleDelete = async (student: Student) => {
    if (window.confirm(`Are you sure you want to permanently delete record for ${student.fullName} (${student.admissionNo})?`)) {
      try {
        await api.deleteStudent(student.id);
        onRefresh();
      } catch (err: any) {
        alert(err.message || 'Failed to delete student');
      }
    }
  };

  const exportToCSV = () => {
    const headers = ['Admission No', 'Full Name', 'Class', 'Section', 'Roll No', 'Gender', 'DOB', 'Parent Name', 'Parent Contact', 'Status'];
    const rows = filteredStudents.map(s => [
      `"${s.admissionNo}"`,
      `"${s.fullName}"`,
      `"${s.className}"`,
      `"${s.sectionName}"`,
      `"${s.rollNumber}"`,
      `"${s.gender}"`,
      `"${s.dob}"`,
      `"${s.parentName}"`,
      `"${s.parentContact}"`,
      `"${s.status}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Apex_Academy_Students_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-800 tracking-tight">Student Enrollment Directory</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Managing {filteredStudents.length} institutional admission records
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={exportToCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span>Print Records</span>
          </button>

          {canManageStudents && (
            <button
              onClick={() => {
                setEditingStudent(null);
                setIsFormOpen(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-200 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>New Admission</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center gap-3 text-xs">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by student name, admission no, phone..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Class Filter */}
        <div className="flex items-center space-x-1.5">
          <span className="text-slate-400 font-semibold">Class:</span>
          <select
            value={selectedClass}
            onChange={(e) => {
              setSelectedClass(e.target.value);
              setCurrentPage(1);
            }}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 focus:bg-white"
          >
            <option value="all">All Grades</option>
            {classes.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div className="flex items-center space-x-1.5">
          <span className="text-slate-400 font-semibold">Status:</span>
          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setCurrentPage(1);
            }}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 focus:bg-white"
          >
            <option value="all">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Graduated">Graduated</option>
            <option value="Transferred">Transferred</option>
          </select>
        </div>

        {/* Sort Trigger */}
        <button
          onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
          className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold transition-colors"
        >
          <ArrowUpDown className="w-3.5 h-3.5" />
          <span>Sort {sortOrder === 'asc' ? 'A-Z' : 'Z-A'}</span>
        </button>
      </div>

      {/* Students Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden print-area">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Admission No</th>
                <th className="py-3 px-4">Class & Section</th>
                <th className="py-3 px-4">Roll #</th>
                <th className="py-3 px-4">Guardian Details</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right no-print">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedStudents.length > 0 ? (
                paginatedStudents.map(student => (
                  <tr key={student.id} className="hover:bg-slate-50/50 transition-colors group">
                    {/* Student Info */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-3">
                        <img
                          src={student.photo}
                          alt={student.fullName}
                          className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0"
                        />
                        <div>
                          <p className="font-bold text-slate-800 text-xs">{student.fullName}</p>
                          <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                            <span>{student.gender}</span>
                            <span>•</span>
                            <span>DOB: {student.dob}</span>
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Admission No */}
                    <td className="py-3.5 px-4 font-mono font-bold text-indigo-700">
                      {student.admissionNo}
                    </td>

                    {/* Class & Section */}
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-800">{student.className}</span>
                      <p className="text-[11px] text-slate-400">{student.sectionName}</p>
                    </td>

                    {/* Roll No */}
                    <td className="py-3.5 px-4 font-mono text-slate-600 font-bold">
                      {student.rollNumber}
                    </td>

                    {/* Parent */}
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-slate-800">{student.parentName}</p>
                      <p className="text-[11px] text-slate-400 font-mono">{student.parentContact}</p>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                        student.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                        student.status === 'Graduated' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                        student.status === 'Transferred' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {student.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right no-print">
                      <div className="inline-flex items-center space-x-1">
                        <button
                          onClick={() => setSelectedStudentForProfile(student)}
                          title="View Complete Profile"
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => setSelectedStudentForIdCard(student)}
                          title="Generate Student ID Card"
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <FileText className="w-4 h-4" />
                        </button>

                        {canManageStudents && (
                          <>
                            <button
                              onClick={() => {
                                setEditingStudent(student);
                                setIsFormOpen(true);
                              }}
                              title="Edit Student Record"
                              className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                            >
                              <Edit className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => setSelectedStudentForPromote(student)}
                              title="Promote to Next Grade"
                              className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                            >
                              <TrendingUp className="w-4 h-4" />
                            </button>

                            {['super_admin', 'school_admin'].includes(currentRole) && (
                              <button
                                onClick={() => handleDelete(student)}
                                title="Delete Record"
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-xs text-slate-400">
                    No students found matching your search or filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between no-print text-xs text-slate-500">
          <span>
            Showing {filteredStudents.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} to{' '}
            {Math.min(currentPage * pageSize, filteredStudents.length)} of {filteredStudents.length} entries
          </span>

          <div className="flex items-center space-x-1.5">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 font-semibold text-slate-700">
              Page {currentPage} of {totalPages}
            </span>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <StudentFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSaved={() => onRefresh()}
        classes={classes}
        editingStudent={editingStudent}
      />

      {selectedStudentForProfile && (
        <StudentProfileModal
          isOpen={!!selectedStudentForProfile}
          onClose={() => setSelectedStudentForProfile(null)}
          student={selectedStudentForProfile}
          onOpenIdCard={(s) => setSelectedStudentForIdCard(s)}
          onOpenLeavingCert={(s) => setSelectedStudentForCert(s)}
          onPromote={(s) => setSelectedStudentForPromote(s)}
        />
      )}

      {selectedStudentForIdCard && (
        <StudentIdCardModal
          isOpen={!!selectedStudentForIdCard}
          onClose={() => setSelectedStudentForIdCard(null)}
          student={selectedStudentForIdCard}
        />
      )}

      {selectedStudentForCert && (
        <StudentLeavingCertModal
          isOpen={!!selectedStudentForCert}
          onClose={() => setSelectedStudentForCert(null)}
          student={selectedStudentForCert}
        />
      )}

      {selectedStudentForPromote && (
        <StudentPromoteModal
          isOpen={!!selectedStudentForPromote}
          onClose={() => setSelectedStudentForPromote(null)}
          student={selectedStudentForPromote}
          classes={classes}
          onPromoted={() => onRefresh()}
        />
      )}
    </div>
  );
};
