"use server";
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function createExam(formData: FormData) {
    const name = formData.get('name') as string;
    const type = formData.get('type') as string;
    const batchId = formData.get('batchId') as string;

    if (!name || !type || !batchId) return { success: false, error: 'All fields required' };

    try {
        await prisma.exam.create({
            data: { name, type, batchId, status: 'SCHEDULED' }
        });
        revalidatePath('/admin/examinations');
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}
