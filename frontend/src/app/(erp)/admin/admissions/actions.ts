"use server";
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function enrollStudent(formData: FormData) {
    const rollNo = formData.get('rollNo') as string;
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const batchId = formData.get('batchId') as string;
    const sectionId = formData.get('sectionId') as string;

    if (!rollNo || !name || !email || !batchId || !sectionId) {
        return { success: false, error: 'All fields are required.' };
    }

    try {
        const student = await prisma.student.create({
            data: {
                rollNo,
                name,
                email,
                batchId,
                sectionId
            }
        });

        revalidatePath('/admin/dashboard');
        revalidatePath('/admin/students');
        
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}
