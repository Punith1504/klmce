"use server";
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function processBulkStudents(records: any[], batchId: string, sectionId: string) {
    if (!records || records.length === 0) return { success: false, error: "No records found in file" };
    if (!batchId || !sectionId) return { success: false, error: "Batch and Section are required" };

    let successCount = 0;
    let errors = [];

    // Process in chunks of 500 to handle large data without timing out or overflowing memory
    const CHUNK_SIZE = 500;
    for (let i = 0; i < records.length; i += CHUNK_SIZE) {
        const chunk = records.slice(i, i + CHUNK_SIZE);
        
        const validStudentsData = chunk.map((row, idx) => {
            const rawRoll = row['Roll No'] || row['Roll Number'] || row['rollno'] || row['rollNo'];
            const rawName = row['Name'] || row['Full Name'] || row['name'];
            const rawEmail = row['Email'] || row['Email Address'] || row['email'];
            
            if (!rawRoll || !rawName) {
                errors.push(`Row ${i + idx + 1}: Missing Roll No or Name`);
                return null;
            }
            return {
                rollNo: String(rawRoll).toUpperCase(),
                name: String(rawName),
                email: rawEmail ? String(rawEmail) : `${rawRoll}@student.klmce.edu`,
                batchId,
                sectionId
            };
        }).filter(Boolean) as any[];

        try {
            // Using a transaction for each chunk to speed up sequential upserts dramatically
            const operations = validStudentsData.map(student => 
                prisma.student.upsert({
                    where: { rollNo: student.rollNo },
                    update: student,
                    create: student
                })
            );
            await prisma.$transaction(operations);
            successCount += validStudentsData.length;
        } catch (e: any) {
            errors.push(`Chunk starting at row ${i + 1} failed: ${e.message}. Some records may not have been saved.`);
        }
    }

    revalidatePath('/admin/dashboard');
    revalidatePath('/admin/students');
    revalidatePath('/admin/bulk-upload');

    return { 
        success: true, 
        message: `Successfully processed ${successCount} records in bulk.`,
        errors 
    };
}
