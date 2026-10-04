"use client";
import React from 'react';
import { 
    CheckCircle2, 
    XCircle, 
    Target, 
    TrendingUp, 
    CalendarCheck, 
    AlertTriangle,
} from "lucide-react";

export default function StudentAttendanceClient({ 
    cumulative, 
    subjects, 
    history 
}: { 
    cumulative: any, 
    subjects: any[], 
    history: any[] 
}) {
    return (
        <div className="space-y-8 max-w-7xl mx-auto p-6 lg:p-8 font-sans">
            
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-slate-50 flex items-center gap-3 mb-2">
                    <CalendarCheck className="w-8 h-8 text-emerald-400"/> Attendance & Projections
                </h1>
                <p className="text-slate-400 text-sm">Track your class attendance, view faculty logs, and analyze shortage projections.</p>
            </div>

            {/* Top KPIs: Cumulative Projections */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                
                {/* Current Overall */}
                <div className="bg-[#221F32]/80 backdrop-blur rounded-2xl p-6 border border-white/10 shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                    <p className="text-sm text-slate-400 font-semibold mb-1">Overall Attendance</p>
                    <div className="flex items-end gap-2">
                        <h3 className={`text-4xl font-bold tracking-tight ${cumulative.currentPercentage >= 80 ? 'text-emerald-400' : 'text-amber-400'}`}>
                            {cumulative.currentPercentage}%
                        </h3>
                    </div>
                    <div className="mt-4 text-xs font-medium text-slate-300 bg-white/5 inline-block px-3 py-1.5 rounded-lg border border-white/5">
                        Attended <strong className="text-white">{cumulative.attended}</strong> out of <strong className="text-white">{cumulative.held}</strong> classes
                    </div>
                </div>

                {/* Target 80% Predictor */}
                <div className="bg-[#221F32]/80 backdrop-blur rounded-2xl p-6 border border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.1)] relative overflow-hidden">
                    <p className="text-sm text-amber-200/80 font-semibold mb-1 flex items-center gap-2">
                        <Target className="w-4 h-4" /> 80% Target Goal
                    </p>
                    <div className="flex items-end gap-2 mt-2">
                        <h3 className="text-3xl font-bold text-white tracking-tight">
                            {cumulative.classesTo80} <span className="text-lg text-slate-400 font-medium">classes</span>
                        </h3>
                    </div>
                    <p className="mt-3 text-xs text-amber-200/60 leading-relaxed">
                        {cumulative.classesTo80 === "Impossible" ? (
                            <span className="text-rose-400 font-semibold">Impossible to reach 80% overall threshold.</span>
                        ) : cumulative.classesTo80 === 0 ? (
                            <span className="text-emerald-400 font-semibold">You are already above 80%! Keep it up.</span>
                        ) : (
                            <>You must attend the next <strong className="text-amber-400">{cumulative.classesTo80} consecutive classes</strong> without taking leave to hit the 80% mandatory threshold.</>
                        )}
                    </p>
                </div>

                {/* Max Possible Predictor */}
                <div className="bg-[#221F32]/80 backdrop-blur rounded-2xl p-6 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)] relative overflow-hidden lg:col-span-2 flex flex-col justify-center">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
                    <div className="flex justify-between items-start z-10 relative">
                        <div>
                            <p className="text-sm text-emerald-200/80 font-semibold mb-1 flex items-center gap-2">
                                <TrendingUp className="w-4 h-4" /> Maximum Possible Attendance
                            </p>
                            <h3 className="text-3xl font-bold text-emerald-400 tracking-tight mt-2">
                                {cumulative.maxPossible}%
                            </h3>
                            <p className="mt-3 text-xs text-emerald-200/60 leading-relaxed max-w-sm">
                                If you attend <strong className="text-emerald-400">all {cumulative.totalFutureClasses} remaining classes</strong> in this semester, your final cumulative attendance will peak at {cumulative.maxPossible}%.
                            </p>
                        </div>
                        <div className="hidden sm:block p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
                            <TrendingUp className="w-8 h-8 text-emerald-400" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Subject Wise Breakdown */}
            <div>
                <h2 className="text-xl font-bold text-slate-50 mb-4">Subject-Wise Projections</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {subjects.map((sub, idx) => (
                        <div key={idx} className={`bg-[#221F32]/80 backdrop-blur rounded-2xl p-6 border shadow-lg ${
                            sub.status === 'safe' ? 'border-emerald-500/20' : 
                            sub.status === 'warning' ? 'border-amber-500/20' : 'border-rose-500/30 shadow-[0_0_15px_rgba(244,63,94,0.1)]'
                        }`}>
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-slate-50 font-bold leading-tight pr-4">{sub.name}</h3>
                                    <p className="text-xs text-slate-400 font-medium mt-1">{sub.code}</p>
                                </div>
                                <div className={`text-xl font-bold shrink-0 ${
                                    sub.percentage >= 80 ? 'text-emerald-400' : 
                                    sub.percentage >= 75 ? 'text-amber-400' : 'text-rose-400'
                                }`}>
                                    {sub.percentage}%
                                </div>
                            </div>
                            
                            {/* Progress Bar */}
                            <div className="w-full bg-black/40 rounded-full h-1.5 mb-5 overflow-hidden">
                                <div className={`h-1.5 rounded-full ${
                                    sub.percentage >= 80 ? 'bg-emerald-400' : 
                                    sub.percentage >= 75 ? 'bg-amber-400' : 'bg-rose-400'
                                }`} style={{ width: `${sub.percentage}%` }}></div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                                <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Attended</p>
                                    <p className="text-slate-200 font-semibold">{sub.attended} <span className="text-slate-500 text-xs font-normal">/ {sub.held}</span></p>
                                </div>
                                <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Max Possible</p>
                                    <p className="text-slate-200 font-semibold">{sub.maxPossible}%</p>
                                </div>
                            </div>

                            <div className="mt-auto">
                                {sub.status === 'safe' && (
                                    <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-400/10 p-2.5 rounded-lg border border-emerald-400/20">
                                        <CheckCircle2 className="w-4 h-4 shrink-0" /> Safe zone. Keep it up!
                                    </div>
                                )}
                                {sub.status === 'warning' && (
                                    <div className="flex items-center gap-2 text-xs text-amber-400 bg-amber-400/10 p-2.5 rounded-lg border border-amber-400/20">
                                        <Target className="w-4 h-4 shrink-0" /> Attend next {sub.classesTo80} classes for 80%.
                                    </div>
                                )}
                                {sub.status === 'danger' && sub.classesTo80 !== "Impossible" && (
                                    <div className="flex items-center gap-2 text-xs text-rose-400 bg-rose-500/10 p-2.5 rounded-lg border border-rose-500/20">
                                        <AlertTriangle className="w-4 h-4 shrink-0" /> Critical: Need next {sub.classesTo80} classes!
                                    </div>
                                )}
                                {sub.status === 'danger' && sub.classesTo80 === "Impossible" && (
                                    <div className="flex items-start gap-2 text-xs text-rose-400 bg-rose-500/10 p-2.5 rounded-lg border border-rose-500/20">
                                        <XCircle className="w-4 h-4 shrink-0 mt-0.5" /> 
                                        <span>Impossible to reach 80%. Max cap is {sub.maxPossible}%. Condonation required.</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Recent History Table */}
            <div>
                <h2 className="text-xl font-bold text-slate-50 mb-4">Recent Attendance Logs</h2>
                <div className="bg-[#221F32]/80 backdrop-blur rounded-2xl border border-white/10 shadow-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-black/20 text-slate-400 text-xs uppercase tracking-wider border-b border-white/10">
                                    <th className="p-4 font-semibold">Date & Time</th>
                                    <th className="p-4 font-semibold">Subject & Location</th>
                                    <th className="p-4 font-semibold">Faculty</th>
                                    <th className="p-4 font-semibold text-right">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5 text-sm text-slate-300">
                                {history.length > 0 ? history.map((row) => (
                                    <tr key={row.id} className="hover:bg-white/[0.02] transition-colors">
                                        <td className="p-4 whitespace-nowrap">
                                            <p className="font-semibold text-slate-200">{row.date}</p>
                                            <p className="text-xs text-slate-500">{row.time}</p>
                                        </td>
                                        <td className="p-4">
                                            <p className="font-semibold text-slate-200">{row.subject}</p>
                                            <p className="text-xs text-slate-500">{row.location}</p>
                                        </td>
                                        <td className="p-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-[10px] font-bold uppercase">
                                                    {row.faculty.charAt(row.faculty.indexOf('.') + 2) || row.faculty.charAt(0)}
                                                </div>
                                                {row.faculty}
                                            </div>
                                        </td>
                                        <td className="p-4 text-right whitespace-nowrap">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${
                                                row.status === 'Present' 
                                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                                    : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                                            }`}>
                                                {row.status === 'Present' ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                                                {row.status}
                                            </span>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={4} className="p-8 text-center text-slate-500">
                                            No attendance records found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

        </div>
    );
}
