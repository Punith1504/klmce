"use client";

import React from 'react';
import { Users, Banknote, BookOpen, AlertTriangle } from 'lucide-react';

export default function AdminDashboard() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto p-6 lg:p-8 font-sans text-white">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-50 flex items-center gap-3 mb-2">
            Principal / Management Dashboard
          </h1>
          <p className="text-slate-400 text-sm">Institution-wide KPIs, financial oversight, and academic health.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-[#221F32]/80 backdrop-blur rounded-2xl p-6 border border-white/10 shadow-lg">
          <div className="flex items-center gap-4 mb-4">
             <div className="w-12 h-12 bg-indigo-500/20 text-indigo-400 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6" />
             </div>
             <div>
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Active Students</p>
                <h3 className="text-2xl font-bold text-slate-50">2,450</h3>
             </div>
          </div>
          <p className="text-xs text-emerald-400 font-bold">+120 Admissions this year</p>
        </div>

        <div className="bg-[#221F32]/80 backdrop-blur rounded-2xl p-6 border border-white/10 shadow-lg">
          <div className="flex items-center gap-4 mb-4">
             <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-xl flex items-center justify-center">
                <Banknote className="w-6 h-6" />
             </div>
             <div>
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Fee Collection</p>
                <h3 className="text-2xl font-bold text-slate-50">₹8.4 Cr</h3>
             </div>
          </div>
          <p className="text-xs text-amber-400 font-bold">₹1.2 Cr Pending Collection</p>
        </div>

        <div className="bg-[#221F32]/80 backdrop-blur rounded-2xl p-6 border border-white/10 shadow-lg">
          <div className="flex items-center gap-4 mb-4">
             <div className="w-12 h-12 bg-sky-500/20 text-sky-400 rounded-xl flex items-center justify-center">
                <BookOpen className="w-6 h-6" />
             </div>
             <div>
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Overall Pass %</p>
                <h3 className="text-2xl font-bold text-slate-50">84.5%</h3>
             </div>
          </div>
          <p className="text-xs text-emerald-400 font-bold">+2.1% from previous semester</p>
        </div>

        <div className="bg-[#221F32]/80 backdrop-blur rounded-2xl p-6 border border-rose-500/20 shadow-lg">
          <div className="flex items-center gap-4 mb-4">
             <div className="w-12 h-12 bg-rose-500/20 text-rose-400 rounded-xl flex items-center justify-center">
                <AlertTriangle className="w-6 h-6" />
             </div>
             <div>
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Attendance Risk</p>
                <h3 className="text-2xl font-bold text-slate-50">142</h3>
             </div>
          </div>
          <p className="text-xs text-rose-400 font-bold">Students below 65%</p>
        </div>
      </div>
    </div>
  );
}
