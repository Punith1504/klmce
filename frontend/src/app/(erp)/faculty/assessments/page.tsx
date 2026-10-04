"use client";

import React from 'react';
import { PenTool, FileSignature, CheckCircle } from 'lucide-react';

export default function FacultyAssessments() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto p-6 lg:p-8 font-sans text-white">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-50 flex items-center gap-3 mb-2">
            <PenTool className="w-7 h-7 text-indigo-400"/> Assessments
          </h1>
          <p className="text-slate-400 text-sm">Create quizzes, assignments, and evaluate submissions.</p>
        </div>
        <button className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-xl text-sm font-semibold transition shadow-[0_4px_14px_0_rgba(79,70,229,0.39)]">
            + New Assignment
        </button>
      </div>

      <div className="bg-[#221F32]/80 backdrop-blur rounded-2xl border border-white/10 shadow-lg overflow-hidden">
        <div className="p-6 border-b border-white/10 bg-black/20">
            <h2 className="text-lg font-bold text-slate-50">Active Assessments</h2>
        </div>
        <div className="divide-y divide-white/10">
            <div className="p-6 flex justify-between items-center hover:bg-white/5 transition-colors">
                <div>
                    <h4 className="text-slate-50 font-semibold text-lg">Assignment 1: ER Diagrams</h4>
                    <p className="text-sm text-slate-400 mt-1">Database Management Systems • CSE-B</p>
                </div>
                <div className="text-right">
                    <p className="font-bold text-emerald-400">42/60 Submitted</p>
                    <p className="text-xs text-slate-400 mt-1">Due: 15 Oct 2026</p>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
