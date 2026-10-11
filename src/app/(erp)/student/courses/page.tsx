"use client";

import React, { useState } from 'react';
import { BookOpen, FileText, Download, CheckCircle2, Award, Clock, ArrowRight } from 'lucide-react';
import { COURSES } from '@/lib/syntheticData';

export default function StudentCoursesPage() {
  const [courses] = useState(COURSES);

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 font-sans text-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-2">
            <BookOpen className="w-6 h-6 sm:w-7 sm:h-7 text-indigo-400" /> My Enrolled Courses & LMS
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            JNTUA R20 Autonomous Curriculum • Year 4 Semester 7 • CSE Branch
          </p>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <div className="bg-[#1f1b30]/80 rounded-2xl p-5 sm:p-6 border border-white/10 shadow-lg">
          <p className="text-xs text-slate-400 uppercase font-semibold">Total Registered Credits</p>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-indigo-400">22.5 Credits</span>
          </div>
          <p className="text-xs text-slate-500 mt-2">5 Theory Subjects + 2 Lab Courses</p>
        </div>

        <div className="bg-[#1f1b30]/80 rounded-2xl p-5 sm:p-6 border border-white/10 shadow-lg">
          <p className="text-xs text-slate-400 uppercase font-semibold">Average Attendance Rate</p>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-emerald-400">92.0%</span>
            <span className="text-xs text-emerald-300 font-medium">Safe Margin</span>
          </div>
          <p className="text-xs text-slate-500 mt-2">Across all core courses and labs</p>
        </div>

        <div className="bg-[#1f1b30]/80 rounded-2xl p-5 sm:p-6 border border-white/10 shadow-lg">
          <p className="text-xs text-slate-400 uppercase font-semibold">Syllabus Completion</p>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl sm:text-3xl font-bold text-amber-400">65% Overall</span>
            <span className="text-xs text-amber-300 font-medium">Unit 3 Active</span>
          </div>
          <p className="text-xs text-slate-500 mt-2">Mid-Term 1 syllabus completed</p>
        </div>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {courses.map((course) => (
          <div key={course.code} className="bg-[#1f1b30]/80 rounded-3xl border border-white/10 p-5 sm:p-6 shadow-xl flex flex-col justify-between hover:border-indigo-500/40 transition-all">
            <div>
              <div className="flex justify-between items-start mb-3">
                <span className="px-2.5 py-1 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-mono font-bold">
                  {course.code}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] font-semibold">
                  {course.credits} Credits
                </span>
              </div>

              <h2 className="text-base sm:text-lg font-bold text-white mb-2 leading-snug">
                {course.title}
              </h2>
              <p className="text-xs text-slate-400 mb-4">
                Faculty: <strong className="text-slate-200">{course.faculty}</strong> • {course.dept}
              </p>

              <div className="space-y-2 bg-black/25 p-3 rounded-xl border border-white/5 mb-4 text-xs">
                <div className="flex justify-between text-slate-300">
                  <span>Course Type:</span>
                  <span className="text-white font-medium">{course.type}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Semester / Regulation:</span>
                  <span className="text-indigo-300 font-mono">Sem 7 (R20)</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-white/5">
              <button
                onClick={() => alert(`Downloading official JNTUA R20 syllabus for ${course.title} (${course.code})...`)}
                className="flex-1 py-2.5 px-3 min-h-[44px] rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
              >
                <Download className="w-3.5 h-3.5 text-indigo-400" /> Syllabus PDF
              </button>
              <button
                onClick={() => alert(`Opening lecture notes and LMS units for ${course.title}...`)}
                className="flex-1 py-2.5 px-3 min-h-[44px] rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md transition flex items-center justify-center gap-1"
              >
                <FileText className="w-3.5 h-3.5" /> Modules
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
