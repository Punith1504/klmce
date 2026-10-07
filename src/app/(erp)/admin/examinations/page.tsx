import {requireRole,serverApi} from '@/lib/server-api';
import {ERPForm,ERPTransition} from '@/components/erp-form';
import {RecordTable} from '@/components/record-table';
export default async function Page(){
 await requireRole('SUPER_ADMIN','INSTITUTION_ADMIN');
 const [courses,sections,faculty,exams]=await Promise.all([
 serverApi<{course_id:string,code:string,name:string}[]>('/timetable/courses'),serverApi<{section_id:string,name:string}[]>('/timetable/sections'),
 serverApi<{user_id:string,first_name:string,last_name:string}[]>('/timetable/faculty'),serverApi<(Record<string,unknown>&{schedule_id:string,name:string})[]>('/exams/schedules')]);
 return <section className="space-y-6 p-8"><h1 className="text-2xl">Examinations</h1><ERPForm title="Schedule examination" endpoint="exams/schedules" fields={[
 {name:'name',label:'Examination name'},{name:'exam_date',label:'Examination date',type:'date'},{name:'max_marks',label:'Maximum marks',type:'number',min:0.01,max:999.99,step:'0.01'},
 {name:'course_id',label:'Course',options:courses.map(c=>({value:c.course_id,label:c.code+' — '+c.name}))},
 {name:'section_id',label:'Section',options:sections.map(s=>({value:s.section_id,label:s.name}))},
 {name:'faculty_id',label:'Assigned faculty',options:faculty.map(f=>({value:f.user_id,label:f.first_name+' '+f.last_name}))}
 ]}/><RecordTable title="Examination status" rows={exams}/>{exams.map(e=><div key={e.schedule_id} className="rounded border p-4">{e.name}
 <ERPTransition endpoint={`exams/schedules/${e.schedule_id}/approve`} label="Approve submitted marks"/>
 <ERPTransition endpoint={`exams/schedules/${e.schedule_id}/publish`} label="Publish approved results"/>
 </div>)}<p>Unentered or unapproved marks cannot be published. Students see results only after publication.</p></section>
}
