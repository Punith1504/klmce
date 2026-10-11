import React from 'react';
import prisma from '@/lib/prisma';
import { BookOpen, Upload, FileText, CheckCircle2, Download, Plus, Clock } from 'lucide-react';

export const dynamic = 'force-dynamic';

const DEFAULT_COURSES = [
    {
        code: "20A05401T",
        title: "Database Management Systems",
        branch: "CSE-A & CSE-B (IV Sem)",
        unitsCompleted: 4,
        totalUnits: 5,
        studentsCount: 124,
        materials: [
            { name: "Unit 3 - Normalization & BCNF Notes.pdf", size: "2.4 MB", date: "08 Oct 2026" },
            { name: "Unit 4 - Transaction Management & ACID.pdf", size: "3.1 MB", date: "10 Oct 2026" }
        ]
    },
    {
        code: "20A05402T",
        title: "Operating Systems & Concurrency",
        branch: "CSE-A (IV Sem)",
        unitsCompleted: 3,
        totalUnits: 5,
        studentsCount: 62,
        materials: [
            { name: "Unit 2 - CPU Scheduling Algorithms.pdf", size: "1.8 MB", date: "02 Oct 2026" },
            { name: "Unit 3 - Deadlocks & Banker's Algorithm.pdf", size: "2.9 MB", date: "05 Oct 2026" }
        ]
    },
    {
        code: "20A05701T",
        title: "Cloud Computing & Distributed Systems",
        branch: "CSE-B (VII Sem)",
        unitsCompleted: 2,
        totalUnits: 5,
        studentsCount: 60,
        materials: [
            { name: "Unit 1 - Cloud Virtualization & Hypervisors.pdf", size: "4.2 MB", date: "28 Sep 2026" }
        ]
    }
];

export default async function Page() {
    // Fetch live data from Prisma
    const items = await prisma.courseMaterial.findMany({
        take: 10,
        orderBy: { id: 'desc' }
    }).catch(() => []); // Fallback for empty DB

    return (
        <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 font-sans text-white">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-50 flex items-center gap-3 mb-2">
                        <BookOpen className="w-6 h-6 sm:w-7 sm:h-7 text-indigo-400"/> My Teaching & LMS
                    </h1>
                    <p className="text-slate-400 text-xs sm:text-sm">Manage course syllabus, upload lecture notes, and track JNTUA curriculum coverage.</p>
                </div>
                <button className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 min-h-[44px] rounded-xl text-sm font-semibold transition shadow-[0_4px_14px_0_rgba(79,70,229,0.39)] flex items-center justify-center gap-2">
                    <Upload className="w-4 h-4" /> Upload Course Material
                </button>
            </div>

            {/* Course Cards Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {DEFAULT_COURSES.map((course) => {
                    const coveragePct = Math.round((course.unitsCompleted / course.totalUnits) * 100);
                    return (
                        <div key={course.code} className="bg-[#221F32]/80 backdrop-blur rounded-2xl p-5 sm:p-6 border border-white/10 shadow-lg flex flex-col justify-between">
                            <div>
                                <div className="flex justify-between items-start mb-3">
                                    <span className="text-xs font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-md border border-indigo-500/20">
                                        {course.code}
                                    </span>
                                    <span className="text-xs text-slate-400">{course.studentsCount} Students</span>
                                </div>
                                <h3 className="text-base sm:text-lg font-bold text-slate-50 leading-snug">{course.title}</h3>
                                <p className="text-xs text-slate-400 mt-1">{course.branch}</p>

                                {/* Syllabus Progress */}
                                <div className="mt-4 pt-4 border-t border-white/10">
                                    <div className="flex justify-between text-xs mb-1.5">
                                        <span className="text-slate-400">Syllabus Covered</span>
                                        <span className="font-bold text-emerald-400">{course.unitsCompleted}/{course.totalUnits} Units ({coveragePct}%)</span>
                                    </div>
                                    <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 rounded-full transition-all duration-500"
                                            style={{ width: `${coveragePct}%` }}
                                        />
                                    </div>
                                </div>

                                {/* Materials List */}
                                <div className="mt-4 space-y-2">
                                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Recent Materials</p>
                                    {course.materials.map((mat, i) => (
                                        <div key={i} className="flex items-center justify-between p-2.5 rounded-xl bg-black/30 border border-white/5 text-xs">
                                            <div className="flex items-center gap-2 truncate mr-2">
                                                <FileText className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                                                <span className="truncate text-slate-200">{mat.name}</span>
                                            </div>
                                            <span className="text-[10px] text-slate-400 shrink-0">{mat.size}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="mt-5 pt-4 border-t border-white/10 flex gap-2">
                                <button className="flex-1 min-h-[40px] bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition">
                                    <Upload className="w-3.5 h-3.5" /> Add Unit
                                </button>
                                <button className="flex-1 min-h-[40px] bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition">
                                    View Syllabus
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Prisma DB Uploads Table / Mobile Cards */}
            {items.length > 0 && (
                <div className="bg-[#221F32]/80 backdrop-blur rounded-2xl border border-white/10 shadow-lg overflow-hidden">
                    <div className="p-4 sm:p-6 border-b border-white/10 bg-black/20">
                        <h2 className="text-base sm:text-lg font-bold text-slate-50">Uploaded Materials Vault</h2>
                    </div>

                    {/* Mobile cards */}
                    <div className="block md:hidden divide-y divide-white/5">
                        {items.map((item: any) => (
                            <div key={item.id} className="p-4 space-y-1">
                                <h4 className="font-semibold text-sm text-slate-200">{String(item.title)}</h4>
                                <p className="text-xs text-slate-400">Course ID: {String(item.courseId)}</p>
                                <p className="text-[10px] text-slate-500">{String(item.createdAt)}</p>
                            </div>
                        ))}
                    </div>

                    {/* Desktop table */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="text-xs uppercase text-slate-400 border-b border-white/10 bg-black/40">
                                    <th className="py-3 px-6">ID</th>
                                    <th className="py-3 px-6">Title</th>
                                    <th className="py-3 px-6">Course ID</th>
                                    <th className="py-3 px-6">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {items.map((item: any) => (
                                    <tr key={item.id} className="hover:bg-white/5 transition-colors">
                                        <td className="py-4 px-6 text-xs text-slate-500 font-mono">{String(item.id).substring(0, 8)}</td>
                                        <td className="py-4 px-6 text-sm text-slate-200 font-medium">{String(item.title)}</td>
                                        <td className="py-4 px-6 text-sm text-slate-300">{String(item.courseId)}</td>
                                        <td className="py-4 px-6 text-sm text-slate-400">{String(item.createdAt)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
