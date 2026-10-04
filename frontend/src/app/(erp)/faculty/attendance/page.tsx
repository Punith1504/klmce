import React from 'react';
import prisma from '@/lib/prisma';
import FacultyAttendanceClient from './client';

export const dynamic = 'force-dynamic';

export default async function FacultyAttendancePage() {
    // Hardcode faculty for now until auth is implemented
    const faculty = await prisma.faculty.findUnique({
        where: { empId: 'FAC001' },
        include: {
            TimetableSlot: {
                include: {
                    course: true,
                    section: {
                        include: {
                            students: {
                                orderBy: { rollNo: 'asc' }
                            }
                        }
                    }
                }
            }
        }
    });

    if (!faculty) {
        return <div className="text-white p-8">Faculty not found in DB</div>;
    }

    const slots = faculty.TimetableSlot.map(slot => ({
        id: slot.id,
        course: {
            title: slot.course.title,
            code: slot.course.code
        },
        section: {
            name: slot.section.name
        },
        dayOfWeek: slot.dayOfWeek,
        startTime: slot.startTime,
        endTime: slot.endTime,
        students: slot.section.students.map(s => ({
            id: s.id,
            rollNo: s.rollNo,
            name: s.name
        }))
    }));

    return <FacultyAttendanceClient slots={slots} />;
}
