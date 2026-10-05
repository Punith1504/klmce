import React from 'react';
import prisma from '@/lib/prisma';
import StudentsClient from './client';

export const dynamic = 'force-dynamic';

export default async function StudentsDirectoryPage() {
    // Fetch all students with their hierarchical academic data
    const students = await prisma.student.findMany({
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
    });

    return <StudentsClient students={students} />;
}
