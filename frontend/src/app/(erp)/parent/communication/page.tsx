"use client";

import React from 'react';
import { MessageSquare, Calendar } from 'lucide-react';

export default function ParentCommunication() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto p-6 lg:p-8 font-sans text-white">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-50 flex items-center gap-3 mb-2">
            <MessageSquare className="w-7 h-7 text-indigo-400"/> Communication
          </h1>
          <p className="text-slate-400 text-sm">Official notices, holiday alerts, and parent meeting schedules.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#221F32]/80 backdrop-blur rounded-2xl border border-white/10 shadow-lg overflow-hidden">
            <div className="p-6 border-b border-white/10 bg-black/20">
                <h2 className="text-lg font-bold text-slate-50">College Notices</h2>
            </div>
            <div className="p-6 space-y-4">
                <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                    <p className="text-sm font-bold text-slate-50">Dussehra Holidays</p>
                    <p className="text-xs text-slate-400 mt-1">College will remain closed from Oct 10th to Oct 14th for Dussehra. Classes resume on Oct 15th.</p>
                </div>
                <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                    <p className="text-sm font-bold text-slate-50">Exam Fee Notification</p>
                    <p className="text-xs text-slate-400 mt-1">JNTUA Regular Exams fee portal is now open. Last date without late fee is Oct 15th.</p>
                </div>
            </div>
        </div>

        <div className="bg-[#221F32]/80 backdrop-blur rounded-2xl border border-white/10 shadow-lg overflow-hidden">
            <div className="p-6 border-b border-white/10 bg-black/20">
                <h2 className="text-lg font-bold text-slate-50">Parent-Teacher Meetings</h2>
            </div>
            <div className="p-6 flex flex-col items-center justify-center text-center h-48">
                <Calendar className="w-10 h-10 text-slate-500 mb-3" />
                <p className="text-slate-400 font-medium text-sm">No scheduled meetings at the moment.</p>
                <button className="mt-4 text-xs font-bold text-indigo-400 border border-indigo-500/30 bg-indigo-500/10 px-4 py-2 rounded-lg hover:bg-indigo-500/20 transition">Request a Meeting with Mentor</button>
            </div>
        </div>
      </div>
    </div>
  );
}
