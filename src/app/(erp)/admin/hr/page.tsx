import React from 'react';
import prisma from '@/lib/prisma';
import AdminHRClient from './client';

export const dynamic = 'force-dynamic';

import { FACULTY } from '@/lib/syntheticData';

export default async function AdminHRPage() {
    let facultyList: any[] = [];
    try {
        facultyList = await prisma.faculty.findMany({
            orderBy: { name: 'asc' }
        });
    } catch {
        facultyList = [];
    }

    if (facultyList.length === 0) {
        facultyList = (FACULTY || []).map(f => ({
            id: f.id,
            empId: f.empId,
            name: f.name,
            email: f.email,
            department: f.department
        }));
    }

    return <AdminHRClient facultyList={facultyList} />;
}
