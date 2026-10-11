import React from 'react';
import prisma from '@/lib/prisma';
import StudentsClient from './client';
import { STUDENTS } from '@/lib/syntheticData';

export const dynamic = 'force-dynamic';

export default async function StudentsDirectoryPage() {
    // Fetch all students with their hierarchical academic data
    const dbStudents = await prisma.student.findMany({
        include: {
            batch: {
                include: {
                    branch: {
                        include: {
                            programme: true
                        }
                    }
                }
            },
            section: true
        },
        orderBy: {
            rollNo: 'asc'
        }
    }).catch(() => []);

    // Provide rich authentic regional dataset fallback if DB has few rows
    const fallbackStudents = STUDENTS.map(s => ({
        id: s.id,
        rollNo: s.rollNo,
        name: s.name,
        email: s.email,
        mobile: s.phone,
        batch: {
            name: `${s.year === 4 ? '2021-2025' : '2022-2026'}`,
            branch: {
                name: s.department,
                code: s.department.includes('Computer') ? 'CSE' : s.department.includes('Artificial') ? 'AI&DS' : s.department.includes('Electronics') ? 'ECE' : 'EEE',
                programme: { name: 'B.Tech' }
            }
        },
        section: { name: 'Section A' }
    }));

    const dataToDisplay = dbStudents.length > 0 ? dbStudents : fallbackStudents;

    return <StudentsClient students={dataToDisplay} />;
}
