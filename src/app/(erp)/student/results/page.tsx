import React from 'react';
import prisma from '@/lib/prisma';
import StudentResultsClient from './client';

export const dynamic = 'force-dynamic';

export default async function StudentResultsPage() {
    const student = await prisma.student.findUnique({
        where: { rollNo: '24C01A0501' },
        include: {
            batch: true
        }
    });

    if (!student) return <div>Student not found in DB</div>;

    // Fetch Results
    const rawResults = await prisma.result.findMany({
        where: { studentId: student.id },
        include: {
            schedule: {
                include: {
                    course: true,
                    exam: true
                }
            }
        }
    });

    const acquiredResults = rawResults.map(r => {
        const pct = r.marksObtained / r.maxMarks;
        let grade = 'B';
        if (pct >= 0.9) grade = 'O';
        else if (pct >= 0.8) grade = 'A';
        else if (pct >= 0.7) grade = 'B+';

        return {
            id: r.id,
            subject: r.schedule.course.title,
            code: r.schedule.course.code,
            examName: r.schedule.exam.name,
            credits: r.schedule.course.credits,
            marks: r.marksObtained,
            max: r.maxMarks,
            weightage: r.weightage,
            grade: grade,
            status: r.passed ? "Pass" : "Fail"
        };
    });

    // Fetch Upcoming Exams for this student's batch
    const rawExams = await prisma.examSchedule.findMany({
        where: {
            exam: {
                batchId: student.batchId!
            }
        },
        include: {
            course: true,
            exam: true,
            invigilator: true
        },
        orderBy: {
            date: 'asc'
        }
    });

    const now = new Date();
    
    const exams = rawExams.map(e => ({
        id: e.id,
        title: e.exam.name,
        subject: e.course.title,
        code: e.course.code,
        courseType: e.course.type,
        date: new Date(e.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        time: `${e.startTime} - ${e.endTime}`,
        room: e.room,
        invigilator: e.invigilator.name,
        status: new Date(e.date) > now ? "Upcoming" : "Completed"
    }));

    const performance = {
        cgpa: 8.92, // Placeholder, usually computed based on all historical grades
        creditsEarned: acquiredResults.reduce((acc, r) => acc + (r.status === 'Pass' ? r.credits : 0), 0),
        totalCredits: acquiredResults.reduce((acc, r) => acc + r.credits, 0),
        rank: "14th",
        batchSize: 120
    };

    return <StudentResultsClient performance={performance} acquiredResults={acquiredResults} exams={exams} />;
}
