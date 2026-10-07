import {requireRole,serverApi} from '@/lib/server-api';
import {ERPForm} from '@/components/erp-form';
export default async function Page(){
 await requireRole('SUPER_ADMIN','INSTITUTION_ADMIN');
 const [courses,sections,faculty]=await Promise.all([
  serverApi<{course_id:string,code:string,name:string}[]>('/timetable/courses'),
  serverApi<{section_id:string,name:string}[]>('/timetable/sections'),
  serverApi<{user_id:string,first_name:string,last_name:string}[]>('/timetable/faculty')]);
 return <section className="space-y-6 p-8"><h1 className="text-2xl">Academic setup and timetable</h1><div className="grid gap-6 lg:grid-cols-2">
 <ERPForm title="Create section" endpoint="timetable/sections" fields={[{name:'name',label:'Section name'}]}/>
 <ERPForm title="Create course" endpoint="timetable/courses" fields={[{name:'course_code',label:'Course code (uppercase)'},{name:'name',label:'Course name'},{name:'credits',label:'Credits',type:'number',min:0,max:30,step:'0.1'},{name:'course_type',label:'Course type',options:['CORE','ELECTIVE','LAB','PROJECT'].map(v=>({value:v,label:v}))}]}/>
 </div><ERPForm title="Schedule class" endpoint="timetable/slots" fields={[
 {name:'course_id',label:'Course',options:courses.map(c=>({value:c.course_id,label:c.code+' — '+c.name}))},
 {name:'section_id',label:'Section',options:sections.map(s=>({value:s.section_id,label:s.name}))},
 {name:'faculty_id',label:'Faculty',options:faculty.map(f=>({value:f.user_id,label:f.first_name+' '+f.last_name}))},
 {name:'room_number',label:'Room'},{name:'day_of_week',label:'Day',options:['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'].map(v=>({value:v,label:v}))},
 {name:'start_time',label:'Start time',type:'time'},{name:'end_time',label:'End time',type:'time'}
 ]}/><p>Room, faculty and section conflicts are checked before saving.</p></section>
}
