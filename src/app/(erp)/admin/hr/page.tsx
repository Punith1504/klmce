import React from 'react';
import prisma from '@/lib/prisma';
import AdminHRClient from './client';

export const dynamic = 'force-dynamic';

export default async function AdminHRPage() {
    const facultyList = await prisma.faculty.findMany({
        orderBy: { name: 'asc' }
    });

    return <AdminHRClient facultyList={facultyList} />;
}
