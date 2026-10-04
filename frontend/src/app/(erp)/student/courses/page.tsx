"use client";

import React, { useState } from 'react';
import { BookOpen, Download } from "lucide-react";

export default function AcademicsCoursesPage() {
    const [activeTab, setActiveTab] = useState("All");
    const tabs = ["All", "1st Year", "2nd Year", "3rd Year", "4th Year"];
    
    const coursesList = [
        { id: "2021101", name: "Mathematics - I", year: "1st Year", att: "92%", res: "O", prog: 100 },
        { id: "2021102", name: "Applied Physics", year: "1st Year", att: "88%", res: "A+", prog: 100 },
        { id: "2005103", name: "C Programming & Data Structures", year: "1st Year", att: "95%", res: "O", prog: 100 },
        { id: "2024104", name: "English", year: "1st Year", att: "--", res: "--", prog: 0 },
        { id: "2021301", name: "Discrete Mathematics", year: "2nd Year", att: "--", res: "--", prog: 0 },
        { id: "2005302", name: "Database Management Systems", year: "2nd Year", att: "--", res: "--", prog: 0 }
    ];

    const filteredCourses = activeTab === "All" ? coursesList : coursesList.filter(c => c.year === activeTab);

    return (
        <div className="space-y-8 max-w-7xl mx-auto p-6 lg:p-8 font-sans">
            {/* Header section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-50 flex items-center gap-3 mb-2">
                        <BookOpen className="w-7 h-7 text-indigo-400"/> My Courses
                    </h1>
                    <p className="text-slate-400 text-sm">Access your courses from 1st Year to Final Year.</p>
                </div>
            </div>
            
            {/* Top Filter Row - Pill Toggles */}
            <div className="flex flex-wrap gap-2">
                {tabs.map((t, i) => (
                    <button 
                        key={i} 
                        onClick={() => setActiveTab(t)}
                        className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                            activeTab === t 
                                ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/25" 
                                : "bg-[#221F32]/80 backdrop-blur text-slate-300 border border-white/10 hover:bg-white/10"
                        }`}
                    >
                        {t}
                    </button>
                ))}
            </div>

            {/* Course Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCourses.map((c, i) => (
                    <div key={i} className="bg-[#221F32]/80 backdrop-blur rounded-2xl p-6 border border-white/10 hover:border-indigo-500/50 transition-colors shadow-lg flex flex-col group">
                        
                        {/* Header: Subject Code & Year Badge */}
                        <div className="flex justify-between items-start mb-4">
                            <span className="bg-indigo-500/20 text-indigo-300 text-xs px-2.5 py-1 rounded font-bold">{c.id}</span>
                            <span className="bg-black/20 text-slate-400 text-xs px-2.5 py-1 rounded border border-white/10">{c.year}</span>
                        </div>
                        
                        {/* Title: Subject Name */}
                        <h3 className="text-xl font-bold text-slate-50 mb-8 leading-tight group-hover:text-indigo-200 transition-colors">{c.name}</h3>
                        
                        {/* Metrics: Attendance & Result */}
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="bg-black/20 rounded-xl p-3 border border-white/10">
                                <span className="text-xs text-slate-400 block mb-1 flex items-center gap-1"><BookOpen className="w-3 h-3"/> Attendance</span>
                                <span className="text-lg font-bold text-green-400">{c.att}</span>
                            </div>
                            <div className="bg-black/20 rounded-xl p-3 border border-white/10">
                                <span className="text-xs text-slate-400 block mb-1 flex items-center gap-1">🏆 Result</span>
                                <span className="text-lg font-bold text-green-400">{c.res}</span>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="mb-6 mt-auto">
                            <div className="flex justify-between text-xs mb-2">
                                <span className="text-slate-400">Course Progress</span>
                                <span className="text-slate-50 font-medium">{c.prog}%</span>
                            </div>
                            <div className="h-1.5 bg-black/40 rounded-full overflow-hidden border border-white/5">
                                <div className="h-full bg-green-400 rounded-full shadow-[0_0_10px_rgba(74,222,128,0.5)]" style={{ width: `${c.prog}%` }}></div>
                            </div>
                        </div>

                        {/* Footer: Ghost Button */}
                        <button className="w-full bg-white/5 border border-white/10 hover:bg-white/10 hover:text-white text-slate-300 py-3 rounded-xl text-sm font-medium transition flex items-center justify-center gap-2">
                            <Download className="w-4 h-4" /> Download Syllabus
                        </button>
                    </div>
                ))}
            </div>
        </div>
    )
}
