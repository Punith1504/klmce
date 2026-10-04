"use client";

import React from 'react';
import { Briefcase, FileCheck, ShieldAlert } from 'lucide-react';

export default function FacultyHR() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto p-6 lg:p-8 font-sans text-white">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-50 flex items-center gap-3 mb-2">
            <Briefcase className="w-7 h-7 text-indigo-400"/> HR & Workload
          </h1>
          <p className="text-slate-400 text-sm">Manage your leave, substitutions, and view workload mapping.</p>
        </div>
        <button className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-xl text-sm font-semibold transition shadow-[0_4px_14px_0_rgba(79,70,229,0.39)]">
            Apply Leave / OD
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#221F32]/80 backdrop-blur rounded-2xl border border-white/10 shadow-lg overflow-hidden">
            <div className="p-6 border-b border-white/10 bg-black/20">
                <h2 className="text-lg font-bold text-slate-50">Workload Allocation</h2>
            </div>
            <div className="p-6 space-y-4">
                <div className="flex justify-between items-center border-b border-white/10 pb-2">
                    <span className="text-slate-400 font-medium">Theory Hours</span>
                    <span className="font-bold text-indigo-400">12 hrs/week</span>
                </div>
                <div className="flex justify-between items-center border-b border-white/10 pb-2">
                    <span className="text-slate-400 font-medium">Lab Hours</span>
                    <span className="font-bold text-emerald-400">6 hrs/week</span>
                </div>
                <div className="flex justify-between items-center pb-2">
                    <span className="text-slate-400 font-medium">Mentoring</span>
                    <span className="font-bold text-amber-400">2 hrs/week</span>
                </div>
            </div>
        </div>

        <div className="bg-[#221F32]/80 backdrop-blur rounded-2xl border border-white/10 shadow-lg overflow-hidden">
            <div className="p-6 border-b border-white/10 bg-black/20">
                <h2 className="text-lg font-bold text-slate-50">Pending Actions</h2>
            </div>
            <div className="p-6">
                <div className="flex gap-4 items-start bg-sky-500/10 p-4 rounded-xl border border-sky-500/20">
                    <ShieldAlert className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
                    <div>
                    <p className="font-bold text-slate-50 text-sm">Substitution Request</p>
                    <p className="text-xs text-slate-400 mt-1">Prof. Varma requested you to substitute DBMS on Thursday (10:40 AM).</p>
                    <div className="mt-3 flex gap-2">
                        <button className="text-xs bg-emerald-500/20 text-emerald-400 px-3 py-1.5 rounded font-bold border border-emerald-500/30">Accept</button>
                        <button className="text-xs bg-red-500/20 text-red-400 px-3 py-1.5 rounded font-bold border border-red-500/30">Decline</button>
                    </div>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
