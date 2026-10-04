"use client";

import React from 'react';
import { Users, AlertTriangle } from 'lucide-react';

export default function FacultyMentoring() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto p-6 lg:p-8 font-sans text-white">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-50 flex items-center gap-3 mb-2">
            <Users className="w-7 h-7 text-indigo-400"/> Mentoring Dashboard
          </h1>
          <p className="text-slate-400 text-sm">Monitor your assigned mentees, track risks, and provide guidance.</p>
        </div>
      </div>

      <div className="bg-[#221F32]/80 backdrop-blur rounded-2xl p-6 border border-white/10 shadow-lg">
        <div className="flex gap-4 items-start bg-amber-500/10 p-4 rounded-xl border border-amber-500/20 mb-6">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
            <p className="font-bold text-slate-50 text-sm">Risk List (Action Required)</p>
            <p className="text-xs text-slate-400 mt-1">5 students have attendance &lt; 75% or active backlogs.</p>
            </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-400 uppercase bg-black/40 border-b border-white/10">
              <tr>
                <th className="px-4 py-4 font-semibold">Roll Number</th>
                <th className="px-4 py-4 font-semibold">Student Name</th>
                <th className="px-4 py-4 font-semibold">Attendance</th>
                <th className="px-4 py-4 font-semibold">CGPA</th>
                <th className="px-4 py-4 font-semibold">Backlogs</th>
                <th className="px-4 py-4 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
                <tr className="hover:bg-white/5 transition-colors">
                  <td className="px-4 py-4 font-medium text-slate-300">24C01A0502</td>
                  <td className="px-4 py-4 text-slate-300">Priya Patel</td>
                  <td className="px-4 py-4 font-bold text-red-400">68%</td>
                  <td className="px-4 py-4 text-slate-300">8.2</td>
                  <td className="px-4 py-4 text-slate-300">0</td>
                  <td className="px-4 py-4"><button className="text-indigo-400 text-xs font-bold border border-indigo-400/30 px-3 py-1 rounded bg-indigo-500/10">Log Meeting</button></td>
                </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
