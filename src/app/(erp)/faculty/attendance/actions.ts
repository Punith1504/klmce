"use server";
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function submitAttendance(slotId: string, date: string, records: { studentId: string, status: string }[]) {
    // Basic validation
    if (!slotId || !date || !records || records.length === 0) {
        return { success: false, error: 'Invalid data' };
    }

    const attendanceDate = new Date(date);

    try {
        // Upsert logic for each record to handle re-submissions for the same date/slot
        for (const record of records) {
            
            // Check if record already exists
            const existing = await prisma.attendance.findFirst({
                where: {
                    slotId,
                    studentId: record.studentId,
                    date: attendanceDate
                }
            });

            if (existing) {
                await prisma.attendance.update({
                    where: { id: existing.id },
                    data: { status: record.status }
                });
            } else {
                await prisma.attendance.create({
                    data: {
                        slotId,
                        studentId: record.studentId,
                        date: attendanceDate,
                        status: record.status
                    }
                });
            }
        }

        revalidatePath('/faculty/attendance');
        revalidatePath('/student/attendance'); // update student dashboards too
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}
