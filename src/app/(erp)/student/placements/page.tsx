import React from 'react';
import prisma from '@/lib/prisma';
import StudentPlacementsClient from './client';

export const dynamic = 'force-dynamic';

export default async function StudentPlacementsPage() {
    // Hardcode Aarav for now
    const student = await prisma.student.findUnique({
        where: { rollNo: '24C01A0501' }
    });

    if (!student) return <div>Student not found in DB</div>;

    const documents = await prisma.document.findMany({
        where: { studentId: student.id },
        orderBy: { createdAt: 'desc' }
    });

    return <StudentPlacementsClient documents={documents} />;
}
