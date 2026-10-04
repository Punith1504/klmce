import React from 'react';
import prisma from '@/lib/prisma';
import FacultyResultsClient from './client';

export const dynamic = 'force-dynamic';

export default async function FacultyResultsPage() {
    // Hardcode faculty for now
    const faculty = await prisma.faculty.findUnique({
        where: { empId: 'FAC001' },
    });

    if (!faculty) return <div className="p-8 text-white">Faculty not found in DB</div>;

    // Get Exam Schedules where this faculty is the invigilator (or course instructor)
    // For MVP, we'll fetch schedules where they are the invigilator
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

    const schedules = rawSchedules.map(sch => ({
        id: sch.id,
        exam: { name: sch.exam.name },
        course: { title: sch.course.title, code: sch.course.code },
        date: new Date(sch.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        students: sch.exam.batch.students.map(s => ({
            id: s.id,
            rollNo: s.rollNo,
            name: s.name
        })),
        existingResults: sch.results.map(r => ({
            studentId: r.studentId,
            marksObtained: r.marksObtained
        }))
    }));

    return <FacultyResultsClient schedules={schedules} />;
}
