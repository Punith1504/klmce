"use client";

import React from 'react';
import { BookOpen, Upload, Video } from 'lucide-react';

export default function FacultyCourses() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto p-6 lg:p-8 font-sans text-white">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-50 flex items-center gap-3 mb-2">
            <BookOpen className="w-7 h-7 text-indigo-400"/> Course & LMS
          </h1>
          <p className="text-slate-400 text-sm">Upload materials, syllabus tracking, and lesson plans.</p>
        </div>
        <button className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-xl text-sm font-semibold transition shadow-[0_4px_14px_0_rgba(79,70,229,0.39)] flex items-center gap-2">
            <Upload className="w-4 h-4" /> Upload Material
        </button>
      </div>

      <div className="bg-[#221F32]/80 backdrop-blur rounded-2xl p-6 border border-white/10 shadow-lg flex items-center gap-6">
         <div className="flex-1 border border-white/10 p-4 rounded-xl bg-black/20">
            <h3 className="font-bold text-indigo-400 mb-1">Database Management Systems</h3>
            <p className="text-xs text-slate-400">Unit 1: Introduction & ER Model</p>
            <div className="mt-4 bg-white/10 rounded-full h-1.5 w-full overflow-hidden">
                <div className="bg-indigo-500 w-1/4 h-full rounded-full"></div>
            </div>
            <p className="text-xs text-slate-400 mt-2">25% Syllabus Completed</p>
         </div>
         <div className="flex-1 border border-white/10 p-4 rounded-xl bg-black/20">
            <h3 className="font-bold text-emerald-400 mb-1">Operating Systems Lab</h3>
            <p className="text-xs text-slate-400">Experiment 3: Process Scheduling</p>
            <div className="mt-4 bg-white/10 rounded-full h-1.5 w-full overflow-hidden">
                <div className="bg-emerald-500 w-[60%] h-full rounded-full"></div>
            </div>
            <p className="text-xs text-slate-400 mt-2">60% Syllabus Completed</p>
         </div>
      </div>
    </div>
  );
}
