import { requireRole,serverApi } from '@/lib/server-api';
import MarkEditor from './mark-editor';
export default async function Page() {
  await requireRole('FACULTY');
  const marks=await serverApi<{id:string,student_id:string,subject:string,marks:string,maximum:string,status:string}[]>('/exams/marks');
  return <MarkEditor marks={marks}/>;
}
