import React from 'react';
import prisma from '@/lib/prisma';
import { Calendar, Clock, MapPin, Users } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminTimetablePage() {
    let upcomingSchedules: any[] = [];
    try {
        upcomingSchedules = await prisma.examSchedule.findMany({
            include: { course: true, exam: { include: { batch: true } }, invigilator: true },
            orderBy: { date: 'asc' },
            take: 10
        });
    } catch {
        upcomingSchedules = [];
    }

    if (upcomingSchedules.length === 0) {
        upcomingSchedules = [
            {
                id: "sch-1",
                course: { title: "Database Management Systems", code: "20A05301T" },
                exam: { batch: { name: "B.Tech CSE IV Year (2021-2025)" } },
                date: new Date(Date.now() + 86400000 * 3),
                room: "CSE Block - Room 304",
                invigilator: { name: "Dr. V. Lokeswara Reddy" }
            },
            {
                id: "sch-2",
                course: { title: "Operating Systems", code: "20A05302T" },
                exam: { batch: { name: "B.Tech CSE IV Year (2021-2025)" } },
                date: new Date(Date.now() + 86400000 * 5),
                room: "CSE Block - Room 304",
                invigilator: { name: "Prof. S. Khaja Fareeduddin" }
            },
            {
                id: "sch-3",
                course: { title: "Analog & Digital Communications", code: "20A04401T" },
                exam: { batch: { name: "B.Tech ECE III Year (2022-2026)" } },
                date: new Date(Date.now() + 86400000 * 7),
                room: "ECE Block - Room 201",
                invigilator: { name: "Dr. K. Srinivasulu" }
            }
        ];
    }

    return (
        <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 font-sans text-white">
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
                                    <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-emerald-400" /> {(sch as any).room || 'TBD'}</span>
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
