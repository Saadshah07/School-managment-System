import React from 'react';
import { X, Printer, School, CheckCircle, ShieldCheck } from 'lucide-react';
import type { Student } from '../../types/index.js';

interface StudentLeavingCertModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student;
}

export const StudentLeavingCertModal: React.FC<StudentLeavingCertModalProps> = ({
  isOpen,
  onClose,
  student
}) => {
  if (!isOpen || !student) return null;

  const handlePrint = () => {
    window.print();
  };

  const certificateNo = `SLC-2026-${student.admissionNo.replace(/\D/g, '').slice(-4) || '1042'}`;
  const issueDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200">
        {/* Controls Bar */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between no-print bg-slate-50">
          <div>
            <h3 className="font-bold text-slate-800 text-sm">School Leaving & Transfer Certificate (SLC/TC)</h3>
            <p className="text-[11px] text-slate-400">Official institutional record with principal certification seal</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Official Certificate</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Certificate Printable Area */}
        <div className="p-8 bg-slate-50 flex justify-center">
          <div className="print-area w-full max-w-xl bg-white p-8 rounded-2xl shadow-lg border-4 border-double border-indigo-950 text-slate-900 relative">
            {/* Header / Seal */}
            <div className="text-center border-b-2 border-slate-900/40 pb-4 mb-6">
              <div className="flex items-center justify-center gap-2 mb-1">
                <School className="w-7 h-7 text-indigo-900" />
                <h2 className="text-xl font-black uppercase tracking-wider text-indigo-950">Apex Academy of Excellence</h2>
              </div>
              <p className="text-xs font-medium text-slate-600 uppercase tracking-widest">
                Department of Secondary & Higher Education
              </p>
              <p className="text-[10px] text-slate-500">100 Academic Boulevard, Metropolis • Affiliation Code: ED-2026-APX</p>
              <div className="mt-3 inline-block px-4 py-1 bg-indigo-950 text-white rounded-md text-xs font-black uppercase tracking-wider">
                School Leaving & Character Certificate
              </div>
            </div>

            {/* Certificate Metadata */}
            <div className="flex justify-between text-xs font-medium text-slate-600 mb-6">
              <span>Certificate Ref: <strong className="text-slate-900 font-mono">{certificateNo}</strong></span>
              <span>Date of Issue: <strong className="text-slate-900">{issueDate}</strong></span>
            </div>

            {/* Body Certification Text */}
            <div className="space-y-4 text-xs leading-relaxed text-slate-800 text-justify">
              <p>
                This is to officially certify that <strong>{student.fullName}</strong>, bearing Admission Number{' '}
                <strong className="font-mono">{student.admissionNo}</strong> and National ID/B-Form{' '}
                <strong className="font-mono">{student.bFormOrId}</strong>, son/daughter of{' '}
                <strong>{student.parentName}</strong>, was a bona fide student of Apex Academy.
              </p>

              <p>
                The student was admitted to the school on <strong>{student.admissionDate}</strong> and successfully completed studies in{' '}
                <strong>{student.className} ({student.sectionName})</strong>. According to institutional records:
              </p>

              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Date of Birth (in school register):</span>
                  <span className="font-bold">{student.dob}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">General Conduct & Discipline:</span>
                  <span className="font-bold text-emerald-700">Exemplary / Very Good</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Institutional Dues & Fee Clearance:</span>
                  <span className="font-bold text-emerald-700">All Dues Paid in Full</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Reason for Leaving:</span>
                  <span className="font-bold">Course Completion / Parent Relocation</span>
                </div>
              </div>

              <p>
                We commend the student for exceptional academic dedication, exemplary behavior, and active co-curricular participation. We wish them the very highest success in all future scholastic pursuits.
              </p>
            </div>

            {/* Signature Blocks */}
            <div className="mt-12 pt-6 border-t border-slate-200 flex items-end justify-between text-center text-xs">
              <div className="space-y-1">
                <div className="w-32 border-b border-slate-400 mx-auto" />
                <p className="font-bold text-slate-800">Class Incharge</p>
                <p className="text-[10px] text-slate-500">{student.sectionName}</p>
              </div>

              {/* Official Seal Badge */}
              <div className="w-16 h-16 rounded-full border-2 border-indigo-900/60 flex flex-col items-center justify-center p-1 text-[8px] text-indigo-900 font-bold uppercase tracking-tighter text-center">
                <span>Apex Acad.</span>
                <span className="font-mono text-[6px]">OFFICIAL SEAL</span>
                <span>2026-27</span>
              </div>

              <div className="space-y-1">
                <div className="w-32 border-b border-slate-400 mx-auto" />
                <p className="font-bold text-slate-800">Prof. Marcus Holloway</p>
                <p className="text-[10px] text-slate-500">Head of School / Principal</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
