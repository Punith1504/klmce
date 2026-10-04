import React from 'react';
import prisma from '@/lib/prisma';
import AdminBulkUploadClient from './client';

export const dynamic = 'force-dynamic';

export default async function AdminBulkUploadPage() {
    // Fetch batches and sections for the dropdowns
    const batches = await prisma.batch.findMany({
        include: { branch: true },
        orderBy: { startingYear: 'desc' }
    });

    const sections = await prisma.section.findMany({
        include: { batch: true },
        orderBy: { name: 'asc' }
    });

    return <AdminBulkUploadClient batches={batches} sections={sections} />;
}
