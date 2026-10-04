"use client";

import React from 'react';
import { Award, BookOpen } from 'lucide-react';

export default function ParentAcademics() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto p-6 lg:p-8 font-sans text-white">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-50 flex items-center gap-3 mb-2">
            <Award className="w-7 h-7 text-indigo-400"/> Academics & Results
          </h1>
          <p className="text-slate-400 text-sm">View published internal marks and semester grades.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#221F32]/80 backdrop-blur rounded-2xl border border-white/10 shadow-lg overflow-hidden">
            <div className="p-6 border-b border-white/10 bg-black/20 flex items-center gap-3">
                <BookOpen className="w-5 h-5 text-indigo-400" />
                <h2 className="text-lg font-bold text-slate-50">Mid-Term I Results (Sem 5)</h2>
            </div>
            <div className="p-6 space-y-4">
                <div className="flex justify-between items-center border-b border-white/10 pb-2">
                    <span className="text-slate-400 text-sm font-medium">Database Management Systems</span>
                    <span className="font-bold text-emerald-400">28 / 30</span>
                </div>
                <div className="flex justify-between items-center border-b border-white/10 pb-2">
                    <span className="text-slate-400 text-sm font-medium">Operating Systems</span>
                    <span className="font-bold text-emerald-400">25 / 30</span>
                </div>
                <div className="flex justify-between items-center pb-2">
                    <span className="text-slate-400 text-sm font-medium">Computer Networks</span>
                    <span className="font-bold text-emerald-400">27 / 30</span>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
