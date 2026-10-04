"use client";

import React from 'react';
import { User, Activity, AlertCircle, Banknote, CalendarCheck } from 'lucide-react';

export default function ParentDashboard() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto p-6 lg:p-8 font-sans text-white">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-50 flex items-center gap-3 mb-2">
            Parent Overview
          </h1>
          <p className="text-slate-400 text-sm">Monitor your ward's academic progress, attendance, and fee status.</p>
        </div>
      </div>

      <div className="bg-[#221F32]/80 backdrop-blur rounded-2xl p-6 border border-indigo-500/30 shadow-lg flex items-center gap-6">
         <div className="w-16 h-16 bg-indigo-500/20 text-indigo-400 rounded-full flex items-center justify-center border border-indigo-500/30">
            <User className="w-8 h-8" />
         </div>
         <div>
            <h2 className="text-xl font-bold text-slate-50">Aarav Sharma</h2>
            <p className="text-sm text-slate-400">Roll No: 24C01A0501 • B.Tech CSE (Year 3, Sem 5)</p>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#221F32]/80 backdrop-blur rounded-2xl p-6 border border-emerald-500/20 shadow-lg flex items-start gap-4">
          <div className="w-10 h-10 bg-emerald-500/20 text-emerald-400 rounded-xl flex items-center justify-center shrink-0">
            <CalendarCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Attendance</p>
            <h3 className="text-2xl font-bold text-emerald-400 mt-1">88.5%</h3>
            <p className="text-xs text-slate-400 mt-2">Safe • No Shortage Risk</p>
          </div>
        </div>

        <div className="bg-[#221F32]/80 backdrop-blur rounded-2xl p-6 border border-indigo-500/20 shadow-lg flex items-start gap-4">
          <div className="w-10 h-10 bg-indigo-500/20 text-indigo-400 rounded-xl flex items-center justify-center shrink-0">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Academics</p>
            <h3 className="text-2xl font-bold text-slate-50 mt-1">8.42 CGPA</h3>
            <p className="text-xs text-emerald-400 mt-2 font-bold">0 Active Backlogs</p>
          </div>
        </div>

        <div className="bg-[#221F32]/80 backdrop-blur rounded-2xl p-6 border border-amber-500/20 shadow-lg flex items-start gap-4">
          <div className="w-10 h-10 bg-amber-500/20 text-amber-400 rounded-xl flex items-center justify-center shrink-0">
            <Banknote className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Finance</p>
            <h3 className="text-2xl font-bold text-slate-50 mt-1">₹45,000</h3>
            <p className="text-xs text-amber-400 mt-2 font-bold">Due on 15 Oct 2026</p>
          </div>
        </div>
      </div>

      <div className="bg-[#221F32]/80 backdrop-blur rounded-2xl border border-white/10 shadow-lg overflow-hidden">
         <div className="p-6 border-b border-white/10 bg-black/20 flex gap-3 items-center">
            <AlertCircle className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-bold text-slate-50">Recent Alerts & Notices</h2>
         </div>
         <div className="divide-y divide-white/10">
            <div className="p-6 hover:bg-white/5 transition-colors">
                <p className="text-sm font-bold text-slate-50">Parent-Teacher Meeting Scheduled</p>
                <p className="text-xs text-slate-400 mt-1">A virtual PTM is scheduled for Oct 20th. Please check communication tab for link.</p>
            </div>
            <div className="p-6 hover:bg-white/5 transition-colors">
                <p className="text-sm font-bold text-emerald-400">Mid-Term I Results Published</p>
                <p className="text-xs text-slate-400 mt-1">The results for the recent internal examinations are now available in Academics.</p>
            </div>
         </div>
      </div>
    </div>
  );
}
