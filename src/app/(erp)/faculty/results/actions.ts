"use server";
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function submitResults(examScheduleId: string, records: { studentId: string, marks: number }[]) {
    if (!examScheduleId || !records || records.length === 0) {
        return { success: false, error: 'Invalid data' };
    }

    try {
        const schedule = await prisma.examSchedule.findUnique({
            where: { id: examScheduleId },
            include: { course: true }
        });

        if (!schedule) return { success: false, error: 'Schedule not found' };
        
        // We assume Mid Term has max marks 30 for this MVP demo
        const maxMarks = 30;

        for (const record of records) {
            const existing = await prisma.result.findFirst({
                where: {
                    examScheduleId: examScheduleId,
                    studentId: record.studentId,
                }
            });

            if (existing) {
                await prisma.result.update({
                    where: { id: existing.id },
                    data: { 
                        marksObtained: record.marks,
                        passed: record.marks >= 12
                    }
                });
            } else {
                await prisma.result.create({
                    data: {
                        studentId: record.studentId,
                        examScheduleId: examScheduleId,
                        marksObtained: record.marks,
                        maxMarks: maxMarks,
                        weightage: 20, // arbitrary
                        passed: record.marks >= 12
                    }
                });
            }
        }

        revalidatePath('/faculty/results');
        revalidatePath('/student/results'); 
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}
