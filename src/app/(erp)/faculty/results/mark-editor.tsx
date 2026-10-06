'use client';
import { useState } from 'react';
import { updateMark } from './actions';
export default function MarkEditor({marks}:{marks:{id:string,student_id:string,subject:string,marks:string,maximum:string,status:string}[]}) {
  const [message,setMessage]=useState('');
  return <section className="p-8"><h1 className="mb-4 text-2xl font-semibold">Assigned exam marks</h1>
    <p role="status">{message}</p>{!marks.length && <p>No assigned marks available.</p>}
    {marks.map(mark=><form key={mark.id} className="my-4 flex flex-wrap gap-4" onSubmit={async event=>{
      event.preventDefault();const form=event.currentTarget;const value=new FormData(form).get('marks');
      const result=await updateMark(mark.id,Number(value));setMessage(result.success?'Marks saved':result.error || 'Update failed');
    }}><label>{mark.subject} · {mark.student_id} · {mark.status}
      <input aria-label={`Marks for ${mark.subject}, student ${mark.student_id}`} className="ml-3 rounded border p-2 text-black" name="marks" type="number" min="0" max={mark.maximum} step="0.01" defaultValue={mark.marks} required/>
    </label><button type="submit" className="rounded bg-indigo-600 px-4 py-2">Save</button></form>)}
  </section>;
}
