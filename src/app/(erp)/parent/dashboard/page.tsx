"use client";

import React from 'react';
import { 
  Users, 
  GraduationCap, 
  Award, 
  CalendarCheck, 
  Banknote, 
  PhoneCall, 
  MessageSquare, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight,
  TrendingUp,
  MapPin,
  Clock
} from 'lucide-react';
import Link from 'next/link';
import { STUDENTS, FACULTY } from '@/lib/syntheticData';
import { useRole } from '@/lib/auth/roleContext';

export default function ParentDashboardPage() {
  const { user } = useRole();
  const ward = STUDENTS[0]; // C. Lakshmi Priya
  const mentor = FACULTY[5]; // Dr. P. Radha Krishna

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 font-sans text-white">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-indigo-400 font-semibold uppercase tracking-wider mb-1">
            <Users className="w-4 h-4" /> Official Parent Gateway • KLMCE Kadapa
          </div>
          <h1 className="text-3xl font-bold text-slate-50 tracking-tight">
            Welcome, {user?.name || "Sri C. Narayana Reddy"}
          </h1>
          <p className="text-slate-400 text-sm">
            Live monitoring dashboard for ward <strong className="text-slate-200">{ward.name}</strong> ({ward.rollNo})
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Link
            href="/parent/communication"
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 min-h-[44px] rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 text-xs font-semibold transition-colors"
          >
            <MessageSquare className="w-3.5 h-3.5" /> Message Mentor
          </Link>
          <a
            href={`tel:${mentor.phone}`}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 min-h-[44px] rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-300 text-xs font-semibold transition-colors"
          >
            <PhoneCall className="w-3.5 h-3.5" /> Call Mentor
          </a>
        </div>
      </div>

      {/* Ward Profile & Core Metrics Hero */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Ward Card */}
        <div className="lg:col-span-2 bg-gradient-to-br from-indigo-950/60 via-[#1f1b33]/80 to-[#120f24] rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[70px] pointer-events-none" />
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center font-bold text-2xl text-indigo-300 shadow-inner">
                {ward.name.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-bold text-white">{ward.name}</h2>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-[10px] font-bold text-emerald-300 uppercase">
                    Active Student
                  </span>
                </div>
                <p className="text-xs text-indigo-200/70 mt-1 font-mono">
                  Roll No: <span className="text-white font-bold">{ward.rollNo}</span> • {ward.programme} {ward.department}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  Year 4 ({ward.semester}) • Autonomous Regulation R20
                </p>
              </div>
            </div>

            <div className="text-left sm:text-right bg-black/30 p-3 rounded-xl border border-white/5">
              <p className="text-[10px] text-slate-400 uppercase font-semibold">Designated Mentor</p>
              <p className="text-xs font-bold text-slate-200">{mentor.name}</p>
              <p className="text-[11px] text-indigo-400">{mentor.phone}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-white/10 relative z-10">
            <div>
              <p className="text-[10px] uppercase font-semibold text-slate-400">Hostel Room</p>
              <p className="text-xs font-bold text-slate-200 mt-1">{ward.hostelRoom}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase font-semibold text-slate-400">Bus Transport</p>
              <p className="text-xs font-bold text-slate-200 mt-1">{ward.busRoute}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase font-semibold text-slate-400">Home Region</p>
              <p className="text-xs font-bold text-slate-200 mt-1">{ward.region}, {ward.district}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase font-semibold text-slate-400">Disciplinary Record</p>
              <p className="text-xs font-bold text-emerald-400 mt-1 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Exemplary
              </p>
            </div>
          </div>
        </div>

        {/* 2 Key Gauges Stack */}
        <div className="flex flex-col gap-4">
          {/* Attendance Dial */}
          <div className="bg-[#1f1b30]/80 rounded-2xl p-5 border border-white/10 shadow-lg flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full border-[3px] border-emerald-400 flex items-center justify-center bg-emerald-400/10 shadow-[0_0_15px_rgba(52,211,153,0.2)]">
                <span className="text-base font-bold text-emerald-400">{ward.attendance_pct}%</span>
              </div>
              <div>
                <h3 className="text-slate-100 font-bold text-sm">Attendance Standing</h3>
                <p className="text-xs text-emerald-400 font-medium mt-0.5">Safe (Above 75% limit)</p>
                <p className="text-[11px] text-slate-400">Total 110 of 120 periods attended</p>
              </div>
            </div>
            <Link href="/parent/attendance" className="p-2 text-slate-400 hover:text-white transition-colors">
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          {/* Academic CGPA */}
          <div className="bg-[#1f1b30]/80 rounded-2xl p-5 border border-white/10 shadow-lg flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full border-[3px] border-indigo-400 flex items-center justify-center bg-indigo-400/10 shadow-[0_0_15px_rgba(129,140,248,0.2)]">
                <span className="text-base font-bold text-indigo-400">{ward.cgpa}</span>
              </div>
              <div>
                <h3 className="text-slate-100 font-bold text-sm">Cumulative CGPA</h3>
                <p className="text-xs text-indigo-300 font-medium mt-0.5">Distinction Rank • Top 5%</p>
                <p className="text-[11px] text-slate-400">0 Backlogs across 6 semesters</p>
              </div>
            </div>
            <Link href="/parent/academics" className="p-2 text-slate-400 hover:text-white transition-colors">
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          {/* Fee Status Quick Card */}
          <div className="bg-[#1f1b30]/80 rounded-2xl p-5 border border-white/10 shadow-lg flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full border-[3px] border-emerald-400/80 flex items-center justify-center bg-emerald-500/10 text-emerald-400">
                <Banknote className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-slate-100 font-bold text-sm">Tuition & Campus Fee</h3>
                <p className="text-xs text-emerald-400 font-medium mt-0.5">Paid in Full • No Dues</p>
                <p className="text-[11px] text-slate-400">Receipt Ref: SBI-KLM-9821</p>
              </div>
            </div>
            <Link href="/parent/fees" className="p-2 text-slate-400 hover:text-white transition-colors">
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>

      </div>

      {/* Middle Section: Academic Standing & Attendance Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Mid-Term Examination Marks */}
        <div className="bg-[#1f1b30]/80 rounded-3xl border border-white/10 p-6 shadow-xl space-y-4">
          <div className="flex justify-between items-center border-b border-white/10 pb-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-indigo-400" /> Mid-Term 1 Internal Marks
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Autonomous Evaluation (Out of 30)</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              Avg: 27.2 / 30
            </span>
          </div>

          <div className="space-y-3">
            {[
              { subject: "Database Management Systems", code: "20A05301T", marks: 28, max: 30, pct: 93 },
              { subject: "Operating Systems", code: "20A05302T", marks: 27, max: 30, pct: 90 },
              { subject: "Database & OS Laboratory", code: "20A05303P", marks: 29, max: 30, pct: 96 },
              { subject: "Analog & Digital Communications", code: "20A04401T", marks: 25, max: 30, pct: 83 },
            ].map((sub) => (
              <div key={sub.code} className="bg-black/30 p-3.5 rounded-xl border border-white/5 space-y-2">
                <div className="flex justify-between items-center text-sm font-medium">
                  <span className="text-slate-200">{sub.subject} <span className="text-xs text-slate-500">({sub.code})</span></span>
                  <span className="font-bold text-emerald-400">{sub.marks} / {sub.max}</span>
                </div>
                <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                  <div className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-full rounded-full" style={{ width: `${sub.pct}%` }} />
                </div>
              </div>
            ))}
          </div>

          <div className="text-right pt-2">
            <Link href="/parent/academics" className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold inline-flex items-center gap-1">
              View Detailed Semester Marksheet <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Live Attendance History & SMS Log */}
        <div className="bg-[#1f1b30]/80 rounded-3xl border border-white/10 p-6 shadow-xl space-y-4">
          <div className="flex justify-between items-center border-b border-white/10 pb-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <CalendarCheck className="w-5 h-5 text-emerald-400" /> Attendance & SMS Alerts
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Automated SMS dispatched to registered mobile</p>
            </div>
            <span className="text-xs text-slate-400">Mobile: +91 94401 22334</span>
          </div>

          <div className="space-y-3">
            {[
              { date: "Today (Oct 11)", event: "Present for all 6 Periods", time: "09:00 AM - 04:30 PM", type: "success" },
              { date: "Yesterday (Oct 10)", event: "Present for all 6 Periods", time: "09:00 AM - 04:30 PM", type: "success" },
              { date: "Oct 09, 2026", event: "Present for 5 of 6 Periods (Excused library slot)", time: "09:00 AM - 03:30 PM", type: "info" },
              { date: "Oct 04, 2026", event: "SMS Alert: Weekly Attendance Summary (92% maintained)", time: "05:00 PM", type: "sms" }
            ].map((log, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/5 text-xs">
                <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${log.type === 'success' ? 'bg-emerald-400' : log.type === 'sms' ? 'bg-indigo-400' : 'bg-sky-400'}`} />
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-200">{log.event}</span>
                    <span className="text-[10px] text-slate-500 font-mono">{log.date}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">{log.time}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-right pt-2">
            <Link href="/parent/attendance" className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold inline-flex items-center gap-1">
              View Complete Attendance Calendar <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

      </div>

    </div>
  );
}
