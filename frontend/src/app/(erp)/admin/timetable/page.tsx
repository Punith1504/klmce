import React from 'react';
import prisma from '@/lib/prisma';
import { Calendar, Clock, MapPin, Users } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminTimetablePage() {
    // Fetch upcoming exam schedules as a proxy for timetable events right now
    const upcomingSchedules = await prisma.examSchedule.findMany({
        include: { course: true, exam: { include: { batch: true } }, invigilator: true },
        orderBy: { date: 'asc' },
        take: 10
    });

    return (
        <div className="space-y-6 max-w-7xl mx-auto p-6 lg:p-8 font-sans text-white">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-50 flex items-center gap-3 mb-2">
                        <Calendar className="w-7 h-7 text-indigo-400"/> Academics & Timetable
                    </h1>
                    <p className="text-slate-400 text-sm">Manage class schedules and upcoming academic events.</p>
                </div>
            </div>

            <div className="bg-[#221F32]/80 backdrop-blur rounded-3xl p-6 border border-white/10 shadow-lg">
                <h2 className="text-lg font-bold text-slate-50 mb-6">Upcoming Scheduled Events</h2>
                
                <div className="space-y-3">
                    {upcomingSchedules.length > 0 ? upcomingSchedules.map(sch => (
                        <div key={sch.id} className="bg-black/40 border border-white/5 rounded-2xl p-4 flex flex-col md:flex-row justify-between md:items-center gap-4 hover:border-white/10 transition">
                            <div>
                                <h3 className="font-bold text-slate-200 text-lg">{sch.course.title} <span className="text-sm font-normal text-slate-400">({sch.course.code})</span></h3>
                                <div className="text-sm text-slate-400 mt-2 flex flex-wrap gap-4">
                                    <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-indigo-400" /> {new Date(sch.date).toLocaleDateString()}</span>
                                    <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-emerald-400" /> {sch.roomNo || 'TBD'}</span>
                                    <span className="flex items-center gap-1.5"><Users className="w-4 h-4 text-sky-400" /> Batch: {sch.exam.batch.name}</span>
                                </div>
                            </div>
                            <div className="text-left md:text-right">
                                <p className="text-xs text-slate-500 uppercase font-semibold">Invigilator</p>
                                <p className="text-sm font-medium text-slate-200">{sch.invigilator?.name || 'Unassigned'}</p>
                            </div>
                        </div>
                    )) : (
                        <div className="text-center py-8 text-slate-500">No schedules found in the database.</div>
                    )}
                </div>
            </div>
        </div>
    );
}
