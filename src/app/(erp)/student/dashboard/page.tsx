"use client";

import React from 'react';
import { 
    Clock, 
    CheckCircle2, 
    Calendar, 
    BookOpen, 
    Briefcase, 
    AlertCircle, 
    CreditCard, 
    ChevronRight, 
    TrendingUp,
    Library
} from "lucide-react";

export default function StudentDashboard() {
    return (
        <div className="space-y-6 max-w-7xl mx-auto p-6 lg:p-8 font-sans">
            
            {/* Top Row: Welcome Hero & Core Academic Metrics */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Hero Banner */}
                <div className="lg:col-span-2 bg-gradient-to-br from-indigo-900/40 to-fuchsia-900/20 backdrop-blur-md rounded-3xl p-8 flex flex-col justify-center relative overflow-hidden border border-white/10 shadow-2xl">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-fuchsia-500/20 rounded-full blur-[80px] pointer-events-none -mr-20 -mt-20"></div>
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-500/20 rounded-full blur-[60px] pointer-events-none -ml-10 -mb-10"></div>
                    
                    <div className="relative z-10 flex items-start justify-between">
                        <div>
                            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 tracking-tight">Welcome back, Punith! 👋</h1>
                            <p className="text-indigo-200/80 text-sm sm:text-base max-w-md">
                                You have <strong className="text-white">2 classes</strong> today and a <strong className="text-white">Database Systems</strong> assessment due tomorrow. Keep up the great work!
                            </p>
                        </div>
                        <div className="hidden sm:flex items-center gap-2 bg-black/20 border border-white/10 px-4 py-2 rounded-xl backdrop-blur-md">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                            <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">Semester 5</span>
                        </div>
                    </div>
                </div>
                
                {/* Core KPIs Stack */}
                <div className="flex flex-col gap-4">
                    <div className="bg-[#221F32]/80 backdrop-blur-md rounded-2xl p-5 border border-white/10 shadow-lg flex items-center justify-between group cursor-pointer hover:bg-white/[0.05] transition-colors">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full border-[3px] border-emerald-400 flex items-center justify-center bg-emerald-400/10 shadow-[0_0_15px_rgba(52,211,153,0.2)]">
                                <span className="text-sm font-bold text-emerald-400">88%</span>
                            </div>
                            <div>
                                <h3 className="text-slate-50 font-semibold text-sm">Attendance</h3>
                                <p className="text-xs text-slate-400">Overall average</p>
                            </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-emerald-400 transition-colors" />
                    </div>

                    <div className="bg-[#221F32]/80 backdrop-blur-md rounded-2xl p-5 border border-white/10 shadow-lg flex items-center justify-between group cursor-pointer hover:bg-white/[0.05] transition-colors">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full border-[3px] border-fuchsia-400 flex items-center justify-center bg-fuchsia-400/10 shadow-[0_0_15px_rgba(232,121,249,0.2)]">
                                <span className="text-sm font-bold text-fuchsia-400">8.9</span>
                            </div>
                            <div>
                                <h3 className="text-slate-50 font-semibold text-sm">Current CGPA</h3>
                                <p className="text-xs text-slate-400">Top 15% of class</p>
                            </div>
                        </div>
                        <TrendingUp className="w-5 h-5 text-slate-500 group-hover:text-fuchsia-400 transition-colors" />
                    </div>
                </div>
            </div>

            {/* Middle Row: Schedule & Action Center */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Schedule Timeline */}
                <div className="lg:col-span-2 bg-[#221F32]/80 backdrop-blur-md rounded-3xl border border-white/10 shadow-xl overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                        <h2 className="text-lg font-bold text-slate-50 flex items-center gap-2">
                            <Clock className="w-5 h-5 text-indigo-400"/> Today&apos;s Schedule
                        </h2>
                        <span className="text-xs font-semibold text-indigo-300 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">Wednesday, Oct 4</span>
                    </div>
                    
                    <div className="p-6 space-y-6 flex-1 relative">
                        {/* Timeline Track */}
                        <div className="absolute left-[51px] top-6 bottom-6 w-px bg-white/10"></div>
                        
                        {/* Item 1 */}
                        <div className="flex items-start gap-6 relative z-10">
                            <div className="bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 w-20 text-center shadow-lg">09:00 AM</div>
                            <div className="w-3 h-3 rounded-full bg-indigo-400 mt-1.5 shrink-0 shadow-[0_0_10px_rgba(129,140,248,0.5)]"></div>
                            <div className="flex-1 bg-white/[0.03] border border-white/5 p-4 rounded-2xl hover:bg-white/[0.06] transition-colors">
                                <div className="flex justify-between items-start mb-1">
                                    <h3 className="text-slate-50 font-semibold">Data Structures & Algorithms</h3>
                                    <span className="bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded text-[10px] font-bold border border-emerald-500/20">LECTURE</span>
                                </div>
                                <p className="text-sm text-slate-400 flex items-center gap-2">
                                    <span>Prof. Alan Turing</span> • <span>Block C - Room 201</span>
                                </p>
                            </div>
                        </div>

                        {/* Item 2 */}
                        <div className="flex items-start gap-6 relative z-10">
                            <div className="bg-white/5 border border-white/10 text-slate-300 px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 w-20 text-center">11:30 AM</div>
                            <div className="w-3 h-3 rounded-full bg-slate-600 mt-1.5 shrink-0"></div>
                            <div className="flex-1 bg-white/[0.03] border border-white/5 p-4 rounded-2xl hover:bg-white/[0.06] transition-colors">
                                <div className="flex justify-between items-start mb-1">
                                    <h3 className="text-slate-50 font-semibold">Web Technologies</h3>
                                    <span className="bg-fuchsia-500/10 text-fuchsia-400 px-2 py-0.5 rounded text-[10px] font-bold border border-fuchsia-500/20">PRACTICAL</span>
                                </div>
                                <p className="text-sm text-slate-400 flex items-center gap-2">
                                    <span>Dr. Ada Lovelace</span> • <span>Computer Lab 4</span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Center / Needs Attention */}
                <div className="bg-[#221F32]/80 backdrop-blur-md rounded-3xl border border-white/10 shadow-xl overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-white/5 bg-white/[0.02]">
                        <h2 className="text-lg font-bold text-slate-50 flex items-center gap-2">
                            <AlertCircle className="w-5 h-5 text-amber-400"/> Needs Attention
                        </h2>
                    </div>
                    
                    <div className="p-4 space-y-3">
                        <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-2xl flex gap-4 items-start">
                            <div className="p-2 bg-rose-500/20 rounded-lg text-rose-400 shrink-0"><CreditCard className="w-5 h-5" /></div>
                            <div>
                                <h4 className="text-slate-50 font-medium text-sm">Semester Fee Overdue</h4>
                                <p className="text-xs text-slate-400 mt-1">₹ 45,000 pending for Semester 5. Due date was Oct 1st.</p>
                                <button className="mt-2 text-xs font-bold text-rose-400 hover:text-rose-300">Pay Now →</button>
                            </div>
                        </div>

                        <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl flex gap-4 items-start">
                            <div className="p-2 bg-amber-500/20 rounded-lg text-amber-400 shrink-0"><BookOpen className="w-5 h-5" /></div>
                            <div>
                                <h4 className="text-slate-50 font-medium text-sm">e-Assessment Due</h4>
                                <p className="text-xs text-slate-400 mt-1">DBMS Mid-Term Quiz closes in 14 hours.</p>
                                <button className="mt-2 text-xs font-bold text-amber-400 hover:text-amber-300">Start Assessment →</button>
                            </div>
                        </div>

                        <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex gap-4 items-start">
                            <div className="p-2 bg-white/10 rounded-lg text-slate-300 shrink-0"><Library className="w-5 h-5" /></div>
                            <div>
                                <h4 className="text-slate-50 font-medium text-sm">Library Book Return</h4>
                                <p className="text-xs text-slate-400 mt-1">&quot;Introduction to Algorithms&quot; is due in 2 days.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Row: Placements & Happenings */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Placements Spotlight */}
                <div className="bg-gradient-to-r from-[#221F32]/80 to-indigo-900/20 backdrop-blur-md rounded-3xl border border-indigo-500/20 p-6 flex flex-col justify-between shadow-xl">
                    <div className="flex justify-between items-start mb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-indigo-500/20 rounded-xl text-indigo-400">
                                <Briefcase className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-white">Upcoming Campus Drive</h2>
                                <p className="text-sm text-indigo-200/60">TCS Digital is visiting next week.</p>
                            </div>
                        </div>
                        <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs px-3 py-1 rounded-full font-bold">Recommended</span>
                    </div>
                    
                    <div className="bg-black/20 border border-white/10 p-4 rounded-2xl flex justify-between items-center backdrop-blur-sm">
                        <div>
                            <h3 className="text-white font-medium">System Engineer</h3>
                            <p className="text-xs text-emerald-400 font-bold mt-1">₹ 7.0 LPA</p>
                        </div>
                        <button className="bg-white/10 hover:bg-white/20 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors border border-white/10">
                            Apply Now
                        </button>
                    </div>
                </div>

                {/* Happenings (Announcements) */}
                <div className="bg-[#221F32]/80 backdrop-blur-md rounded-3xl border border-white/10 p-6 shadow-xl">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-bold text-slate-50 flex items-center gap-2">
                            <span className="text-fuchsia-500 font-bold text-xl leading-none">!</span> Campus Happenings
                        </h2>
                        <a href="#" className="text-xs text-indigo-400 hover:underline font-medium">View All</a>
                    </div>
                    
                    <div className="space-y-4">
                        <div className="flex gap-4 items-center group cursor-pointer">
                            <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex flex-col items-center justify-center shrink-0 group-hover:border-indigo-500/50 transition-colors">
                                <span className="text-[10px] text-slate-400 font-bold uppercase leading-none">Oct</span>
                                <span className="text-lg text-white font-bold leading-none mt-1">12</span>
                            </div>
                            <div>
                                <h3 className="text-slate-50 font-medium text-sm group-hover:text-indigo-300 transition-colors">TechFest 2026 Registrations Open</h3>
                                <p className="text-xs text-slate-400 mt-0.5">Participate in 24-hour hackathons and coding relays.</p>
                            </div>
                        </div>
                        
                        <div className="flex gap-4 items-center group cursor-pointer">
                            <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex flex-col items-center justify-center shrink-0 group-hover:border-indigo-500/50 transition-colors">
                                <span className="text-[10px] text-slate-400 font-bold uppercase leading-none">Oct</span>
                                <span className="text-lg text-white font-bold leading-none mt-1">15</span>
                            </div>
                            <div>
                                <h3 className="text-slate-50 font-medium text-sm group-hover:text-indigo-300 transition-colors">Mid-Term Examinations Begin</h3>
                                <p className="text-xs text-slate-400 mt-0.5">Check the examinations portal for detailed timetables.</p>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
