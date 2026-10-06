"use client";

import React, { useState } from 'react';
import { PenTool, Clock, CheckCircle2, PlayCircle, BookOpen, AlertCircle, FileText } from "lucide-react";

export default function StudentAssessmentsPage() {
    const [activeTab, setActiveTab] = useState("Scheduled");
    const tabs = ["Scheduled", "Practice", "Completed"];
    
    const assessments = [
        { 
            title: "Database Management Systems - Quiz 2", 
            type: "Graded Assessment", 
            duration: "45 Mins", 
            questions: "30 MCQs & SCQs", 
            date: "Oct 12, 10:00 AM",
            status: "Available",
            mapping: "CO2, BT3" 
        },
        { 
            title: "Data Structures - Mid Term Examination", 
            type: "Graded Assessment", 
            duration: "120 Mins", 
            questions: "Subjective & Equations", 
            date: "Oct 15, 09:00 AM",
            status: "Locked",
            mapping: "CO1-CO4, BT1-BT5" 
        },
        { 
            title: "Operating Systems - Process Scheduling", 
            type: "Practice Assessment", 
            duration: "Untimed", 
            questions: "Fill in the Blanks, Match Columns", 
            date: "Always Available",
            status: "Available",
            mapping: "CO3, BT2" 
        }
    ];

    const filtered = activeTab === "Scheduled" 
        ? assessments.filter(a => a.type === "Graded Assessment")
        : activeTab === "Practice"
        ? assessments.filter(a => a.type === "Practice Assessment")
        : []; // Empty for completed in this mock

    return (
        <div className="space-y-8 max-w-7xl mx-auto p-6 lg:p-8 font-sans">
            {/* Header Section */}
            <div>
                <h1 className="text-3xl font-bold text-slate-50 flex items-center gap-3 mb-2">
                    <PenTool className="w-7 h-7 text-indigo-400"/> e-Assessments Hub
                </h1>
                <p className="text-slate-400 text-sm">Access your scheduled, timed, and practice assessments seamlessly.</p>
            </div>
            
            {/* KPI Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-[#221F32]/80 backdrop-blur rounded-2xl p-6 border border-white/10 shadow-lg flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                        <AlertCircle className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-slate-50">2</h3>
                        <p className="text-slate-400 text-xs font-medium">Pending Graded</p>
                    </div>
                </div>
                <div className="bg-[#221F32]/80 backdrop-blur rounded-2xl p-6 border border-white/10 shadow-lg flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                        <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-slate-50">14</h3>
                        <p className="text-slate-400 text-xs font-medium">Completed</p>
                    </div>
                </div>
                <div className="bg-[#221F32]/80 backdrop-blur rounded-2xl p-6 border border-white/10 shadow-lg flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                        <PlayCircle className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-slate-50">5</h3>
                        <p className="text-slate-400 text-xs font-medium">Practice Available</p>
                    </div>
                </div>
                <div className="bg-[#221F32]/80 backdrop-blur rounded-2xl p-6 border border-white/10 shadow-lg flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-fuchsia-500/20 text-fuchsia-400 flex items-center justify-center">
                        <BookOpen className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-slate-50">84%</h3>
                        <p className="text-slate-400 text-xs font-medium">Average Score</p>
                    </div>
                </div>
            </div>

            {/* Horizontal Scrollable Tabs */}
            <div className="flex gap-3 border-b border-white/10 pb-4">
                {tabs.map((t, i) => (
                    <button 
                        key={i} 
                        onClick={() => setActiveTab(t)}
                        className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                            activeTab === t 
                                ? "bg-indigo-600 text-white shadow-[0_4px_14px_0_rgba(79,70,229,0.39)]" 
                                : "bg-transparent text-slate-400 hover:text-slate-200 hover:bg-white/5"
                        }`}
                    >
                        {t}
                    </button>
                ))}
            </div>

            {/* Assessments Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((a, i) => (
                    <div key={i} className="bg-[#221F32]/80 backdrop-blur rounded-2xl p-6 border border-white/10 hover:border-indigo-500/50 transition-colors shadow-lg flex flex-col group relative overflow-hidden">
                        
                        {/* Decorative Background Glow */}
                        {a.status === "Available" && (
                            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -mr-10 -mt-10"></div>
                        )}

                        <div className="flex justify-between items-start mb-4 relative z-10">
                            <span className={`text-xs px-2.5 py-1 rounded font-bold border ${
                                a.type.includes('Graded') 
                                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                    : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            }`}>
                                {a.type}
                            </span>
                            <span className="bg-black/20 text-slate-400 text-xs px-2.5 py-1 rounded border border-white/10">
                                {a.mapping}
                            </span>
                        </div>
                        
                        <h3 className="text-lg font-bold text-slate-50 mb-4 leading-tight group-hover:text-indigo-200 transition-colors relative z-10">{a.title}</h3>
                        
                        <div className="space-y-3 mb-8 flex-1 relative z-10">
                            <div className="flex items-center gap-3 text-sm text-slate-300">
                                <Clock className="w-4 h-4 text-slate-500" />
                                <span>{a.duration} • <span className="text-indigo-300">{a.date}</span></span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-slate-300">
                                <FileText className="w-4 h-4 text-slate-500" />
                                <span>{a.questions}</span>
                            </div>
                        </div>

                        {/* Action Footer */}
                        <div className="mt-auto relative z-10">
                            {a.status === "Available" ? (
                                <button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl text-sm font-bold transition flex items-center justify-center gap-2 shadow-[0_4px_14px_0_rgba(79,70,229,0.39)]">
                                    Start Assessment
                                </button>
                            ) : (
                                <button disabled className="w-full bg-white/5 border border-white/10 text-slate-400 py-3 rounded-xl text-sm font-medium cursor-not-allowed flex items-center justify-center gap-2">
                                    <Clock className="w-4 h-4" /> Locked until scheduled
                                </button>
                            )}
                        </div>
                    </div>
                ))}

                {filtered.length === 0 && (
                    <div className="col-span-full py-12 text-center border-2 border-dashed border-white/10 rounded-2xl">
                        <CheckCircle2 className="w-12 h-12 text-emerald-500/50 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-slate-300">You&apos;re all caught up!</h3>
                        <p className="text-slate-500 text-sm mt-1">No assessments found for this category.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
