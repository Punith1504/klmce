import React from 'react';
import prisma from '@/lib/prisma';
import AdminAdmissionsClient from './client';

export const dynamic = 'force-dynamic';

export default async function AdminAdmissionsPage() {
    let batches: any[] = [];
    let sections: any[] = [];

    try {
        batches = await prisma.batch.findMany({
            include: { branch: true },
            orderBy: { startingYear: 'desc' }
        });

        sections = await prisma.section.findMany({
            include: { batch: true },
            orderBy: { name: 'asc' }
        });
    } catch {
        batches = [];
        sections = [];
    }

    if (batches.length === 0) {
        batches = [
            { id: "batch-1", name: "2024-2028 (I Year B.Tech)", branch: { name: "Computer Science & Engineering" } },
            { id: "batch-2", name: "2024-2028 (I Year B.Tech)", branch: { name: "Artificial Intelligence & Data Science" } },
            { id: "batch-3", name: "2024-2028 (I Year B.Tech)", branch: { name: "Electronics & Communication" } }
        ];
    }

    if (sections.length === 0) {
        sections = [
            { id: "sec-1", name: "Section A", batch: batches[0] },
            { id: "sec-2", name: "Section B", batch: batches[0] },
            { id: "sec-3", name: "Section A", batch: batches[1] }
        ];
    }

    return <AdminAdmissionsClient batches={batches} sections={sections} />;
}
