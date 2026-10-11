"use client";

import React, { useState } from 'react';
import { PenTool, Plus, CheckCircle, Clock, Users, ArrowUpRight, FileText, X } from 'lucide-react';

const ASSIGNMENTS = [
  {
    id: "asn-1",
    title: "Assignment 1: Relational Schema & ER Diagrams",
    course: "Database Management Systems",
    section: "CSE-B (IV Sem)",
    submitted: 54,
    total: 60,
    dueDate: "15 Oct 2026",
    maxMarks: 10,
    status: "Active"
  },
  {
    id: "asn-2",
    title: "Lab Assessment: Multi-Threading in C/C++",
    course: "Operating Systems",
    section: "CSE-A (IV Sem)",
    submitted: 60,
    total: 62,
    dueDate: "12 Oct 2026",
    maxMarks: 15,
    status: "Grading in Progress"
  },
  {
    id: "asn-3",
    title: "Quiz 2: Distributed Consensus & Raft",
    course: "Cloud Computing",
    section: "CSE-B (VII Sem)",
    submitted: 58,
    total: 58,
    dueDate: "05 Oct 2026",
    maxMarks: 20,
    status: "Completed"
  }
];

export default function FacultyAssessments() {
  const [showModal, setShowModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCourse, setNewCourse] = useState("DBMS");
  const [newMaxMarks, setNewMaxMarks] = useState("10");
  const [newDueDate, setNewDueDate] = useState("2026-10-25");
  const [assessments, setAssessments] = useState(ASSIGNMENTS);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const item = {
      id: `asn-${Date.now()}`,
      title: newTitle,
      course: newCourse,
      section: "CSE-A (IV Sem)",
      submitted: 0,
      total: 60,
      dueDate: newDueDate,
      maxMarks: Number(newMaxMarks),
      status: "Active"
    };
    setAssessments([item, ...assessments]);
    setNewTitle("");
    setShowModal(false);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 font-sans text-white">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-50 flex items-center gap-3 mb-2">
            <PenTool className="w-6 h-6 sm:w-7 sm:h-7 text-indigo-400"/> Assessments & Submissions
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm">Create quizzes, assignments, and evaluate student submissions.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 min-h-[44px] rounded-xl text-sm font-semibold transition shadow-[0_4px_14px_0_rgba(79,70,229,0.39)] flex items-center justify-center gap-2">
          <Plus className="w-4 h-4" /> New Assignment
        </button>
      </div>

      <div className="bg-[#221F32]/80 backdrop-blur rounded-2xl border border-white/10 shadow-lg overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-white/10 bg-black/20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <h2 className="text-base sm:text-lg font-bold text-slate-50">Active & Past Assessments</h2>
          <span className="text-xs text-slate-400">{assessments.length} total assessments</span>
        </div>
        <div className="divide-y divide-white/10">
          {assessments.map((a) => {
            const pct = Math.round((a.submitted / a.total) * 100);
            return (
              <div key={a.id} className="p-4 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-white/5 transition-colors">
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full border ${
                      a.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                      a.status === 'Completed' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' :
                      'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    }`}>
                      {a.status}
                    </span>
                    <span className="text-xs text-slate-400">{a.course} • {a.section}</span>
                  </div>
                  <h4 className="text-slate-100 font-semibold text-base sm:text-lg leading-snug">{a.title}</h4>
                  <div className="flex items-center gap-4 text-xs text-slate-400 pt-1">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-500" /> Due: {a.dueDate}
                    </span>
                    <span>Max Marks: <strong className="text-slate-200">{a.maxMarks}</strong></span>
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-4 border-t md:border-t-0 pt-3 md:pt-0 border-white/5">
                  <div className="text-left md:text-right">
                    <p className="font-bold text-sm sm:text-base text-emerald-400">{a.submitted}/{a.total} Submitted</p>
                    <p className="text-[11px] text-slate-400">{pct}% completion rate</p>
                  </div>
                  <button 
                    onClick={() => alert(`Reviewing submissions for ${a.title}`)}
                    className="min-h-[44px] bg-white/5 hover:bg-white/10 border border-white/10 text-white px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition">
                    Evaluate <ArrowUpRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* New Assignment Bottom Sheet / Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="w-full max-w-lg bg-[#181428] border-t sm:border border-white/15 rounded-t-3xl sm:rounded-3xl p-5 sm:p-8 max-h-[90vh] overflow-y-auto">
            <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-4 sm:hidden" />
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-slate-100">Create New Assessment</h3>
              <button 
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-white/5">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Assignment Title</label>
                <input 
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Unit 3 - B-Trees & Indexing Homework"
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-base sm:text-sm text-slate-200 outline-none focus:border-indigo-500 transition"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Course</label>
                  <select 
                    value={newCourse}
                    onChange={(e) => setNewCourse(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-base sm:text-sm text-slate-200 outline-none focus:border-indigo-500 transition">
                    <option value="Database Management Systems">Database Management Systems</option>
                    <option value="Operating Systems">Operating Systems</option>
                    <option value="Cloud Computing">Cloud Computing</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Max Score</label>
                  <input 
                    type="number"
                    value={newMaxMarks}
                    onChange={(e) => setNewMaxMarks(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-base sm:text-sm text-slate-200 outline-none focus:border-indigo-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Due Date</label>
                <input 
                  type="date"
                  value={newDueDate}
                  onChange={(e) => setNewDueDate(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-base sm:text-sm text-slate-200 outline-none focus:border-indigo-500 transition [color-scheme:dark]"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 min-h-[44px] bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 rounded-xl text-sm font-semibold transition">
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 min-h-[44px] bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold transition shadow-lg shadow-indigo-600/30">
                  Publish Assessment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
