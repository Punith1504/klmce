"use client";

import React from 'react';
import { Calendar, Users, BookOpen, Clock, AlertTriangle, MessageSquare } from 'lucide-react';

export default function FacultyDashboard() {
  return (
    <div className="space-y-8 max-w-7xl mx-auto p-6 lg:p-8 font-sans text-white">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-50 flex items-center gap-3 mb-2">
            Faculty Home
          </h1>
          <p className="text-slate-400 text-sm">Welcome back! Here is your daily overview and pending tasks.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-[#221F32]/80 backdrop-blur rounded-2xl p-6 border border-white/10 shadow-lg flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-500/20 text-indigo-400 rounded-xl flex items-center justify-center">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-slate-400 font-semibold">Today&apos;s Classes</p>
            <h3 className="text-2xl font-bold text-slate-50">3</h3>
          </div>
        </div>

        <div className="bg-[#221F32]/80 backdrop-blur rounded-2xl p-6 border border-white/10 shadow-lg flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-xl flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-slate-400 font-semibold">Pending Attendance</p>
            <h3 className="text-2xl font-bold text-slate-50">1</h3>
          </div>
        </div>

        <div className="bg-[#221F32]/80 backdrop-blur rounded-2xl p-6 border border-white/10 shadow-lg flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-500/20 text-amber-400 rounded-xl flex items-center justify-center">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-slate-400 font-semibold">Assignments to Grade</p>
            <h3 className="text-2xl font-bold text-slate-50">42</h3>
          </div>
        </div>

        <div className="bg-[#221F32]/80 backdrop-blur rounded-2xl p-6 border border-white/10 shadow-lg flex items-center gap-4">
          <div className="w-12 h-12 bg-rose-500/20 text-rose-400 rounded-xl flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-slate-400 font-semibold">Mentees at Risk</p>
            <h3 className="text-2xl font-bold text-slate-50">5</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Today's Schedule */}
        <div className="bg-[#221F32]/80 backdrop-blur rounded-2xl border border-white/10 shadow-lg overflow-hidden">
          <div className="p-6 border-b border-white/10 bg-black/20">
            <h2 className="text-lg font-bold text-slate-50">Today&apos;s Schedule</h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex justify-between items-center bg-white/5 p-4 rounded-xl border border-white/10">
              <div>
                <p className="font-bold text-slate-50">09:00 AM - 10:40 AM</p>
                <p className="text-sm text-indigo-400">Database Management Systems</p>
                <p className="text-xs text-slate-400 mt-1">CSE-B • Room 304</p>
              </div>
              <button className="bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 px-4 py-1.5 rounded-lg text-sm font-semibold hover:bg-indigo-500/30 transition">
                Mark Attendance
              </button>
            </div>
            <div className="flex justify-between items-center bg-white/5 p-4 rounded-xl border border-white/10">
              <div>
                <p className="font-bold text-slate-50">11:30 AM - 01:10 PM</p>
                <p className="text-sm text-indigo-400">Operating Systems Lab</p>
                <p className="text-xs text-slate-400 mt-1">CSE-A • Lab 2</p>
              </div>
              <button className="bg-white/5 text-slate-400 border border-white/10 px-4 py-1.5 rounded-lg text-sm font-semibold hover:bg-white/10 transition">
                Upcoming
              </button>
            </div>
          </div>
        </div>

        {/* Mentoring & Alerts */}
        <div className="bg-[#221F32]/80 backdrop-blur rounded-2xl border border-white/10 shadow-lg overflow-hidden">
          <div className="p-6 border-b border-white/10 bg-black/20">
            <h2 className="text-lg font-bold text-slate-50">Action Items & Alerts</h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex gap-4 items-start bg-amber-500/10 p-4 rounded-xl border border-amber-500/20">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-slate-50 text-sm">Attendance Risk (Mentees)</p>
                <p className="text-xs text-slate-400 mt-1">5 students in your mentoring group have dropped below 75% attendance this week. Intervention required.</p>
              </div>
            </div>
            <div className="flex gap-4 items-start bg-sky-500/10 p-4 rounded-xl border border-sky-500/20">
              <MessageSquare className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-slate-50 text-sm">HOD Notification</p>
                <p className="text-xs text-slate-400 mt-1">Please submit Mid-1 marks for DBMS (CSE-B) by Friday EOD.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
