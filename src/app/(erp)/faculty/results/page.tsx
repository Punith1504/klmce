import { requireRole,serverApi } from '@/lib/server-api';
import { ERPTransition } from '@/components/erp-form';
import MarkEditor from './mark-editor';
export default async function Page() {
  await requireRole('FACULTY');
  const marks=await serverApi<{id:string,student_id:string,subject:string,marks:string,maximum:string,status:string,is_entered:boolean}[]>('/exams/marks');
  const exams=await serverApi<{schedule_id:string,name:string,section:string}[]>('/exams/schedules');
  return <><MarkEditor marks={marks}/><section className="p-8"><h2 className="text-xl">Submit for independent approval</h2>
  {exams.map(e=><div key={e.schedule_id}>{e.name} · {e.section}<ERPTransition endpoint={`exams/schedules/${e.schedule_id}/submit`} label="Submit all entered marks"/></div>)}
  </section></>;
}
