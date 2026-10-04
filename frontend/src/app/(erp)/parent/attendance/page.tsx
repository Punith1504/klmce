"use client";

import React from 'react';
import { CalendarCheck, ShieldAlert } from 'lucide-react';

export default function ParentAttendance() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto p-6 lg:p-8 font-sans text-white">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-50 flex items-center gap-3 mb-2">
            <CalendarCheck className="w-7 h-7 text-indigo-400"/> Attendance Tracker
          </h1>
          <p className="text-slate-400 text-sm">Monitor daily absences and subject-wise attendance thresholds.</p>
        </div>
      </div>

      <div className="bg-[#221F32]/80 backdrop-blur rounded-2xl border border-white/10 shadow-lg overflow-hidden">
        <div className="p-6 border-b border-white/10 bg-black/20">
            <h2 className="text-lg font-bold text-slate-50">Subject-wise Breakdown</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-400 uppercase bg-black/40 border-b border-white/10">
              <tr>
                <th className="px-6 py-4 font-semibold">Subject</th>
                <th className="px-6 py-4 font-semibold">Classes Conducted</th>
                <th className="px-6 py-4 font-semibold">Attended</th>
                <th className="px-6 py-4 font-semibold">Percentage</th>
                <th className="px-6 py-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
                <tr className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-300">Database Management Systems</td>
                  <td className="px-6 py-4 text-slate-300">42</td>
                  <td className="px-6 py-4 text-slate-300">37</td>
                  <td className="px-6 py-4 font-bold text-emerald-400">88.1%</td>
                  <td className="px-6 py-4"><span className="text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded text-xs font-bold border border-emerald-500/20">Healthy</span></td>
                </tr>
                <tr className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-300">Operating Systems</td>
                  <td className="px-6 py-4 text-slate-300">40</td>
                  <td className="px-6 py-4 text-slate-300">29</td>
                  <td className="px-6 py-4 font-bold text-amber-400">72.5%</td>
                  <td className="px-6 py-4"><span className="text-amber-400 bg-amber-500/10 px-2 py-1 rounded text-xs font-bold border border-amber-500/20 flex items-center w-max gap-1"><ShieldAlert className="w-3 h-3"/> Warning</span></td>
                </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
