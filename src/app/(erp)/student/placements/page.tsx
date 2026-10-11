import React from 'react';
import prisma from '@/lib/prisma';
import StudentPlacementsClient from './client';

export const dynamic = 'force-dynamic';

export default async function StudentPlacementsPage() {
    let documents: any[] = [];
    try {
        const student = await prisma.student.findFirst();

        if (student) {
            documents = await prisma.document.findMany({
                where: { studentId: student.id },
                orderBy: { createdAt: 'desc' }
            });
        }
    } catch {
        documents = [];
    }

    if (documents.length === 0) {
        documents = [
            {
                id: "doc-1",
                name: "LakshmiPriya_Resume_TCS_Digital.pdf",
                url: "#",
                size: 245000,
                ocrStatus: "COMPLETED",
                extractedSkills: ["Python", "Machine Learning", "DBMS", "Java", "Data Structures"],
                createdAt: new Date().toISOString()
            }
        ];
    }

    return <StudentPlacementsClient documents={documents} />;
}
