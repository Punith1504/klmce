import React from 'react';
import prisma from '@/lib/prisma';
import FacultyAttendanceClient from './client';

export const dynamic = 'force-dynamic';

import { STUDENTS, COURSES } from '@/lib/syntheticData';

export default async function FacultyAttendancePage() {
    let faculty = null;
    try {
        faculty = await prisma.faculty.findFirst({
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
    } catch {
        faculty = null;
    }

    let slots: any[] = [];

    if (faculty && faculty.TimetableSlot?.length > 0) {
        slots = faculty.TimetableSlot.map(slot => ({
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
    }

    // Realistic regional fallback for KLMCE faculty classes
    if (slots.length === 0) {
        const regionalStudents = STUDENTS.slice(0, 10).map(s => ({
            id: s.id,
            rollNo: s.rollNo,
            name: s.name
        }));

        slots = [
            {
                id: "slot-01",
                course: { title: COURSES[0].title, code: COURSES[0].code },
                section: { name: "CSE-A (IV Year)" },
                dayOfWeek: "Monday",
                startTime: "09:30 AM",
                endTime: "10:30 AM",
                students: regionalStudents
            },
            {
                id: "slot-02",
                course: { title: COURSES[1].title, code: COURSES[1].code },
                section: { name: "CSE-B (IV Year)" },
                dayOfWeek: "Tuesday",
                startTime: "11:00 AM",
                endTime: "12:00 PM",
                students: regionalStudents.slice(0, 8)
            },
            {
                id: "slot-03",
                course: { title: COURSES[2].title, code: COURSES[2].code },
                section: { name: "CSE Lab 3" },
                dayOfWeek: "Wednesday",
                startTime: "02:00 PM",
                endTime: "04:30 PM",
                students: regionalStudents
            }
        ];
    }

    return <FacultyAttendanceClient slots={slots} />;
}
