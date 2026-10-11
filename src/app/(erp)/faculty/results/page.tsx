import React from 'react';
import prisma from '@/lib/prisma';
import FacultyResultsClient from './client';

export const dynamic = 'force-dynamic';

import { STUDENTS, COURSES } from '@/lib/syntheticData';

export default async function FacultyResultsPage() {
    let schedules: any[] = [];
    try {
        const faculty = await prisma.faculty.findFirst({
            where: { empId: 'FAC001' },
        }) || await prisma.faculty.findFirst();

        if (faculty) {
            const rawSchedules = await prisma.examSchedule.findMany({
                where: { invigilatorId: faculty.id },
                include: {
                    course: true,
                    exam: {
                        include: {
                            batch: {
                                include: {
                                    students: {
                                        orderBy: { rollNo: 'asc' }
                                    }
                                }
                            }
                        }
                    },
                    results: true
                },
                orderBy: { date: 'desc' }
            });

            schedules = rawSchedules.map(sch => ({
                id: sch.id,
                exam: { name: sch.exam?.name || "Mid-Term Examination" },
                course: { title: sch.course?.title || "DBMS", code: sch.course?.code || "20A05301T" },
                date: new Date(sch.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                students: (sch.exam?.batch?.students || []).map(s => ({
                    id: s.id,
                    rollNo: s.rollNo,
                    name: s.name
                })),
                existingResults: (sch.results || []).map(r => ({
                    studentId: r.studentId,
                    marksObtained: r.marksObtained
                }))
            }));
        }
    } catch {
        schedules = [];
    }

    if (schedules.length === 0) {
        const regionalStudents = (STUDENTS || []).slice(0, 10).map(s => ({
            id: s.id,
            rollNo: s.rollNo,
            name: s.name
        }));

        schedules = [
            {
                id: "sch-res-1",
                exam: { name: "Mid-Term II Examination (CIE)" },
                course: { title: COURSES[0].title, code: COURSES[0].code },
                date: "Oct 24, 2026",
                students: regionalStudents,
                existingResults: regionalStudents.map((s, idx) => ({
                    studentId: s.id,
                    marksObtained: 22 + (idx % 7)
                }))
            },
            {
                id: "sch-res-2",
                exam: { name: "Continuous Lab Assessment" },
                course: { title: COURSES[2].title, code: COURSES[2].code },
                date: "Oct 19, 2026",
                students: regionalStudents.slice(0, 8),
                existingResults: []
            }
        ];
    }

    return <FacultyResultsClient schedules={schedules} />;
}
