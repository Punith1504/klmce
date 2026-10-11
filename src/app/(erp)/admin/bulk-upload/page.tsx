import React from 'react';
import prisma from '@/lib/prisma';
import AdminBulkUploadClient from './client';

export const dynamic = 'force-dynamic';

export default async function AdminBulkUploadPage() {
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
            { id: "batch-1", name: "2021-2025 (IV Year)", branch: { name: "Computer Science & Engineering" } },
            { id: "batch-2", name: "2022-2026 (III Year)", branch: { name: "Electronics & Communication" } },
            { id: "batch-3", name: "2023-2027 (II Year)", branch: { name: "Artificial Intelligence & Data Science" } }
        ];
    }

    if (sections.length === 0) {
        sections = [
            { id: "sec-1", name: "Section A", batch: batches[0] },
            { id: "sec-2", name: "Section B", batch: batches[0] },
            { id: "sec-3", name: "Section A", batch: batches[1] }
        ];
    }

    return <AdminBulkUploadClient batches={batches} sections={sections} />;
}
