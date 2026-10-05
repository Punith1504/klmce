import React from 'react';
import prisma from '@/lib/prisma';
import AdminExaminationsClient from './client';

export const dynamic = 'force-dynamic';

export default async function AdminExaminationsPage() {
    const exams = await prisma.exam.findMany({
        include: { batch: true },
        orderBy: { createdAt: 'desc' }
    });

    const batches = await prisma.batch.findMany({
        include: { branch: true }
    });

    return <AdminExaminationsClient exams={exams} batches={batches} />;
}
