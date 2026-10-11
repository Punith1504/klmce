import React from 'react';
import prisma from '@/lib/prisma';
import AdminExaminationsClient from './client';

export const dynamic = 'force-dynamic';

export default async function AdminExaminationsPage() {
    let exams: any[] = [];
    let batches: any[] = [];

    try {
        exams = await prisma.exam.findMany({
            include: { batch: true },
            orderBy: { id: 'desc' }
        });

        batches = await prisma.batch.findMany({
            include: { branch: true }
        });
    } catch {
        exams = [];
        batches = [];
    }

    if (batches.length === 0) {
        batches = [
            { id: "batch-1", name: "B.Tech CSE IV Year (2021-2025)", branch: { name: "Computer Science & Engineering" } },
            { id: "batch-2", name: "B.Tech ECE III Year (2022-2026)", branch: { name: "Electronics & Communication" } },
            { id: "batch-3", name: "B.Tech AI&DS II Year (2023-2027)", branch: { name: "Artificial Intelligence & Data Science" } }
        ];
    }

    if (exams.length === 0) {
        exams = [
            { id: "exam-1", name: "JNTUA R20 Mid-Term II Examination", batch: { name: "B.Tech CSE IV Year (2021-2025)" }, type: "INTERNAL", status: "SCHEDULED" },
            { id: "exam-2", name: "Continuous Internal Evaluation (CIE-I)", batch: { name: "B.Tech ECE III Year (2022-2026)" }, type: "INTERNAL", status: "COMPLETED" },
            { id: "exam-3", name: "Semester End Lab Examination", batch: { name: "B.Tech CSE IV Year (2021-2025)" }, type: "EXTERNAL", status: "SCHEDULED" }
        ];
    }

    return <AdminExaminationsClient exams={exams} batches={batches} />;
}
