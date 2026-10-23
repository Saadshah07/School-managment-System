import React, { useState, useEffect } from 'react';
import { X, UserPlus, Save, AlertCircle, ShieldAlert } from 'lucide-react';
import type { Student, ClassGrade } from '../../types/index.js';
import { api } from '../../services/api.js';

interface StudentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: (student: Student) => void;
  classes: ClassGrade[];
  editingStudent?: Student | null;
}

export const StudentFormModal: React.FC<StudentFormModalProps> = ({
  isOpen,
  onClose,
  onSaved,
  classes,
  editingStudent
}) => {
  const [formData, setFormData] = useState<Partial<Student>>({
    fullName: '',
    photo: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=300&q=80',
    dob: '2010-01-01',
    gender: 'Male',
    bFormOrId: '',
    contactNumber: '',
    email: '',
    homeAddress: '',
    parentName: '',
    parentRelation: 'Father',
    parentContact: '',
    parentEmail: '',
    parentOccupation: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelation: 'Mother',
    admissionDate: new Date().toISOString().split('T')[0],
    classId: classes[0]?.id || '',
    sectionId: classes[0]?.sections[0]?.id || '',
    className: classes[0]?.name || '',
    sectionName: classes[0]?.sections[0]?.name || '',
    rollNumber: '01',
    previousSchool: '',
    medicalNotes: '',
    isMedicalRestricted: false,
    status: 'Active',
    bloodGroup: 'O+',
    discountCategory: '',
    discountPercent: 0
  });

  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editingStudent) {
      setFormData(editingStudent);
    } else {
      setFormData({
        fullName: '',
        photo: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=300&q=80',
        dob: '2010-01-01',
        gender: 'Male',
        bFormOrId: `ID-${Math.floor(100000 + Math.random() * 900000)}`,
        contactNumber: '+1 (555) 000-0000',
        email: '',
        homeAddress: '',
        parentName: '',
        parentRelation: 'Father',
        parentContact: '',
        parentEmail: '',
        parentOccupation: '',
        emergencyContactName: '',
        emergencyContactPhone: '',
        emergencyContactRelation: 'Mother',
        admissionDate: new Date().toISOString().split('T')[0],
        classId: classes[0]?.id || '',
        sectionId: classes[0]?.sections[0]?.id || '',
        className: classes[0]?.name || '',
        sectionName: classes[0]?.sections[0]?.name || '',
        rollNumber: '01',
        previousSchool: '',
        medicalNotes: '',
        isMedicalRestricted: false,
        status: 'Active',
        bloodGroup: 'O+',
        discountCategory: '',
        discountPercent: 0
      });
    }
  }, [editingStudent, classes, isOpen]);

  if (!isOpen) return null;

  const handleClassChange = (classId: string) => {
    const selectedClass = classes.find(c => c.id === classId);
    if (selectedClass) {
      const firstSec = selectedClass.sections[0];
      setFormData(prev => ({
        ...prev,
        classId: selectedClass.id,
        className: selectedClass.name,
        sectionId: firstSec ? firstSec.id : '',
        sectionName: firstSec ? firstSec.name : ''
      }));
    }
  };

  const handleSectionChange = (sectionId: string) => {
    const selectedClass = classes.find(c => c.id === formData.classId);
    const selectedSec = selectedClass?.sections.find(s => s.id === sectionId);
    if (selectedSec) {
      setFormData(prev => ({
        ...prev,
        sectionId: selectedSec.id,
        sectionName: selectedSec.name
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.fullName?.trim()) {
      setError('Student full name is required.');
      return;
    }
    if (!formData.parentName?.trim() || !formData.parentContact?.trim()) {
      setError('Parent name and contact phone number are required.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingStudent?.id) {
        const updated = await api.updateStudent(editingStudent.id, formData);
        onSaved(updated);
      } else {
        const created = await api.createStudent(formData);
        onSaved(created);
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save student record.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeClass = classes.find(c => c.id === formData.classId) || classes[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-indigo-600 rounded-xl text-white">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base">
                {editingStudent ? `Edit Student: ${editingStudent.fullName}` : 'New Student Registration'}
              </h3>
              <p className="text-xs text-slate-400">Complete all required institutional admission records</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-700 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Section 1: Personal Details */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-700 mb-3 pb-1 border-b border-indigo-100">
              1. Student Identity & Personal Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="md:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">Full Legal Name *</label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="e.g. Liam Alexander Vance"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Gender *</label>
                <select
                  value={formData.gender}
                  onChange={e => setFormData({ ...formData, gender: e.target.value as any })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Date of Birth *</label>
                <input
                  type="date"
                  required
                  value={formData.dob}
                  onChange={e => setFormData({ ...formData, dob: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">B-Form / National ID</label>
                <input
                  type="text"
                  value={formData.bFormOrId}
                  onChange={e => setFormData({ ...formData, bFormOrId: e.target.value })}
                  placeholder="e.g. ID-882910-A"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Blood Group</label>
                <select
                  value={formData.bloodGroup}
                  onChange={e => setFormData({ ...formData, bloodGroup: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">Profile Photo URL</label>
                <input
                  type="text"
                  value={formData.photo}
                  onChange={e => setFormData({ ...formData, photo: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Graduated">Graduated</option>
                  <option value="Transferred">Transferred</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Academic Placement */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-700 mb-3 pb-1 border-b border-indigo-100">
              2. Academic Placement & Enrollment
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Class Grade *</label>
                <select
                  value={formData.classId}
                  onChange={e => handleClassChange(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500"
                >
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Section *</label>
                <select
                  value={formData.sectionId}
                  onChange={e => handleSectionChange(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500"
                >
                  {activeClass?.sections.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.room})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Roll Number</label>
                <input
                  type="text"
                  value={formData.rollNumber}
                  onChange={e => setFormData({ ...formData, rollNumber: e.target.value })}
                  placeholder="e.g. 09-01"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Admission Date</label>
                <input
                  type="date"
                  value={formData.admissionDate}
                  onChange={e => setFormData({ ...formData, admissionDate: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">Previous School Attended</label>
                <input
                  type="text"
                  value={formData.previousSchool}
                  onChange={e => setFormData({ ...formData, previousSchool: e.target.value })}
                  placeholder="e.g. St. Jude International Academy"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Parent & Emergency Contact */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-700 mb-3 pb-1 border-b border-indigo-100">
              3. Parent / Guardian & Emergency Contact
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Parent / Guardian Name *</label>
                <input
                  type="text"
                  required
                  value={formData.parentName}
                  onChange={e => setFormData({ ...formData, parentName: e.target.value })}
                  placeholder="e.g. Robert Vance"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Relation</label>
                <input
                  type="text"
                  value={formData.parentRelation}
                  onChange={e => setFormData({ ...formData, parentRelation: e.target.value })}
                  placeholder="e.g. Father, Mother, Guardian"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Parent Phone Number *</label>
                <input
                  type="text"
                  required
                  value={formData.parentContact}
                  onChange={e => setFormData({ ...formData, parentContact: e.target.value })}
                  placeholder="+1 (555) 901-2345"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Parent Email</label>
                <input
                  type="email"
                  value={formData.parentEmail}
                  onChange={e => setFormData({ ...formData, parentEmail: e.target.value })}
                  placeholder="parent@example.com"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Emergency Contact Person</label>
                <input
                  type="text"
                  value={formData.emergencyContactName}
                  onChange={e => setFormData({ ...formData, emergencyContactName: e.target.value })}
                  placeholder="e.g. Eleanor Vance"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Emergency Contact Phone</label>
                <input
                  type="text"
                  value={formData.emergencyContactPhone}
                  onChange={e => setFormData({ ...formData, emergencyContactPhone: e.target.value })}
                  placeholder="+1 (555) 901-2346"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="md:col-span-3">
                <label className="block font-semibold text-slate-700 mb-1">Residential Home Address</label>
                <input
                  type="text"
                  value={formData.homeAddress}
                  onChange={e => setFormData({ ...formData, homeAddress: e.target.value })}
                  placeholder="Full street address, city, state"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Confidential Medical Notes */}
          <div>
            <div className="flex items-center justify-between mb-3 pb-1 border-b border-rose-100">
              <h4 className="text-xs font-bold uppercase tracking-wider text-rose-700 flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5" />
                4. Confidential Medical Notes & Allergies
              </h4>
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                <input
                  type="checkbox"
                  checked={formData.isMedicalRestricted}
                  onChange={e => setFormData({ ...formData, isMedicalRestricted: e.target.checked })}
                  className="w-4 h-4 text-rose-600 rounded"
                />
                <span>Restricted Access (Authorized Admin Only)</span>
              </label>
            </div>
            <div>
              <textarea
                rows={2}
                value={formData.medicalNotes}
                onChange={e => setFormData({ ...formData, medicalNotes: e.target.value })}
                placeholder="Disclose asthma, food allergies, medication needs, or physical restrictions..."
                className="w-full px-3 py-2 bg-rose-50/40 border border-rose-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-rose-500"
              />
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-slate-600 hover:text-slate-800 rounded-xl text-xs font-semibold"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleSubmit}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-200 transition-all cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSubmitting ? 'Saving...' : editingStudent ? 'Update Student Record' : 'Register Student'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
