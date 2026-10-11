"use client";

import React from 'react';
import { Briefcase, FileCheck, ShieldAlert } from 'lucide-react';

export default function FacultyHR() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 font-sans text-white">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-50 flex items-center gap-3 mb-2">
            <Briefcase className="w-6 h-6 sm:w-7 sm:h-7 text-indigo-400"/> HR & Workload
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm">Manage your leave, substitutions, and view workload mapping.</p>
        </div>
        <button className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 min-h-[44px] rounded-xl text-sm font-semibold transition shadow-[0_4px_14px_0_rgba(79,70,229,0.39)] flex items-center justify-center">
            Apply Leave / OD
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#221F32]/80 backdrop-blur rounded-2xl border border-white/10 shadow-lg overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-white/10 bg-black/20">
                <h2 className="text-base sm:text-lg font-bold text-slate-50">Workload Allocation</h2>
            </div>
            <div className="p-4 sm:p-6 space-y-4">
                <div className="flex justify-between items-center border-b border-white/10 pb-3">
                    <span className="text-slate-400 font-medium text-sm">Theory Hours</span>
                    <span className="font-bold text-indigo-400 text-sm">12 hrs/week</span>
                </div>
                <div className="flex justify-between items-center border-b border-white/10 pb-3">
                    <span className="text-slate-400 font-medium text-sm">Lab Hours</span>
                    <span className="font-bold text-emerald-400 text-sm">6 hrs/week</span>
                </div>
                <div className="flex justify-between items-center pb-1">
                    <span className="text-slate-400 font-medium text-sm">Mentoring</span>
                    <span className="font-bold text-amber-400 text-sm">2 hrs/week</span>
                </div>
            </div>
        </div>

        <div className="bg-[#221F32]/80 backdrop-blur rounded-2xl border border-white/10 shadow-lg overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-white/10 bg-black/20">
                <h2 className="text-base sm:text-lg font-bold text-slate-50">Pending Actions</h2>
            </div>
            <div className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row gap-4 items-start bg-sky-500/10 p-4 rounded-xl border border-sky-500/20">
                    <ShieldAlert className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
                    <div className="flex-1 w-full">
                    <p className="font-bold text-slate-50 text-sm">Substitution Request</p>
                    <p className="text-xs text-slate-400 mt-1">Prof. Varma requested you to substitute DBMS on Thursday (10:40 AM).</p>
                    <div className="mt-3 flex gap-2 w-full sm:w-auto">
                        <button className="flex-1 sm:flex-initial text-xs bg-emerald-500/20 text-emerald-400 px-4 py-2 min-h-[38px] rounded-lg font-bold border border-emerald-500/30 hover:bg-emerald-500/30 transition">Accept</button>
                        <button className="flex-1 sm:flex-initial text-xs bg-red-500/20 text-red-400 px-4 py-2 min-h-[38px] rounded-lg font-bold border border-red-500/30 hover:bg-red-500/30 transition">Decline</button>
                    </div>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
