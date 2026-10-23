import React, { useState } from 'react';
import {
  BookOpen,
  Users,
  DoorOpen,
  Plus,
  Layers,
  GraduationCap,
  Calendar,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import type { ClassGrade, Student } from '../../types/index.js';
import { useAuth } from '../../context/AuthContext.js';

interface ClassesViewProps {
  classes: ClassGrade[];
  students: Student[];
}

export const ClassesView: React.FC<ClassesViewProps> = ({ classes, students }) => {
  const [selectedClassId, setSelectedClassId] = useState<string>(classes[0]?.id || '');
  const activeClass = classes.find(c => c.id === selectedClassId) || classes[0];

  const classStudents = students.filter(s => s.classId === activeClass?.id);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-800 tracking-tight">Academic Classes, Sections & Subjects</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Curriculum mapping, section capacities, and assigned in-charge faculty for 2026-2027
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 bg-indigo-50 border border-indigo-100 rounded-xl text-xs font-bold text-indigo-700">
            Current Academic Year: 2026-27 (Fall Term)
          </span>
        </div>
      </div>

      {/* Main Layout: Class Selector sidebar + Section & Subjects details */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Classes List */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-3 space-y-1">
          <p className="px-3 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            All Grade Levels ({classes.length})
          </p>
          {classes.map(c => {
            const isSelected = c.id === activeClass?.id;
            const count = students.filter(s => s.classId === c.id).length;
            return (
              <button
                key={c.id}
                onClick={() => setSelectedClassId(c.id)}
                className={`w-full flex items-center justify-between p-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <Layers className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                  <span>{c.name}</span>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  {count} Enrolled
                </span>
              </button>
            );
          })}
        </div>

        {/* Selected Class Deep View */}
        <div className="lg:col-span-3 space-y-6">
          {/* Class Banner Card */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-indigo-900 rounded-2xl p-6 text-white shadow-md flex items-center justify-between">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-white/10 rounded-full text-[11px] font-semibold text-indigo-200 mb-1">
                <span>{activeClass?.sections.length} Sections</span>
                <span>•</span>
                <span>{activeClass?.subjects.length} Subjects Configured</span>
              </div>
              <h3 className="text-2xl font-black">{activeClass?.name}</h3>
              <p className="text-xs text-indigo-200 mt-0.5">
                Total Enrolled Students: {classStudents.length} • Maximum Cap: {activeClass?.sections.reduce((acc, s) => acc + s.capacity, 0)}
              </p>
            </div>
          </div>

          {/* Sections Grid */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              Sections & In-Charge Faculty
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeClass?.sections.map(sec => {
                const secStudents = classStudents.filter(s => s.sectionId === sec.id);
                return (
                  <div key={sec.id} className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <h5 className="font-bold text-slate-800 text-sm">{sec.name}</h5>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">
                        {sec.room}
                      </span>
                    </div>

                    <div className="text-xs text-slate-600 space-y-1">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Class Teacher:</span>
                        <span className="font-semibold text-slate-800">{sec.classTeacherName || 'Sarah Jenkins, M.Sc.'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Capacity Utilization:</span>
                        <span className="font-semibold text-indigo-600">{secStudents.length} / {sec.capacity} seats</span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-indigo-600 h-full rounded-full transition-all"
                        style={{ width: `${Math.min(100, (secStudents.length / sec.capacity) * 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Subjects Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800">Assigned Curriculum & Subject Syllabi</span>
              <span className="text-[11px] text-slate-400">{activeClass?.subjects.length} Total Subjects</span>
            </div>

            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase text-[11px]">
                <tr>
                  <th className="py-3 px-4">Subject Code</th>
                  <th className="py-3 px-4">Subject Name</th>
                  <th className="py-3 px-4">Credit Hours / Wk</th>
                  <th className="py-3 px-4">Assigned Subject Faculty</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {activeClass?.subjects.map(sub => (
                  <tr key={sub.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-mono font-bold text-indigo-600">{sub.code}</td>
                    <td className="py-3 px-4 font-bold text-slate-800">{sub.name}</td>
                    <td className="py-3 px-4 font-semibold text-slate-600">{sub.creditHours} Hours</td>
                    <td className="py-3 px-4 font-medium text-slate-700">{sub.teacherName || 'Faculty Assigned'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
