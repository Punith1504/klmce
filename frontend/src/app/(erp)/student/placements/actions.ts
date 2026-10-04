"use server";
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function saveDocumentRecord(fileName: string, fileUrl: string, fileSize: number) {
    // For MVP, hardcode Aarav Sharma
    const student = await prisma.student.findUnique({
        where: { rollNo: '24C01A0501' }
    });

    if (!student) return { success: false, error: 'Student not found' };

    try {
        const doc = await prisma.document.create({
            data: {
                fileName,
                fileUrl,
                fileSize,
                docType: "RESUME",
                status: "PENDING", // Will be marked PARSED after OCR
                studentId: student.id
            }
        });

        revalidatePath('/student/placements');
        
        // Return the doc id so we can trigger the simulated OCR immediately
        return { success: true, docId: doc.id };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

export async function processDocumentOCR(docId: string) {
    // In a real application, we would call an LLM (Gemini) or OCR service here
    // For this MVP, we simulate parsing and updating the record

    await new Promise(res => setTimeout(res, 2000)); // Simulate processing delay

    try {
        const syntheticParsedData = JSON.stringify({
            skills: ["React", "Next.js", "Python", "SQL"],
            cgpa: 8.92,
            projects: ["E-Commerce Site", "ERP Dashboard"]
        });

        await prisma.document.update({
            where: { id: docId },
            data: {
                status: "PARSED",
                parsedData: syntheticParsedData
            }
        });

        revalidatePath('/student/placements');
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}
