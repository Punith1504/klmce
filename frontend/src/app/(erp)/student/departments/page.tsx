"use client";

import React, { useState } from 'react';
import { Mail, Book, Info, MessageSquare, Users } from "lucide-react";

export default function DepartmentsPage() {
    const [activeTab, setActiveTab] = useState("Computer Science");
    const tabs = ["Computer Science", "Electronics & Comm.", "Electrical", "Mechanical", "Civil"];
    
    const faculty = [
        { name: "Dr. V. Lokeswara Reddy", role: "Professor & HOD", degree: "Ph.D in Computer Science", subjects: ["Discrete Mathematics", "Machine Learning"], email: "hod.cse@klmce.ac.in", initial: "V" },
        { name: "Dr. M. Sreenivasulu", role: "Professor", degree: "Ph.D in Data Mining", subjects: ["Database Management Systems", "Data Science"], email: "sreenivasulu.m@klmce.ac.in", initial: "M" },
        { name: "Dr. N. Ramanjaneya Reddy", role: "Associate Professor", degree: "Ph.D in IoT", subjects: ["Digital Logic Design", "Computer Networks"], email: "ramanjaneya.n@klmce.ac.in", initial: "N" },
        { name: "Dr. S. M. Farooq", role: "Associate Professor", degree: "Ph.D in Software Engg", subjects: ["Software Engineering", "Cloud Computing"], email: "farooq.sm@klmce.ac.in", initial: "S" },
        { name: "Dr. K. Srinivasa Rao", role: "Professor", degree: "Ph.D in Algorithms", subjects: ["Design & Analysis of Algorithms"], email: "srinivasa.k@klmce.ac.in", initial: "K" },
        { name: "Sri. Nagaraju Rayapati", role: "Assistant Professor", degree: "M.Tech (CSE)", subjects: ["Object Oriented Programming through Java"], email: "nagaraju.r@klmce.ac.in", initial: "N" }
    ];

    return (
        <div className="space-y-8 max-w-7xl mx-auto p-6 lg:p-8 font-sans">
            <div>
                <h1 className="text-3xl font-bold text-slate-50 flex items-center gap-3 mb-2">
                    <Users className="w-7 h-7 text-indigo-400"/> Departments & Faculty
                </h1>
                <p className="text-slate-400 text-sm">Connect with your professors and explore department directories.</p>
            </div>
            
            {/* Horizontal Scrollable Tabs */}
            <div className="flex overflow-x-auto gap-3 pb-2 scrollbar-none">
                {tabs.map((t, i) => (
                    <button 
                        key={i} 
                        onClick={() => setActiveTab(t)}
                        className={`px-5 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
                            activeTab === t 
                                ? "bg-indigo-600 text-white shadow-[0_4px_14px_0_rgba(79,70,229,0.39)]" 
                                : "bg-[#221F32]/80 backdrop-blur text-slate-300 border border-white/10 hover:bg-white/10"
                        }`}
                    >
                        {t}
                    </button>
                ))}
            </div>

            {/* Responsive Grid for Faculty Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {faculty.map((f, i) => (
                    <div key={i} className="bg-[#221F32]/80 backdrop-blur rounded-2xl p-6 border border-white/10 hover:border-indigo-500/50 transition-colors shadow-lg flex flex-col group">
                        
                        {/* Avatar & Details Header */}
                        <div className="flex items-start gap-4 mb-6">
                            <div className="w-14 h-14 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-xl font-bold text-indigo-300 shrink-0 shadow-inner">
                                {f.initial}
                            </div>
                            <div>
                                <h3 className="text-slate-50 font-bold leading-tight group-hover:text-indigo-200 transition-colors">{f.name}</h3>
                                <p className="text-indigo-400 text-sm mt-1 font-medium">{f.role}</p>
                            </div>
                        </div>
                        
                        <div className="space-y-4 mb-8 flex-1">
                            {/* Degree */}
                            <div className="flex items-center gap-3 text-xs text-slate-300">
                                <Book className="w-4 h-4 text-slate-500 shrink-0" />
                                <span>{f.degree}</span>
                            </div>
                            
                            {/* Tags */}
                            <div className="flex items-start gap-3 text-xs text-slate-300">
                                <Book className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                                <div className="flex flex-wrap gap-2">
                                    {f.subjects.map(s => (
                                        <span key={s} className="px-2.5 py-1 bg-black/20 border border-white/10 rounded-md shadow-sm font-medium">
                                            {s}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            
                            {/* Contact */}
                            <div className="flex items-center gap-3 text-xs text-slate-300">
                                <Mail className="w-4 h-4 text-slate-500 shrink-0" />
                                <span>{f.email}</span>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 mt-auto">
                            <button className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-50 py-2.5 rounded-xl text-sm font-medium transition flex items-center justify-center gap-2">
                                <Info className="w-4 h-4" /> Profile
                            </button>
                            <button className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white py-2.5 rounded-xl text-sm font-medium transition flex items-center justify-center gap-2 shadow-[0_4px_14px_0_rgba(79,70,229,0.39)]">
                                <MessageSquare className="w-4 h-4" /> Message
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
