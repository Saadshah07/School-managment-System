import React, { useState } from 'react';
import { X, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react';
import type { Student, ClassGrade } from '../../types/index.js';
import { api } from '../../services/api.js';

interface StudentPromoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student;
  classes: ClassGrade[];
  onPromoted: (student: Student) => void;
}

export const StudentPromoteModal: React.FC<StudentPromoteModalProps> = ({
  isOpen,
  onClose,
  student,
  classes,
  onPromoted
}) => {
  const currentClassIndex = classes.findIndex(c => c.id === student.classId);
  const defaultNextClass = classes[currentClassIndex + 1] || classes[currentClassIndex] || classes[0];

  const [targetClassId, setTargetClassId] = useState(defaultNextClass?.id || '');
  const [targetSectionId, setTargetSectionId] = useState(defaultNextClass?.sections[0]?.id || '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !student) return null;

  const selectedClass = classes.find(c => c.id === targetClassId) || defaultNextClass;

  const handlePromote = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const selectedSec = selectedClass?.sections.find(s => s.id === targetSectionId) || selectedClass?.sections[0];
      const updated = await api.promoteStudent(student.id, {
        targetClassId: selectedClass.id,
        targetClassName: selectedClass.name,
        targetSectionId: selectedSec ? selectedSec.id : '',
        targetSectionName: selectedSec ? selectedSec.name : ''
      });
      onPromoted(updated);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to promote student.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-emerald-600 rounded-xl text-white">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Academic Year Promotion</h3>
              <p className="text-[11px] text-slate-400">Promote student to subsequent grade</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handlePromote} className="p-6 space-y-4 text-xs">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-700">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center space-x-3">
            <img
              src={student.photo}
              alt={student.fullName}
              className="w-10 h-10 rounded-xl object-cover border border-slate-200"
            />
            <div>
              <p className="font-bold text-slate-800 text-sm">{student.fullName}</p>
              <p className="text-slate-500 font-mono">{student.admissionNo} • Current: {student.className} ({student.sectionName})</p>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Target Class Grade *</label>
            <select
              value={targetClassId}
              onChange={(e) => {
                setTargetClassId(e.target.value);
                const nextC = classes.find(c => c.id === e.target.value);
                if (nextC && nextC.sections[0]) {
                  setTargetSectionId(nextC.sections[0].id);
                }
              }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 font-medium"
            >
              {classes.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Target Section *</label>
            <select
              value={targetSectionId}
              onChange={(e) => setTargetSectionId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 font-medium"
            >
              {selectedClass?.sections.map(s => (
                <option key={s.id} value={s.id}>{s.name} ({s.room})</option>
              ))}
            </select>
          </div>

          <div className="pt-2 flex justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:text-slate-800 rounded-xl font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-1.5 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md shadow-emerald-200 cursor-pointer disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{submitting ? 'Promoting...' : 'Confirm Promotion'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
