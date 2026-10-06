import { requireRole,serverApi } from '@/lib/server-api';
import FacultyAttendanceClient from './client';
export const dynamic='force-dynamic';
type Slot={id:string,course:{title:string,code:string},section:{name:string},dayOfWeek:string,startTime:string,endTime:string,students:{id:string,rollNo:string,name:string}[]};
export default async function Page() {
  await requireRole('FACULTY');
  const slots=await serverApi<Slot[]>('/timetable/my-slots');
  return <FacultyAttendanceClient slots={slots}/>;
}
