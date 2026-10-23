import React from 'react';
import { X, Printer, School, ShieldCheck, QrCode } from 'lucide-react';
import type { Student } from '../../types/index.js';

interface StudentIdCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student;
}

export const StudentIdCardModal: React.FC<StudentIdCardModalProps> = ({ isOpen, onClose, student }) => {
  if (!isOpen || !student) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
        {/* Modal Controls (No Print) */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between no-print bg-slate-50">
          <div>
            <h3 className="font-bold text-slate-800 text-sm">Official Student ID Badge</h3>
            <p className="text-[11px] text-slate-400">Card generation ready for high-resolution print</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Badge</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Card Area */}
        <div className="p-6 flex items-center justify-center bg-slate-100">
          <div className="print-area w-80 bg-white rounded-2xl overflow-hidden shadow-xl border border-slate-300 relative select-none">
            {/* Card Header */}
            <div className="bg-gradient-to-r from-indigo-800 via-indigo-900 to-slate-900 px-4 py-3 text-white text-center">
              <div className="flex items-center justify-center gap-1.5 mb-0.5">
                <School className="w-4 h-4 text-indigo-300" />
                <h4 className="text-xs font-black tracking-wide uppercase">EduPulse Academy</h4>
              </div>
              <p className="text-[9px] text-indigo-200 uppercase tracking-widest font-semibold">
                Official Student Identity Card • 2026-2027
              </p>
            </div>

            {/* Photo & Details */}
            <div className="p-4 flex flex-col items-center text-center">
              <div className="w-24 h-24 rounded-2xl overflow-hidden ring-4 ring-indigo-50 border-2 border-indigo-600 shadow-md mb-2.5">
                <img
                  src={student.photo}
                  alt={student.fullName}
                  className="w-full h-full object-cover"
                />
              </div>

              <h3 className="text-base font-extrabold text-slate-900 leading-tight">{student.fullName}</h3>
              <p className="text-xs font-bold text-indigo-700 mt-0.5 font-mono">{student.admissionNo}</p>

              {/* Badges */}
              <div className="flex items-center gap-2 mt-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-800 border border-indigo-200">
                  {student.className}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  Roll #{student.rollNumber}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                  {student.bloodGroup || 'O+'}
                </span>
              </div>

              {/* Metadata Key Values */}
              <div className="w-full mt-4 pt-3 border-t border-slate-100 text-[11px] space-y-1 text-left">
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">Date of Birth:</span>
                  <span className="text-slate-800 font-semibold">{student.dob}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">Guardian:</span>
                  <span className="text-slate-800 font-semibold truncate max-w-[140px]">{student.parentName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">Emergency Ph:</span>
                  <span className="text-rose-600 font-bold font-mono">{student.emergencyContactPhone || student.parentContact}</span>
                </div>
              </div>

              {/* Barcode & Security Hologram simulation */}
              <div className="w-full mt-4 pt-2 border-t border-dashed border-slate-200 flex items-center justify-between">
                {/* Simulated Barcode */}
                <div className="space-y-0.5">
                  <div className="flex items-center gap-[2px] h-6">
                    {[2, 1, 3, 1, 2, 4, 1, 3, 2, 1, 4, 2, 1, 3, 1, 2, 3, 1, 2, 4, 1].map((w, i) => (
                      <div key={i} className="bg-slate-900 h-full" style={{ width: `${w}px` }} />
                    ))}
                  </div>
                  <p className="text-[8px] text-slate-400 font-mono tracking-wider">{student.admissionNo}</p>
                </div>

                {/* QR Code Icon / Stamp */}
                <div className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg">
                  <QrCode className="w-8 h-8 text-slate-800" />
                </div>
              </div>
            </div>

            {/* Card Footer */}
            <div className="bg-slate-50 px-4 py-2 border-t border-slate-100 flex items-center justify-between text-[9px] text-slate-400 font-medium">
              <span>Apex Academy Campus</span>
              <span>Valid Thru: JUN 2027</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
