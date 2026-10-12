"use client";

import React, { useState } from 'react';
import { Users, AlertTriangle, CheckCircle2, MessageSquare, PhoneCall, ShieldAlert, Award } from 'lucide-react';
import { STUDENTS, FACULTY } from '@/lib/syntheticData';

export default function FacultyMentoring() {
  const mentor = FACULTY[5]; // Dr. P. Radha Krishna
  const mentees = STUDENTS.slice(0, 8);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [counselingNotes, setCounselingNotes] = useState('');

  const atRiskCount = mentees.filter(m => m.attendance_pct < 75 || m.status === 'Warning').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 font-sans text-white">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-50 flex items-center gap-3 mb-1">
            <Users className="w-8 h-8 text-indigo-400"/> Faculty Mentoring & Student Counseling
          </h1>
          <p className="text-slate-400 text-sm">
            Assigned Student Ward Group • Mentor: <strong className="text-slate-200">{mentor.name}</strong> ({mentor.department})
          </p>
        </div>

        <button
          onClick={() => alert("Dispatching attendance status SMS to all ward parents...")}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg transition"
        >
          Send Ward Group SMS Report
        </button>
      </div>

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#1f1b30]/80 rounded-2xl p-6 border border-white/10 shadow-lg">
          <p className="text-xs text-slate-400 uppercase font-semibold">Total Assigned Mentees</p>
          <h3 className="text-3xl font-bold text-white mt-1">{mentees.length} Students</h3>
          <p className="text-xs text-indigo-400 mt-2">B.Tech CSE & AI-DS Batches</p>
        </div>

        <div className="bg-[#1f1b30]/80 rounded-2xl p-6 border border-white/10 shadow-lg">
          <p className="text-xs text-slate-400 uppercase font-semibold">Academic Standing Average</p>
          <h3 className="text-3xl font-bold text-emerald-400 mt-1">8.74 CGPA</h3>
          <p className="text-xs text-emerald-300 mt-2">6 students in First Class Distinction</p>
        </div>

        <div className="bg-[#1f1b30]/80 rounded-2xl p-6 border border-white/10 shadow-lg">
          <p className="text-xs text-slate-400 uppercase font-semibold">Mentees Requiring Intervention</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-bold text-rose-400">{atRiskCount} at Risk</span>
            <span className="text-xs text-rose-300">(&lt; 75% attendance)</span>
          </div>
          <p className="text-xs text-slate-500 mt-2">Academic condonation risk trigger</p>
        </div>
      </div>

      {/* Mentoring Roster Table */}
      <div className="bg-[#1f1b30]/80 rounded-3xl border border-white/10 p-6 shadow-xl space-y-4">
        <div className="flex justify-between items-center border-b border-white/10 pb-4">
          <h2 className="text-lg font-bold text-white">Mentee Roster & Risk Assessment</h2>
          <span className="text-xs text-slate-400 font-mono">Academic Year 2026-27</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-xs uppercase text-slate-400 border-b border-white/10">
                <th className="pb-3 px-4">Student</th>
                <th className="pb-3 px-4">Roll Number</th>
                <th className="pb-3 px-4">Attendance</th>
                <th className="pb-3 px-4">CGPA</th>
                <th className="pb-3 px-4">Parent / Contact</th>
                <th className="pb-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm">
              {mentees.map((student) => {
                const isShortage = student.attendance_pct < 75;

                return (
                  <tr key={student.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 px-4">
                      <p className="font-semibold text-white">{student.name}</p>
                      <p className="text-xs text-slate-400">{student.region}, AP</p>
                    </td>
                    <td className="py-4 px-4 font-mono text-indigo-300 text-xs font-bold">{student.rollNo}</td>
                    <td className="py-4 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        isShortage 
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' 
                          : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      }`}>
                        {student.attendance_pct}%
                      </span>
                    </td>
                    <td className="py-4 px-4 font-bold text-slate-100">{student.cgpa}</td>
                    <td className="py-4 px-4 text-xs text-slate-300">
                      <p className="font-medium text-slate-200">{student.parentName}</p>
                      <p className="text-slate-400 font-mono">{student.parentPhone}</p>
                    </td>
                    <td className="py-4 px-4 text-right space-x-2">
                      <button
                        onClick={() => setSelectedStudent(student)}
                        className="px-3 py-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/40 border border-indigo-500/30 text-indigo-300 text-xs font-semibold"
                      >
                        Counsel
                      </button>
                      <a
                        href={`tel:${student.parentPhone}`}
                        className="inline-block px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-xs font-semibold"
                      >
                        Call Parent
                      </a>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Counseling Log Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-[#19152b] border-t sm:border border-white/15 rounded-t-3xl sm:rounded-3xl p-5 sm:p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl relative text-left pb-8 sm:pb-8">
            <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-4 sm:hidden" />
            <h3 className="text-xl font-bold text-white mb-1">Log Mentoring & Counseling Session</h3>
            <p className="text-xs text-slate-400 mb-6">Student: {selectedStudent.name} ({selectedStudent.rollNo})</p>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Discussion Notes & Action Plan</label>
                <textarea
                  rows={4}
                  value={counselingNotes}
                  onChange={(e) => setCounselingNotes(e.target.value)}
                  placeholder="Record discussions on attendance improvement, mid-exam preparation, placement training..."
                  className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-base sm:text-sm text-white placeholder-slate-500 outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setSelectedStudent(null)}
                className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  alert(`Counseling note for ${selectedStudent.name} saved and synced to student profile.`);
                  setSelectedStudent(null);
                  setCounselingNotes('');
                }}
                className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg"
              >
                Save Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
