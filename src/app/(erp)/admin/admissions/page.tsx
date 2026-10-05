import React from 'react';
import prisma from '@/lib/prisma';
import AdminAdmissionsClient from './client';

export const dynamic = 'force-dynamic';

export default async function AdminAdmissionsPage() {
    const batches = await prisma.batch.findMany({
        include: { branch: true },
        orderBy: { startingYear: 'desc' }
    });

    const sections = await prisma.section.findMany({
        include: { batch: true },
        orderBy: { name: 'asc' }
    });

    return <AdminAdmissionsClient batches={batches} sections={sections} />;
}
