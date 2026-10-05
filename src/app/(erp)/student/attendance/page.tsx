import React from 'react';
import prisma from '@/lib/prisma';
import StudentAttendanceClient from './client';

export const dynamic = 'force-dynamic';

export default async function StudentAttendancePage() {
    const student = await prisma.student.findUnique({
        where: { rollNo: '24C01A0501' },
        include: {
            attendances: {
                include: {
                    slot: {
                        include: {
                            course: true,
                            faculty: true
                        }
                    }
                },
                orderBy: {
                    date: 'desc'
                }
            }
        }
    });

    if (!student) return <div>Student not found in DB</div>;

    // Process History
    const history = student.attendances.map((a, i) => ({
        id: a.id,
        date: new Date(a.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        time: `${a.slot.startTime} - ${a.slot.endTime}`,
        subject: a.slot.course.title,
        faculty: a.slot.faculty.name,
        location: a.slot.room,
        status: a.status === 'PRESENT' ? 'Present' : 'Absent'
    }));

    // Group by Subject
    const subjectMap = new Map<string, {
        name: string;
        code: string;
        held: number;
        attended: number;
    }>();

    let totalHeld = 0;
    let totalAttended = 0;

    student.attendances.forEach(a => {
        const cCode = a.slot.course.code;
        if (!subjectMap.has(cCode)) {
            subjectMap.set(cCode, {
                name: a.slot.course.title,
                code: cCode,
                held: 0,
                attended: 0
            });
        }
        const s = subjectMap.get(cCode)!;
        s.held++;
        totalHeld++;
        if (a.status === 'PRESENT') {
            s.attended++;
            totalAttended++;
        }
    });

    // We assume 40 future classes per subject for demo purposes since we don't have a real academic calendar
    const FUTURE_CLASSES_PER_SUBJECT = 40;

    const subjects = Array.from(subjectMap.values()).map(sub => {
        const percentage = sub.held === 0 ? 0 : (sub.attended / sub.held) * 100;
        const maxPossible = ((sub.attended + FUTURE_CLASSES_PER_SUBJECT) / (sub.held + FUTURE_CLASSES_PER_SUBJECT)) * 100;
        
        let classesTo80 = 0;
        let tempAttended = sub.attended;
        let tempHeld = sub.held;
        while ((tempAttended / tempHeld) < 0.80 && classesTo80 <= FUTURE_CLASSES_PER_SUBJECT) {
            classesTo80++;
            tempAttended++;
            tempHeld++;
        }
        
        const impossible = classesTo80 > FUTURE_CLASSES_PER_SUBJECT;

        let status = 'safe';
        if (percentage < 75) status = 'danger';
        else if (percentage < 80) status = 'warning';

        return {
            name: sub.name,
            code: sub.code,
            held: sub.held,
            attended: sub.attended,
            percentage: parseFloat(percentage.toFixed(1)),
            future: FUTURE_CLASSES_PER_SUBJECT,
            status,
            classesTo80: impossible ? "Impossible" : classesTo80,
            maxPossible: parseFloat(maxPossible.toFixed(1))
        };
    });

    const totalFutureClasses = subjects.length * FUTURE_CLASSES_PER_SUBJECT;
    const currentPercentage = totalHeld === 0 ? 0 : (totalAttended / totalHeld) * 100;
    const maxPossibleCumulative = ((totalAttended + totalFutureClasses) / (totalHeld + totalFutureClasses)) * 100;
    
    let globalClassesTo80 = 0;
    let tempTotalAtt = totalAttended;
    let tempTotalHeld = totalHeld;
    while ((tempTotalAtt / tempTotalHeld) < 0.80 && globalClassesTo80 <= totalFutureClasses) {
        globalClassesTo80++;
        tempTotalAtt++;
        tempTotalHeld++;
    }

    const cumulative = {
        held: totalHeld,
        attended: totalAttended,
        currentPercentage: parseFloat(currentPercentage.toFixed(1)),
        totalFutureClasses,
        classesTo80: globalClassesTo80 > totalFutureClasses ? "Impossible" : globalClassesTo80,
        maxPossible: parseFloat(maxPossibleCumulative.toFixed(1))
    };

    return <StudentAttendanceClient cumulative={cumulative} subjects={subjects} history={history} />;
}
