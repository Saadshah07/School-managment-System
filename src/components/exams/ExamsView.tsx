import React, { useState, useEffect } from 'react';
import {
  Award,
  Calendar,
  Clock,
  Printer,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Plus,
  FileText,
  UserCheck,
  ChevronRight,
  School,
  X
} from 'lucide-react';
import type { Exam, ExamResult, Student, ClassGrade } from '../../types/index.js';
import { useAuth } from '../../context/AuthContext.js';
import { api } from '../../services/api.js';

interface ExamsViewProps {
  exams: Exam[];
  students: Student[];
  classes: ClassGrade[];
  onRefresh: () => void;
  onOpenVoiceModal?: () => void;
}

export const ExamsView: React.FC<ExamsViewProps> = ({ exams, students, classes, onRefresh, onOpenVoiceModal }) => {
  const { canManageExams, currentRole, currentUser } = useAuth();

  const [selectedExamId, setSelectedExamId] = useState<string>(exams[0]?.id || '');
  const [examResults, setExamResults] = useState<ExamResult[]>([]);
  const [selectedResultForPrint, setSelectedResultForPrint] = useState<ExamResult | null>(null);

  // Marks Entry state
  const [isEntryOpen, setIsEntryOpen] = useState(false);
  const [entryStudentId, setEntryStudentId] = useState<string>(students[0]?.id || '');
  const [entryMarks, setEntryMarks] = useState<Record<string, number>>({});
  const [teacherRemarks, setTeacherRemarks] = useState('');
  const [isGeneratingRemarks, setIsGeneratingRemarks] = useState(false);

  const activeExam = exams.find(e => e.id === selectedExamId) || exams[0];

  useEffect(() => {
    async function loadResults() {
      if (!selectedExamId) return;
      try {
        const results = await api.getExamResults({ examId: selectedExamId });
        setExamResults(results);
      } catch (err) {
        console.error(err);
      }
    }
    loadResults();
  }, [selectedExamId]);

  // Handle auto-calculating grade
  const calculateGrade = (percentage: number) => {
    if (percentage >= 90) return { grade: 'A+', gpa: 4.0 };
    if (percentage >= 80) return { grade: 'A', gpa: 3.8 };
    if (percentage >= 70) return { grade: 'B+', gpa: 3.3 };
    if (percentage >= 60) return { grade: 'B', gpa: 2.8 };
    if (percentage >= 50) return { grade: 'C', gpa: 2.0 };
    return { grade: 'F', gpa: 0.0 };
  };

  const handleOpenMarksEntry = (student: Student) => {
    setEntryStudentId(student.id);
    const existing = examResults.find(r => r.studentId === student.id && r.examId === activeExam.id);
    const marksMap: Record<string, number> = {};

    activeExam.subjects.forEach(sub => {
      const recorded = existing?.marks.find(m => m.subjectId === sub.subjectId);
      marksMap[sub.subjectId] = recorded ? recorded.marksObtained : 40;
    });

    setEntryMarks(marksMap);
    setTeacherRemarks(existing?.teacherRemarks || '');
    setIsEntryOpen(true);
  };

  const handleGenerateAiRemarks = async () => {
    const student = students.find(s => s.id === entryStudentId);
    if (!student || !activeExam) return;

    setIsGeneratingRemarks(true);
    try {
      const subjectScores = activeExam.subjects.map(s => ({
        subject: s.subjectName,
        score: entryMarks[s.subjectId] || 40,
        max: s.maxMarks
      }));

      const remarks = await api.generateStudentRemarks(student.fullName, subjectScores, 96);
      setTeacherRemarks(remarks);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingRemarks(false);
    }
  };

  const handleSaveMarks = async (e: React.FormEvent) => {
    e.preventDefault();
    const student = students.find(s => s.id === entryStudentId);
    if (!student || !activeExam) return;

    let totalObtained = 0;
    let totalMax = 0;

    const formattedMarks = activeExam.subjects.map(sub => {
      const score = Number(entryMarks[sub.subjectId] || 0);
      totalObtained += score;
      totalMax += sub.maxMarks;
      const subPct = (score / sub.maxMarks) * 100;
      return {
        subjectId: sub.subjectId,
        subjectName: sub.subjectName,
        marksObtained: score,
        maxMarks: sub.maxMarks,
        passingMarks: sub.passingMarks,
        grade: calculateGrade(subPct).grade
      };
    });

    const percentage = Number(((totalObtained / totalMax) * 100).toFixed(2));
    const { grade, gpa } = calculateGrade(percentage);

    try {
      await api.saveExamResult({
        examId: activeExam.id,
        examTitle: activeExam.title,
        studentId: student.id,
        studentName: student.fullName,
        admissionNo: student.admissionNo,
        rollNumber: student.rollNumber,
        classId: student.classId,
        sectionId: student.sectionId,
        className: student.className,
        sectionName: student.sectionName,
        marks: formattedMarks,
        totalObtained,
        totalMax,
        percentage,
        gpa,
        overallGrade: grade,
        passStatus: percentage >= 40 ? 'Pass' : 'Fail',
        teacherRemarks,
        principalRemarks: 'Commended for consistent academic effort and scholastic integrity.'
      });

      setIsEntryOpen(false);
      const reloaded = await api.getExamResults({ examId: activeExam.id });
      setExamResults(reloaded);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to record marks.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-800 tracking-tight">Examinations & Official Transcripts</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Grading schedules, marks entry validation, automated percentage calculations, and printable report cards
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Exam Selector */}
          <select
            value={selectedExamId}
            onChange={e => setSelectedExamId(e.target.value)}
            className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 shadow-xs"
          >
            {exams.map(ex => (
              <option key={ex.id} value={ex.id}>{ex.title} ({ex.className})</option>
            ))}
          </select>
        </div>
      </div>

      {/* Active Exam Overview Banner */}
      <div className="bg-gradient-to-r from-indigo-800 via-indigo-900 to-slate-900 rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-indigo-500/30 rounded-full text-[11px] font-semibold text-indigo-200 mb-1">
            <span>{activeExam?.examType} Assessment</span>
            <span>•</span>
            <span>Academic Year {activeExam?.academicYear}</span>
          </div>
          <h3 className="text-2xl font-black">{activeExam?.title}</h3>
          <p className="text-xs text-indigo-200 mt-0.5">
            Class Target: {activeExam?.className} • Exam Window: {activeExam?.startDate} to {activeExam?.endDate}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 bg-white/10 rounded-xl text-xs font-semibold backdrop-blur-sm border border-white/10">
            {activeExam?.subjects.length} Subjects Assessed
          </span>
        </div>
      </div>

      {/* Exam Subjects Schedule Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-800">Exam Schedule & Paper Allocations</span>
          <span className="text-[11px] text-slate-400">Passing Threshold: 40%</span>
        </div>

        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase text-[11px]">
            <tr>
              <th className="py-3 px-4">Subject</th>
              <th className="py-3 px-4">Exam Date & Time</th>
              <th className="py-3 px-4">Assigned Hall</th>
              <th className="py-3 px-4">Max Marks</th>
              <th className="py-3 px-4">Pass Mark</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {activeExam?.subjects.map(sub => (
              <tr key={sub.subjectId} className="hover:bg-slate-50/50">
                <td className="py-3 px-4 font-bold text-slate-800">{sub.subjectName}</td>
                <td className="py-3 px-4 text-slate-600 font-medium">
                  {sub.date} • {sub.time}
                </td>
                <td className="py-3 px-4 text-slate-600">{sub.room}</td>
                <td className="py-3 px-4 font-mono font-bold text-indigo-600">{sub.maxMarks}</td>
                <td className="py-3 px-4 font-mono font-bold text-emerald-600">{sub.passingMarks}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Student Results Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-800">Published Results & Assessment Roster</span>
          <span className="text-[11px] text-slate-400">{examResults.length} Assessed Students</span>
        </div>

        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase text-[11px]">
            <tr>
              <th className="py-3 px-4">Rank</th>
              <th className="py-3 px-4">Student</th>
              <th className="py-3 px-4">Roll #</th>
              <th className="py-3 px-4">Total Score</th>
              <th className="py-3 px-4">Percentage</th>
              <th className="py-3 px-4">Grade & GPA</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {examResults.map((res, idx) => (
              <tr key={res.id} className="hover:bg-slate-50/50">
                <td className="py-3.5 px-4 font-bold text-slate-400">
                  #{idx + 1}
                </td>
                <td className="py-3.5 px-4">
                  <p className="font-bold text-slate-800">{res.studentName}</p>
                  <p className="text-[11px] text-slate-400 font-mono">{res.admissionNo}</p>
                </td>
                <td className="py-3.5 px-4 font-mono font-bold text-slate-600">
                  {res.rollNumber}
                </td>
                <td className="py-3.5 px-4 font-bold text-slate-800">
                  {res.totalObtained} <span className="text-slate-400 font-normal">/ {res.totalMax}</span>
                </td>
                <td className="py-3.5 px-4 font-bold text-indigo-600">
                  {res.percentage}%
                </td>
                <td className="py-3.5 px-4">
                  <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-bold">
                    {res.overallGrade} ({res.gpa} GPA)
                  </span>
                </td>
                <td className="py-3.5 px-4">
                  <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                    res.passStatus === 'Pass' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                  }`}>
                    {res.passStatus}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-right">
                  <div className="inline-flex items-center space-x-1">
                    <button
                      onClick={() => setSelectedResultForPrint(res)}
                      className="px-3 py-1 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold rounded-lg text-xs flex items-center gap-1 cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Report Card</span>
                    </button>

                    {canManageExams && (
                      <button
                        onClick={() => {
                          const std = students.find(s => s.id === res.studentId);
                          if (std) handleOpenMarksEntry(std);
                        }}
                        className="px-2.5 py-1 text-indigo-600 hover:bg-indigo-50 font-semibold rounded-lg text-xs"
                      >
                        Edit Marks
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Marks Entry Modal */}
      {isEntryOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 space-y-4 border border-slate-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-800 text-sm">Enter Subject Assessment Marks</h3>
                <p className="text-[11px] text-slate-400">{activeExam.title}</p>
              </div>
              <button onClick={() => setIsEntryOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMarks} className="space-y-4 text-xs">
              <div className="space-y-2.5">
                {activeExam.subjects.map(sub => (
                  <div key={sub.subjectId} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                    <div>
                      <p className="font-bold text-slate-800">{sub.subjectName}</p>
                      <p className="text-[11px] text-slate-400">Max Marks: {sub.maxMarks} (Pass: {sub.passingMarks})</p>
                    </div>
                    <div className="w-28">
                      <input
                        type="number"
                        min={0}
                        max={sub.maxMarks}
                        required
                        value={entryMarks[sub.subjectId] || 0}
                        onChange={e => setEntryMarks({ ...entryMarks, [sub.subjectId]: Number(e.target.value) })}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg font-bold text-slate-800 text-right"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Teacher Remarks & AI Generator */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-slate-700">Teacher Evaluation Remarks</label>
                  <button
                    type="button"
                    onClick={handleGenerateAiRemarks}
                    disabled={isGeneratingRemarks}
                    className="text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1 cursor-pointer disabled:opacity-50"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                    <span>{isGeneratingRemarks ? 'Gemini Generating...' : 'Auto-Generate Remarks'}</span>
                  </button>
                </div>
                <textarea
                  rows={3}
                  value={teacherRemarks}
                  onChange={e => setTeacherRemarks(e.target.value)}
                  placeholder="Personalized remarks regarding conceptual clarity and effort..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEntryOpen(false)}
                  className="px-4 py-2 text-slate-600 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md cursor-pointer"
                >
                  Submit Official Marks
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Official Report Card Printable Modal */}
      {selectedResultForPrint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between no-print bg-slate-50">
              <span className="font-bold text-slate-800 text-sm">Official Academic Transcript & Report Card</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Report Card</span>
                </button>
                <button onClick={() => setSelectedResultForPrint(null)} className="p-1 text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Report Card Body */}
            <div className="p-8 print-area text-slate-900 text-xs space-y-6">
              {/* Header */}
              <div className="text-center border-b-2 border-slate-900/40 pb-4">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <School className="w-6 h-6 text-indigo-900" />
                  <h2 className="text-lg font-black uppercase text-indigo-950">Apex Academy of Excellence</h2>
                </div>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">
                  Official Academic Performance Transcript • Fall 2026-2027
                </p>
                <div className="mt-2 inline-block px-3 py-0.5 bg-indigo-950 text-white rounded text-[11px] font-bold">
                  {selectedResultForPrint.examTitle}
                </div>
              </div>

              {/* Student Metadata */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-400 text-[10px] block">Student Name:</span>
                  <span className="font-bold">{selectedResultForPrint.studentName}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">Admission No:</span>
                  <span className="font-bold font-mono">{selectedResultForPrint.admissionNo}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">Grade & Section:</span>
                  <span className="font-semibold">{selectedResultForPrint.className} ({selectedResultForPrint.sectionName})</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">Class Rank:</span>
                  <span className="font-bold text-indigo-700">Position #{selectedResultForPrint.rank || 1}</span>
                </div>
              </div>

              {/* Subject Scores Table */}
              <table className="w-full text-left border border-slate-300">
                <thead className="bg-slate-100 border-b border-slate-300 text-[10px] font-bold uppercase text-slate-700">
                  <tr>
                    <th className="p-2 border-r border-slate-300">Subject</th>
                    <th className="p-2 border-r border-slate-300 text-center">Max Marks</th>
                    <th className="p-2 border-r border-slate-300 text-center">Marks Obtained</th>
                    <th className="p-2 text-center">Grade</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {selectedResultForPrint.marks.map((m, idx) => (
                    <tr key={idx}>
                      <td className="p-2 font-semibold border-r border-slate-200">{m.subjectName}</td>
                      <td className="p-2 text-center font-mono border-r border-slate-200">{m.maxMarks}</td>
                      <td className="p-2 text-center font-bold font-mono border-r border-slate-200">{m.marksObtained}</td>
                      <td className="p-2 text-center font-bold text-indigo-700">{m.grade}</td>
                    </tr>
                  ))}
                  <tr className="bg-slate-50 font-bold border-t-2 border-slate-400">
                    <td className="p-2 border-r border-slate-200">Total Aggregate</td>
                    <td className="p-2 text-center font-mono border-r border-slate-200">{selectedResultForPrint.totalMax}</td>
                    <td className="p-2 text-center font-mono border-r border-slate-200">{selectedResultForPrint.totalObtained}</td>
                    <td className="p-2 text-center text-emerald-700">{selectedResultForPrint.percentage}% ({selectedResultForPrint.overallGrade})</td>
                  </tr>
                </tbody>
              </table>

              {/* Remarks Box */}
              <div className="space-y-2">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="font-bold text-slate-700">Class Incharge Teacher Remarks:</span>
                  <p className="mt-1 italic text-slate-600">"{selectedResultForPrint.teacherRemarks || 'Consistent performance and enthusiastic participation.'}"</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="font-bold text-slate-700">Principal's Observation:</span>
                  <p className="mt-1 italic text-slate-600">"{selectedResultForPrint.principalRemarks}"</p>
                </div>
              </div>

              {/* Signatures */}
              <div className="pt-10 flex justify-between text-center text-xs">
                <div className="space-y-1">
                  <div className="w-32 border-b border-slate-400 mx-auto" />
                  <p className="font-bold">Class Incharge</p>
                </div>
                <div className="space-y-1">
                  <div className="w-32 border-b border-slate-400 mx-auto" />
                  <p className="font-bold">Examination Controller</p>
                </div>
                <div className="space-y-1">
                  <div className="w-32 border-b border-slate-400 mx-auto" />
                  <p className="font-bold">Prof. Marcus Holloway</p>
                  <p className="text-[10px] text-slate-400">Principal</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
