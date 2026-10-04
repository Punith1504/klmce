"use client";
import React from 'react';
import { 
    Award, 
    BookOpen, 
    CalendarClock, 
    CheckCircle2, 
    FileText, 
    GraduationCap, 
    UserCheck, 
    PieChart,
} from "lucide-react";

export default function StudentResultsClient({ 
    performance, 
    acquiredResults, 
    exams 
}: { 
    performance: any, 
    acquiredResults: any[], 
    exams: any[] 
}) {
    return (
        <div className="space-y-8 max-w-7xl mx-auto p-6 lg:p-8 font-sans">
            
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-slate-50 flex items-center gap-3 mb-2">
                    <Award className="w-8 h-8 text-amber-400"/> Examinations & Results
                </h1>
                <p className="text-slate-400 text-sm">View your academic performance, weightages, and invigilation schedules.</p>
            </div>

            {/* Top KPIs: Overall Performance */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                <div className="bg-[#221F32]/80 backdrop-blur rounded-3xl p-6 border border-white/10 shadow-lg relative overflow-hidden flex items-center justify-between">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
                    <div className="relative z-10">
                        <p className="text-sm text-slate-400 font-semibold mb-1">Cumulative CGPA</p>
                        <h3 className="text-4xl font-bold text-amber-400 tracking-tight">{performance.cgpa}</h3>
                    </div>
                    <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center relative z-10">
                        <GraduationCap className="w-7 h-7 text-amber-400" />
                    </div>
                </div>

                <div className="bg-[#221F32]/80 backdrop-blur rounded-3xl p-6 border border-white/10 shadow-lg relative overflow-hidden flex items-center justify-between">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-fuchsia-500/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
                    <div className="relative z-10">
                        <p className="text-sm text-slate-400 font-semibold mb-1">Credits Earned</p>
                        <h3 className="text-4xl font-bold text-fuchsia-400 tracking-tight">
                            {performance.creditsEarned} <span className="text-xl text-slate-500 font-medium">/ {performance.totalCredits}</span>
                        </h3>
                    </div>
                    <div className="w-14 h-14 rounded-2xl bg-fuchsia-500/10 border border-fuchsia-500/20 flex items-center justify-center relative z-10">
                        <BookOpen className="w-7 h-7 text-fuchsia-400" />
                    </div>
                </div>

                <div className="bg-[#221F32]/80 backdrop-blur rounded-3xl p-6 border border-white/10 shadow-lg relative overflow-hidden flex items-center justify-between">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
                    <div className="relative z-10">
                        <p className="text-sm text-slate-400 font-semibold mb-1">Batch Rank</p>
                        <h3 className="text-4xl font-bold text-indigo-400 tracking-tight">
                            {performance.rank} <span className="text-xl text-slate-500 font-medium text-base">/ {performance.batchSize}</span>
                        </h3>
                    </div>
                    <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center relative z-10">
                        <PieChart className="w-7 h-7 text-indigo-400" />
                    </div>
                </div>
                
            </div>

            {/* Acquired Results & Weightages */}
            <div>
                <h2 className="text-xl font-bold text-slate-50 mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-emerald-400" /> Published Results
                </h2>
                <div className="bg-[#221F32]/80 backdrop-blur rounded-3xl border border-white/10 shadow-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[800px]">
                            <thead>
                                <tr className="bg-white/[0.02] text-slate-300 text-xs uppercase tracking-wider border-b border-white/10">
                                    <th className="p-5 font-semibold">Subject & Exam</th>
                                    <th className="p-5 font-semibold">Marks Obtained</th>
                                    <th className="p-5 font-semibold">Weightage</th>
                                    <th className="p-5 font-semibold text-center">Grade</th>
                                    <th className="p-5 font-semibold text-right">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5 text-sm text-slate-200">
                                {acquiredResults.length > 0 ? acquiredResults.map((result) => (
                                    <tr key={result.id} className="hover:bg-white/[0.02] transition-colors">
                                        <td className="p-5">
                                            <p className="font-bold text-slate-100">{result.subject}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-xs text-slate-500 font-medium">{result.code} - {result.examName}</span>
                                                <span className="text-[10px] bg-white/10 text-slate-300 px-2 py-0.5 rounded-full border border-white/10">
                                                    {result.credits} Credits
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-5">
                                            <div className="flex items-end gap-1">
                                                <span className="text-xl font-bold text-slate-100">{result.marks}</span>
                                                <span className="text-xs text-slate-500 font-medium pb-0.5">/ {result.max}</span>
                                            </div>
                                        </td>
                                        <td className="p-5">
                                            <span className="text-lg font-semibold text-slate-300">{result.weightage}%</span>
                                        </td>
                                        <td className="p-5 text-center">
                                            <span className={`inline-flex w-10 h-10 items-center justify-center rounded-xl text-lg font-bold border ${
                                                result.grade === 'O' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                                                result.grade === 'A' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                                                'bg-indigo-500/20 text-indigo-400 border-indigo-500/30'
                                            }`}>
                                                {result.grade}
                                            </span>
                                        </td>
                                        <td className="p-5 text-right">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${
                                                result.status === 'Pass' 
                                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                                    : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                                            }`}>
                                                <CheckCircle2 className="w-3.5 h-3.5" />
                                                {result.status}
                                            </span>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={5} className="p-8 text-center text-slate-500">
                                            No results published yet.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Examination & Invigilation Schedules */}
            <div>
                <h2 className="text-xl font-bold text-slate-50 mb-4 flex items-center gap-2">
                    <CalendarClock className="w-5 h-5 text-indigo-400" /> Exam Schedules & Invigilation
                </h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {exams.length > 0 ? exams.map((exam) => (
                        <div key={exam.id} className="bg-[#221F32]/80 backdrop-blur rounded-3xl p-6 border border-white/10 shadow-lg relative group hover:border-indigo-500/30 transition-colors overflow-hidden">
                            
                            <div className="flex justify-between items-start mb-4 relative z-10">
                                <div>
                                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-md border border-indigo-500/20 mb-2 inline-block">
                                        {exam.title}
                                    </span>
                                    <h3 className="text-lg font-bold text-slate-50 leading-tight">{exam.subject}</h3>
                                    <p className="text-sm text-slate-400 mt-0.5">{exam.code}</p>
                                </div>
                                <span className={`text-[10px] uppercase font-bold tracking-wider px-3 py-1.5 rounded-full border ${
                                    exam.status === 'Upcoming' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-white/5 text-slate-400 border-white/10'
                                }`}>
                                    {exam.status}
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-5 relative z-10">
                                <div className="bg-black/20 p-3 rounded-xl border border-white/5">
                                    <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-1">Date & Time</p>
                                    <p className="text-sm text-slate-200 font-semibold">{exam.date}</p>
                                    <p className="text-xs text-slate-400">{exam.time}</p>
                                </div>
                                <div className="bg-black/20 p-3 rounded-xl border border-white/5">
                                    <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-1">Venue</p>
                                    <p className="text-sm text-slate-200 font-semibold">{exam.room}</p>
                                </div>
                            </div>

                            <div className="space-y-3 pt-4 border-t border-white/10 relative z-10">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                                        <BookOpen className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Course Type</p>
                                        <p className="text-sm text-slate-200 font-medium">{exam.courseType}</p>
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 shrink-0">
                                        <UserCheck className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Invigilator</p>
                                        <p className="text-sm text-slate-200 font-medium">{exam.invigilator}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-indigo-500/10 transition-colors"></div>
                        </div>
                    )) : (
                        <div className="col-span-1 lg:col-span-2 text-slate-500 text-center py-8">
                            No upcoming exams scheduled.
                        </div>
                    )}
                </div>
            </div>

        </div>
    );
}
