'use server';
import { requireRole, serverApi } from '@/lib/server-api';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
// The old bulk API had no canonical exam schedule or maximum-mark contract.
export async function submitResults(_examScheduleId:string,_records:{studentId:string,marks:number}[]) {
  return {success:false,error:'Use the assigned exam mark workflow. Legacy bulk marking is unavailable.'};
}
export async function updateMark(markId:string,marks:number) {
  try {
    z.string().uuid().parse(markId);
    z.number().finite().min(0).max(999.99).parse(marks);
    await requireRole('FACULTY');
    await serverApi(`/exams/marks/${markId}`,{method:'PUT',body:JSON.stringify({marks_obtained:marks})});
    revalidatePath('/faculty/results');
    return {success:true};
  } catch (error) {return {success:false,error:error instanceof Error ? error.message : 'Marks could not be updated'};}
}
