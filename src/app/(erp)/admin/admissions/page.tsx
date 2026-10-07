import { requireRole,serverApi } from '@/lib/server-api';
import { ERPForm } from '@/components/erp-form';
export default async function Page({searchParams}:{searchParams:Promise<{q?:string}>}){
 await requireRole('SUPER_ADMIN','INSTITUTION_ADMIN');const q=((await searchParams).q||'').slice(0,80);
 const sections=await serverApi<{section_id:string,name:string}[]>('/timetable/sections');
 const users=await serverApi<{user_id:string,name:string,role:string}[]>('/students/enrollment-options?q='+encodeURIComponent(q));
 return <section className="space-y-6 p-8"><h1 className="text-2xl font-semibold">Student enrollment</h1>
 <p>Create a student record and optionally link existing student and parent accounts. Account invitations are managed separately.</p>
 <form><label>Search existing accounts <input name="q" defaultValue={q} className="rounded p-2 text-black" maxLength={80}/></label><button className="ml-3 rounded border px-4 py-2">Search</button></form>
 <ERPForm title="Enroll student" endpoint="students" fields={[
  {name:'first_name',label:'First name'},{name:'last_name',label:'Last name'},{name:'enrollment_number',label:'Enrollment number'},
  {name:'section_id',label:'Section',options:sections.map(s=>({value:s.section_id,label:s.name}))},
  {name:'user_id',label:'Student account',required:false,options:users.filter(u=>u.role==='STUDENT').map(u=>({value:u.user_id,label:u.name+' · '+u.user_id.slice(-6)}))},
  {name:'parent_id',label:'Parent account',required:false,options:users.filter(u=>u.role==='PARENT').map(u=>({value:u.user_id,label:u.name+' · '+u.user_id.slice(-6)}))}
 ]}/></section>
}
