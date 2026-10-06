'use server';
import { requireRole, serverApi } from '@/lib/server-api';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
const submission = z.object({slotId:z.string().uuid(),date:z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  records:z.array(z.object({studentId:z.string().uuid(),status:z.enum(['PRESENT','ABSENT'])})).min(1).max(200)});
export async function submitAttendance(slotId:string,date:string,records:{studentId:string,status:string}[]) {
  try {
    const data = submission.parse({slotId,date,records});
    await requireRole('FACULTY');
    // The backend independently enforces identity, assignment, enrollment, date,
    // submission window, atomicity and uniqueness in PostgreSQL.
    await serverApi('/attendance/roster',{method:'POST',body:JSON.stringify(data)});
    revalidatePath('/faculty/attendance');
    revalidatePath('/student/attendance');
    return {success:true};
  } catch (error) { return {success:false,error:error instanceof Error ? error.message : 'Attendance could not be submitted'}; }
}
