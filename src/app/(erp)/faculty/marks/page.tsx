"use client";

import React, { useState } from 'react';
import { Award, Lock, FileSpreadsheet, Upload, CheckCircle2, AlertTriangle, Download, Save } from 'lucide-react';
import { STUDENTS, COURSES } from '@/lib/syntheticData';

interface StudentMark {
  rollNo: string;
  name: string;
  mid1: number | string;
  assignment: number | string;
  quiz: number | string;
}

export default function FacultyMarks() {
  const [selectedCourse, setSelectedCourse] = useState(COURSES?.[0]?.code || "20A05301T");
  const [selectedSection, setSelectedSection] = useState("CSE-A (IV Year)");
  const [assessmentType, setAssessmentType] = useState("Mid-Term I (30 Marks)");
  const [workflowStatus, setWorkflowStatus] = useState<"Draft" | "Submitted" | "HOD Verified" | "Locked">("Draft");
  const [saveMessage, setSaveMessage] = useState("");

  const initialMarks: StudentMark[] = (STUDENTS || []).slice(0, 10).map((stu, idx) => ({
    rollNo: stu.rollNo,
    name: stu.name,
    mid1: idx === 5 ? "AB" : Math.min(30, Math.floor(22 + (stu.cgpa * 0.8))),
    assignment: Math.min(10, Math.floor(7 + (stu.cgpa * 0.3))),
    quiz: Math.min(10, Math.floor(6 + (stu.cgpa * 0.4)))
  }));

  const [marks, setMarks] = useState<StudentMark[]>(initialMarks);

  const handleMarkChange = (rollNo: string, field: keyof StudentMark, value: string) => {
    setMarks(prev => prev.map(m => m.rollNo === rollNo ? { ...m, [field]: value } : m));
    setSaveMessage("");
  };

  const handleSaveDraft = () => {
    setSaveMessage("Draft internal assessment saved successfully!");
    setTimeout(() => setSaveMessage(""), 4000);
  };

  const handleSubmitHOD = () => {
    setWorkflowStatus("Submitted");
    setSaveMessage("Assessment sheet forwarded to HoD (Dr. V. Lokeswara Reddy) for verification!");
    setTimeout(() => setSaveMessage(""), 5000);
  };

  const computeTotal = (m: StudentMark) => {
    if (m.mid1 === "AB") return "AB";
    const mid = Number(m.mid1) || 0;
    const ass = Number(m.assignment) || 0;
    const qz = Number(m.quiz) || 0;
    // Internal weightage: 30 Mid + 10 Assignment + 10 Quiz = 50 scaled to 30
    return Math.round((mid * 0.6) + (ass + qz) * 0.7);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 font-sans text-white">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-50 flex items-center gap-3 mb-2">
            <Award className="w-7 h-7 text-indigo-400"/> Marks Entry & Results Assessment
          </h1>
          <p className="text-slate-400 text-sm">
            Autonomous Continuous Internal Evaluation (CIE) lock and HoD verification workflow.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => alert("Downloaded CIE Roster CSV for Examination Cell upload")}
            className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl text-xs font-semibold transition border border-white/10 flex items-center gap-2">
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>

      {/* Assessment Selector */}
      <div className="bg-[#221F32]/80 backdrop-blur rounded-2xl p-4 sm:p-6 border border-white/10 shadow-lg grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Course & Branch</label>
          <select 
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-slate-200 outline-none focus:border-indigo-500 transition">
            {COURSES.map(c => (
              <option key={c.code} value={c.code}>{c.title} ({c.code})</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Section & Semester</label>
          <select 
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-slate-200 outline-none focus:border-indigo-500 transition">
            <option value="CSE-A (IV Year)">CSE-A (IV Year - Sem 7)</option>
            <option value="CSE-B (IV Year)">CSE-B (IV Year - Sem 7)</option>
            <option value="ECE-A (III Year)">ECE-A (III Year - Sem 5)</option>
            <option value="AI&DS (II Year)">AI&DS (II Year - Sem 3)</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Assessment Scheme</label>
          <select 
            value={assessmentType}
            onChange={(e) => setAssessmentType(e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-slate-200 outline-none focus:border-indigo-500 transition">
            <option>Mid-Term I (30 Marks)</option>
            <option>Mid-Term II (30 Marks)</option>
            <option>Continuous Evaluation / Assignment (10 Marks)</option>
            <option>End-Semester Lab Internal (25 Marks)</option>
          </select>
        </div>
      </div>

      {/* Workflow Status Tracker */}
      <div className="grid grid-cols-4 gap-2 p-3 bg-black/30 rounded-xl border border-white/10">
        {[
          { label: "Draft", active: workflowStatus === "Draft" || workflowStatus === "Submitted" || workflowStatus === "HOD Verified" || workflowStatus === "Locked" },
          { label: "Submitted", active: workflowStatus === "Submitted" || workflowStatus === "HOD Verified" || workflowStatus === "Locked" },
          { label: "HOD Verified", active: workflowStatus === "HOD Verified" || workflowStatus === "Locked" },
          { label: "Locked", active: workflowStatus === "Locked" }
        ].map((step, idx) => (
          <div 
            key={step.label}
            className={`text-center py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              step.active 
                ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40' 
                : 'text-slate-600 bg-black/10'
            }`}>
            {step.label === "Locked" && <Lock className="w-3 h-3 inline" />}
            {idx + 1}. {step.label}
          </div>
        ))}
      </div>

      {/* Marks Entry Grid */}
      <div className="bg-[#221F32]/80 backdrop-blur rounded-2xl border border-white/10 shadow-lg overflow-hidden">
        <div className="p-4 border-b border-white/10 bg-black/20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <h2 className="text-base font-bold text-slate-100">
              Student Roster & Internal Marks ({marks.length} Students)
            </h2>
            <p className="text-xs text-slate-400">Section {selectedSection} • Maximum Mid-Term Score: 30</p>
          </div>
          {saveMessage && (
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg animate-fade-in">
              <CheckCircle2 className="w-4 h-4" /> {saveMessage}
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-400 uppercase bg-black/40 border-b border-white/10">
              <tr>
                <th className="px-6 py-4 font-semibold">Roll Number</th>
                <th className="px-6 py-4 font-semibold">Student Name</th>
                <th className="px-4 py-4 font-semibold text-center">Descriptive (Max: 30)</th>
                <th className="px-4 py-4 font-semibold text-center">Assignment (Max: 10)</th>
                <th className="px-4 py-4 font-semibold text-center">Quiz (Max: 10)</th>
                <th className="px-4 py-4 font-semibold text-center">Scaled Total (30)</th>
                <th className="px-6 py-4 font-semibold text-center">Audit Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {marks.map((student) => {
                const total = computeTotal(student);
                const isAbsent = student.mid1 === "AB";
                const isBelowThreshold = typeof total === "number" && total < 14;

                return (
                  <tr key={student.rollNo} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 font-mono font-medium text-indigo-300">{student.rollNo}</td>
                    <td className="px-6 py-4 text-slate-200 font-medium">{student.name}</td>
                    
                    <td className="px-4 py-4 text-center">
                      <input 
                        type="text" 
                        value={student.mid1}
                        onChange={(e) => handleMarkChange(student.rollNo, 'mid1', e.target.value)}
                        className={`w-20 bg-black/50 border rounded-md px-2 py-1.5 outline-none transition text-center font-bold text-base sm:text-sm ${
                          isAbsent ? 'border-red-500/50 text-red-400' : 'border-white/10 text-slate-200 focus:border-indigo-500'
                        }`}
                      />
                    </td>

                    <td className="px-4 py-4 text-center">
                      <input 
                        type="text" 
                        value={student.assignment}
                        onChange={(e) => handleMarkChange(student.rollNo, 'assignment', e.target.value)}
                        className="w-16 bg-black/50 border border-white/10 rounded-md px-2 py-1.5 outline-none transition text-center font-semibold text-base sm:text-sm text-slate-200 focus:border-indigo-500"
                      />
                    </td>

                    <td className="px-4 py-4 text-center">
                      <input 
                        type="text" 
                        value={student.quiz}
                        onChange={(e) => handleMarkChange(student.rollNo, 'quiz', e.target.value)}
                        className="w-16 bg-black/50 border border-white/10 rounded-md px-2 py-1.5 outline-none transition text-center font-semibold text-base sm:text-sm text-slate-200 focus:border-indigo-500"
                      />
                    </td>

                    <td className="px-4 py-4 text-center">
                      <span className={`text-base font-bold ${isAbsent ? 'text-rose-400' : isBelowThreshold ? 'text-amber-400' : 'text-emerald-400'}`}>
                        {total}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-center">
                      {isAbsent ? (
                        <span className="text-red-400 bg-red-500/10 px-2.5 py-1 rounded text-xs font-bold border border-red-500/20">
                          ABSENT
                        </span>
                      ) : isBelowThreshold ? (
                        <span className="text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded text-xs font-bold border border-amber-500/20">
                          RE-EXAM REQD
                        </span>
                      ) : (
                        <span className="text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded text-xs font-bold border border-emerald-500/20">
                          VERIFIED
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-white/10 bg-black/20 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-xs text-slate-400">
            <FileSpreadsheet className="w-4 h-4 inline mr-1 text-emerald-400"/> Automatic internal normalization enabled
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            <button 
              onClick={handleSaveDraft}
              className="w-full sm:w-auto justify-center min-h-[44px] bg-white/10 hover:bg-white/20 text-white px-5 py-2.5 rounded-xl text-xs font-semibold transition border border-white/10 flex items-center gap-1.5">
              <Save className="w-3.5 h-3.5" /> Save Draft
            </button>
            <button 
              onClick={handleSubmitHOD}
              className="w-full sm:w-auto justify-center min-h-[44px] bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-xl text-xs font-bold transition shadow-[0_4px_14px_0_rgba(79,70,229,0.39)]">
              Submit for HOD Verification
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
