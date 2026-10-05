"use client";

import React, { useState } from 'react';
import { BookOpen, TrendingUp, Calendar, Target, Award } from "lucide-react";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from 'recharts';

export default function StudentAcademicsPage() {
    const [activeSemester, setActiveSemester] = useState("Semester 4");

    // Mock Data for Analytics
    const cgpaTrend = [
        { name: 'Sem 1', sgpa: 8.2 },
        { name: 'Sem 2', sgpa: 8.5 },
        { name: 'Sem 3', sgpa: 8.1 },
        { name: 'Sem 4', sgpa: 8.8 },
    ];

    const currentMarks = [
        { subject: 'Math', marks: 92 },
        { subject: 'Physics', marks: 88 },
        { subject: 'CS', marks: 95 },
        { subject: 'English', marks: 78 },
        { subject: 'DBMS', marks: 85 },
    ];

    const results = [
        { code: "20CS401", name: "Database Management Systems", credits: 3, grade: "A+", points: 9 },
        { code: "20CS402", name: "Operating Systems", credits: 3, grade: "O", points: 10 },
        { code: "20CS403", name: "Design and Analysis of Algorithms", credits: 4, grade: "A", points: 8 },
        { code: "20HS404", name: "Managerial Economics", credits: 2, grade: "A+", points: 9 },
        { code: "20CS405", name: "Java Programming", credits: 3, grade: "O", points: 10 },
    ];

    return (
        <div className="space-y-8 max-w-7xl mx-auto p-6 lg:p-8 font-sans">
            {/* Header Section */}
            <div>
                <h1 className="text-3xl font-bold text-slate-50 flex items-center gap-3 mb-2">
                    <TrendingUp className="w-7 h-7 text-indigo-400"/> Academics & Analytics
                </h1>
                <p className="text-slate-400 text-sm">Track your attendance, exam results, and performance trends.</p>
            </div>
            
            {/* Top KPI Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Attendance KPI */}
                <div className="bg-[#221F32]/80 backdrop-blur rounded-2xl p-6 border border-white/10 shadow-lg">
                    <div className="flex justify-between items-start mb-4">
                        <div className="bg-emerald-500/20 p-2 rounded-lg text-emerald-400">
                            <Calendar className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded">On Track</span>
                    </div>
                    <h3 className="text-3xl font-bold text-slate-50 mb-1">88.5%</h3>
                    <p className="text-slate-400 text-sm font-medium">Overall Attendance</p>
                    <div className="mt-4 h-1.5 w-full bg-black/40 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-400 rounded-full shadow-[0_0_10px_rgba(52,211,153,0.5)]" style={{ width: '88.5%' }}></div>
                    </div>
                </div>

                {/* CGPA KPI */}
                <div className="bg-[#221F32]/80 backdrop-blur rounded-2xl p-6 border border-white/10 shadow-lg">
                    <div className="flex justify-between items-start mb-4">
                        <div className="bg-indigo-500/20 p-2 rounded-lg text-indigo-400">
                            <Award className="w-5 h-5" />
                        </div>
                    </div>
                    <h3 className="text-3xl font-bold text-slate-50 mb-1">8.54</h3>
                    <p className="text-slate-400 text-sm font-medium">Cumulative GPA</p>
                    <p className="text-indigo-400 text-xs mt-3 font-medium">+0.2 from last semester</p>
                </div>

                {/* Credits KPI */}
                <div className="bg-[#221F32]/80 backdrop-blur rounded-2xl p-6 border border-white/10 shadow-lg">
                    <div className="flex justify-between items-start mb-4">
                        <div className="bg-fuchsia-500/20 p-2 rounded-lg text-fuchsia-400">
                            <Target className="w-5 h-5" />
                        </div>
                    </div>
                    <h3 className="text-3xl font-bold text-slate-50 mb-1">84</h3>
                    <p className="text-slate-400 text-sm font-medium">Credits Earned</p>
                    <p className="text-slate-500 text-xs mt-3">Out of 160 required</p>
                </div>
                
                {/* Pending Assessments */}
                <div className="bg-[#221F32]/80 backdrop-blur rounded-2xl p-6 border border-white/10 shadow-lg">
                    <div className="flex justify-between items-start mb-4">
                        <div className="bg-amber-500/20 p-2 rounded-lg text-amber-400">
                            <BookOpen className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-1 rounded">Action Needed</span>
                    </div>
                    <h3 className="text-3xl font-bold text-slate-50 mb-1">3</h3>
                    <p className="text-slate-400 text-sm font-medium">Pending Assessments</p>
                    <p className="text-amber-400 text-xs mt-3 font-medium">Next due in 2 days</p>
                </div>
            </div>

            {/* Analytics Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Performance Trend (Line Chart) */}
                <div className="bg-[#221F32]/80 backdrop-blur rounded-2xl p-6 border border-white/10 shadow-lg">
                    <h3 className="text-lg font-bold text-slate-50 mb-6">Performance Trend (SGPA)</h3>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={cgpaTrend} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} domain={[0, 10]} />
                                <RechartsTooltip 
                                    contentStyle={{ backgroundColor: '#13111C', border: '1px solid #ffffff10', borderRadius: '8px', color: '#f8fafc' }}
                                    itemStyle={{ color: '#818cf8' }}
                                />
                                <Line type="monotone" dataKey="sgpa" stroke="#818cf8" strokeWidth={3} dot={{ r: 4, fill: '#818cf8', strokeWidth: 0 }} activeDot={{ r: 6, fill: '#6366f1' }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Subject Wise Performance (Bar Chart) */}
                <div className="bg-[#221F32]/80 backdrop-blur rounded-2xl p-6 border border-white/10 shadow-lg">
                    <h3 className="text-lg font-bold text-slate-50 mb-6">Mid-Term 1 Marks</h3>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={currentMarks} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                                <XAxis dataKey="subject" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} />
                                <RechartsTooltip 
                                    contentStyle={{ backgroundColor: '#13111C', border: '1px solid #ffffff10', borderRadius: '8px' }}
                                    cursor={{fill: '#ffffff05'}}
                                />
                                <Bar dataKey="marks" radius={[4, 4, 0, 0]}>
                                    {currentMarks.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.marks > 90 ? '#34d399' : entry.marks > 80 ? '#818cf8' : '#f472b6'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Exam Results Table */}
            <div className="bg-[#221F32]/80 backdrop-blur rounded-2xl border border-white/10 shadow-lg overflow-hidden">
                <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/[0.02]">
                    <h3 className="text-lg font-bold text-slate-50">Exam Results Directory</h3>
                    <select 
                        value={activeSemester} 
                        onChange={(e) => setActiveSemester(e.target.value)}
                        className="bg-black/20 border border-white/10 text-slate-300 text-sm rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                        {["Semester 1", "Semester 2", "Semester 3", "Semester 4"].map(s => (
                            <option key={s} value={s} className="bg-[#13111C]">{s}</option>
                        ))}
                    </select>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-black/20 border-b border-white/5 text-xs uppercase text-slate-400 tracking-wider">
                                <th className="px-6 py-4 font-semibold">Course Code</th>
                                <th className="px-6 py-4 font-semibold">Course Name</th>
                                <th className="px-6 py-4 font-semibold text-center">Credits</th>
                                <th className="px-6 py-4 font-semibold text-center">Grade</th>
                                <th className="px-6 py-4 font-semibold text-center">Grade Points</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {results.map((row, i) => (
                                <tr key={i} className="hover:bg-white/[0.02] transition-colors group">
                                    <td className="px-6 py-4 text-indigo-400 font-mono text-sm font-bold">{row.code}</td>
                                    <td className="px-6 py-4 text-slate-200 font-medium">{row.name}</td>
                                    <td className="px-6 py-4 text-slate-300 text-center">{row.credits}</td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`px-2 py-1 rounded text-xs font-bold border ${
                                            row.grade.includes('O') ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                            row.grade.includes('A') ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' :
                                            'bg-slate-500/10 text-slate-400 border-slate-500/20'
                                        }`}>
                                            {row.grade}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-slate-300 font-medium text-center">{row.points}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    )
}
