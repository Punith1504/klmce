"use client";

import React from 'react';
import { Award, Lock, FileSpreadsheet, Upload } from 'lucide-react';

export default function FacultyMarks() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto p-6 lg:p-8 font-sans text-white">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-50 flex items-center gap-3 mb-2">
            <Award className="w-7 h-7 text-indigo-400"/> Marks Entry & Results
          </h1>
          <p className="text-slate-400 text-sm">Internal assessment entry, verification, and lock workflow.</p>
        </div>
      </div>

      {/* Assessment Selector */}
      <div className="bg-[#221F32]/80 backdrop-blur rounded-2xl p-6 border border-white/10 shadow-lg grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Course & Section</label>
          <select className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-slate-200 outline-none focus:border-indigo-500 transition">
            <option>Database Management Systems (CSE-B)</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Assessment Scheme</label>
          <select className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-slate-200 outline-none focus:border-indigo-500 transition">
            <option>Mid-Term I (30 Marks)</option>
            <option>Mid-Term II (30 Marks)</option>
            <option>Assignment 1 (10 Marks)</option>
          </select>
        </div>
        <div className="flex items-end gap-3">
          <button className="bg-white/10 hover:bg-white/20 text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition border border-white/10 flex-1">
            Load Sheet
          </button>
          <button className="bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 hover:bg-indigo-500/30 px-4 py-2.5 rounded-lg text-sm font-semibold transition flex items-center gap-2">
            <Upload className="w-4 h-4" /> Import
          </button>
        </div>
      </div>

      {/* Workflow Status */}
      <div className="flex gap-4 items-center p-4 bg-black/30 rounded-xl border border-white/10">
        <div className="flex-1 text-center border-r border-white/10">
          <p className="text-emerald-400 font-bold text-sm">Draft</p>
        </div>
        <div className="flex-1 text-center border-r border-white/10 opacity-50">
          <p className="text-slate-400 font-bold text-sm">Submitted</p>
        </div>
        <div className="flex-1 text-center border-r border-white/10 opacity-50">
          <p className="text-slate-400 font-bold text-sm">HOD Verified</p>
        </div>
        <div className="flex-1 text-center opacity-50">
          <p className="text-slate-400 font-bold text-sm flex justify-center items-center gap-2"><Lock className="w-3 h-3"/> Locked</p>
        </div>
      </div>

      {/* Marks Entry Grid */}
      <div className="bg-[#221F32]/80 backdrop-blur rounded-2xl border border-white/10 shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-400 uppercase bg-black/40 border-b border-white/10">
              <tr>
                <th className="px-6 py-4 font-semibold w-1/4">Roll Number</th>
                <th className="px-6 py-4 font-semibold w-1/3">Student Name</th>
                <th className="px-6 py-4 font-semibold w-1/4">Marks Obtained (Max: 30)</th>
                <th className="px-6 py-4 font-semibold text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {[
                { roll: "24C01A0501", name: "Aarav Sharma", mark: "28" },
                { roll: "24C01A0502", name: "Priya Patel", mark: "25" },
                { roll: "24C01A0503", name: "Rahul Verma", mark: "AB", error: true },
              ].map((student, i) => (
                <tr key={i} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-300">{student.roll}</td>
                  <td className="px-6 py-4 text-slate-300">{student.name}</td>
                  <td className="px-6 py-4">
                    <input 
                      type="text" 
                      defaultValue={student.mark}
                      className={`w-24 bg-black/50 border rounded-md px-3 py-1.5 outline-none transition text-center font-semibold ${student.error ? 'border-red-500/50 text-red-400' : 'border-white/10 text-slate-200 focus:border-indigo-500'}`}
                    />
                  </td>
                  <td className="px-6 py-4 text-center">
                    {student.error ? (
                       <span className="text-red-400 bg-red-500/10 px-2 py-1 rounded text-xs font-bold border border-red-500/20">ABSENT</span>
                    ) : (
                       <span className="text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded text-xs font-bold border border-emerald-500/20">VALID</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-white/10 bg-black/20 flex justify-between items-center">
          <p className="text-xs text-slate-400"><FileSpreadsheet className="w-4 h-4 inline mr-1"/> Auto-saved 2 mins ago</p>
          <button className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-xl text-sm font-semibold transition shadow-[0_4px_14px_0_rgba(79,70,229,0.39)]">
            Submit for HOD Verification
          </button>
        </div>
      </div>
    </div>
  );
}
