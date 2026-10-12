"use client";

import React, { useState } from 'react';
import { CalendarCheck, ShieldCheck, AlertTriangle, ArrowLeft, Filter, CheckCircle2, XCircle } from 'lucide-react';
import Link from 'next/link';
import { STUDENTS } from '@/lib/syntheticData';

export default function ParentAttendancePage() {
  const ward = STUDENTS[0];
  const [selectedMonth, setSelectedMonth] = useState('October 2026');

  const attendanceLog = [
    { date: "Oct 11, 2026", day: "Friday", periods: "6 / 6 Present", status: "PRESENT", subjects: "DBMS, OS Lab, Networks" },
    { date: "Oct 10, 2026", day: "Thursday", periods: "6 / 6 Present", status: "PRESENT", subjects: "Algorithms, OS, DBMS" },
    { date: "Oct 09, 2026", day: "Wednesday", periods: "5 / 6 Present", status: "PARTIAL", subjects: "Analog Comm, OS Lab" },
    { date: "Oct 08, 2026", day: "Tuesday", periods: "6 / 6 Present", status: "PRESENT", subjects: "DBMS, Networks, Library" },
    { date: "Oct 07, 2026", day: "Monday", periods: "6 / 6 Present", status: "PRESENT", subjects: "All 6 core periods" },
    { date: "Oct 04, 2026", day: "Friday", periods: "6 / 6 Present", status: "PRESENT", subjects: "Algorithms, DBMS Lab" },
    { date: "Oct 03, 2026", day: "Thursday", periods: "0 / 6 Absent (Sick Leave)", status: "ABSENT", subjects: "All 6 periods" },
    { date: "Oct 01, 2026", day: "Tuesday", periods: "6 / 6 Present", status: "PRESENT", subjects: "DBMS, OS, Elective" },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 font-sans text-white">
      {/* Breadcrumb & Navigation */}
      <div className="flex items-center gap-3">
        <Link href="/parent/dashboard" className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <CalendarCheck className="w-6 h-6 text-emerald-400" /> Ward's Attendance Log & Academic Compliance
          </h1>
          <p className="text-xs text-slate-400">
            Attendance monitoring for {ward.name} ({ward.rollNo}) • Min. 75% required by Academic Regulations
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#1f1b30]/80 rounded-2xl p-6 border border-white/10 shadow-lg">
          <p className="text-xs text-slate-400 uppercase font-semibold">Cumulative Attendance</p>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-4xl font-extrabold text-emerald-400">92.0%</span>
            <span className="text-xs text-emerald-300 font-medium">Safe Margin (+17% above cut-off)</span>
          </div>
          <p className="text-xs text-slate-500 mt-2">110 attended out of 120 total periods conducted</p>
        </div>

        <div className="bg-[#1f1b30]/80 rounded-2xl p-6 border border-white/10 shadow-lg">
          <p className="text-xs text-slate-400 uppercase font-semibold">Condonation Threshold</p>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-bold text-slate-200">75.0%</span>
            <span className="text-xs text-slate-400">Mandatory Academic Rule</span>
          </div>
          <p className="text-xs text-slate-500 mt-2">Shortage between 65-75% requires medical condonation fee</p>
        </div>

        <div className="bg-[#1f1b30]/80 rounded-2xl p-6 border border-white/10 shadow-lg">
          <p className="text-xs text-slate-400 uppercase font-semibold">Absence Count (Semester 7)</p>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-bold text-slate-200">2 Days</span>
            <span className="text-xs text-slate-400">Leave Authorized</span>
          </div>
          <p className="text-xs text-slate-500 mt-2">SMS notification sent for each logged absence</p>
        </div>
      </div>

      {/* Detailed Day-by-Day Record */}
      <div className="bg-[#1f1b30]/80 rounded-3xl border border-white/10 p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-white/10 pb-4">
          <h2 className="text-lg font-bold text-white">Daily Attendance Records</h2>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Filter Month:</span>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-black/30 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white outline-none"
            >
              <option value="October 2026">October 2026</option>
              <option value="September 2026">September 2026</option>
              <option value="August 2026">August 2026</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-xs uppercase text-slate-400 border-b border-white/10">
                <th className="pb-3 px-4">Date</th>
                <th className="pb-3 px-4">Day</th>
                <th className="pb-3 px-4">Periods Breakdown</th>
                <th className="pb-3 px-4">Subjects Covered</th>
                <th className="pb-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm">
              {attendanceLog.map((row, i) => (
                <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3.5 px-4 font-mono font-medium text-slate-200">{row.date}</td>
                  <td className="py-3.5 px-4 text-slate-400">{row.day}</td>
                  <td className="py-3.5 px-4 text-slate-300">{row.periods}</td>
                  <td className="py-3.5 px-4 text-xs text-slate-400">{row.subjects}</td>
                  <td className="py-3.5 px-4 text-right">
                    {row.status === 'PRESENT' && (
                      <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Full Present
                      </span>
                    )}
                    {row.status === 'PARTIAL' && (
                      <span className="px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold inline-flex items-center gap-1">
                        Partial Day
                      </span>
                    )}
                    {row.status === 'ABSENT' && (
                      <span className="px-2.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold inline-flex items-center gap-1">
                        <XCircle className="w-3 h-3" /> Absent
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
