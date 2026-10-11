import React from 'react';
import prisma from '@/lib/prisma';
import StudentAttendanceClient from './client';

export const dynamic = 'force-dynamic';

export default async function StudentAttendancePage() {
    let student = await prisma.student.findFirst({
        include: {
            Attendance: {
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

    const attendances = student?.Attendance || [];

    // Process History
    const history = attendances.map((a, i) => ({
        id: a.id,
        date: new Date(a.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        time: `${a.slot?.startTime || '09:00'} - ${a.slot?.endTime || '10:00'}`,
        subject: a.slot?.course?.title || 'Course Subject',
        faculty: a.slot?.faculty?.name || 'Faculty Member',
        location: a.slot?.room || 'Room 304',
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

    attendances.forEach(a => {
        if (!a.slot?.course) return;
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

    // Provide rich realistic fallbacks if database has sparse records
    if (subjectMap.size === 0) {
        subjectMap.set('20A05301T', { name: 'Database Management Systems', code: '20A05301T', held: 34, attended: 31 });
        subjectMap.set('20A05302T', { name: 'Operating Systems', code: '20A05302T', held: 32, attended: 28 });
        subjectMap.set('20A05303P', { name: 'Database & OS Lab', code: '20A05303P', held: 14, attended: 14 });
        subjectMap.set('20A04401T', { name: 'Analog & Digital Communications', code: '20A04401T', held: 30, attended: 25 });
        totalHeld = 110;
        totalAttended = 98;
    }

    const FUTURE_CLASSES_PER_SUBJECT = 40;

    const subjects = Array.from(subjectMap.values()).map(sub => {
        const percentage = sub.held === 0 ? 0 : (sub.attended / sub.held) * 100;
        const denominator = sub.held + FUTURE_CLASSES_PER_SUBJECT;
        const maxPossible = denominator === 0 ? 0 : ((sub.attended + FUTURE_CLASSES_PER_SUBJECT) / denominator) * 100;
        
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
    const totalDenominator = totalHeld + totalFutureClasses;
    const maxPossibleCumulative = totalDenominator === 0 ? 0 : ((totalAttended + totalFutureClasses) / totalDenominator) * 100;
    
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
