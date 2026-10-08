'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
export type Choice={value:string,label:string};
export type Field={name:string,label:string,type?:string,options?:Choice[],required?:boolean,max?:number,min?:number,step?:string};
export function ERPForm({title,endpoint,fields,initial={}}:{title:string,endpoint:string,fields:Field[],initial?:Record<string,string>}) {
  const [message,setMessage]=useState('');const [busy,setBusy]=useState(false);const router=useRouter();
  return <form className="space-y-4 rounded-xl border border-white/20 p-6" onSubmit={async event=>{
    event.preventDefault();setBusy(true);setMessage('');const form=event.currentTarget;
    const values:Record<string,unknown>={};const data=new FormData(form);
    for(const field of fields){const value=String(data.get(field.name)??'');values[field.name]=value===''?null:field.type==='number'?Number(value):value;}
    try{
      const response=await fetch('/api/erp/'+endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(values)});
      const result=await response.json();
      if(!response.ok)throw new Error(typeof result.detail==='string'?result.detail:'Please check the entered values.');
      setMessage('Saved successfully.');form.reset();router.refresh();
    }catch(error){setMessage(error instanceof Error?error.message:'Unable to save.');}finally{setBusy(false);}
  }}>
    <h2 className="text-xl font-semibold">{title}</h2>
    {fields.map(field=><label key={field.name} className="block">{field.label}
      {field.options ? <select name={field.name} defaultValue={initial[field.name]??''} required={field.required!==false} className="mt-1 block w-full rounded p-2 text-black">
        <option value="">Choose {field.label.toLowerCase()}</option>{field.options.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
      </select> : <input name={field.name} defaultValue={initial[field.name]} type={field.type||'text'} required={field.required!==false} max={field.max} min={field.min} step={field.step} maxLength={100} className="mt-1 block w-full rounded p-2 text-black"/>}
    </label>)}
    <button disabled={busy} className="rounded bg-indigo-600 px-4 py-2 disabled:opacity-50">{busy?'Saving…':'Save'}</button>
    <p role="status">{message}</p>
  </form>;
}
export function ERPTransition({endpoint,label}:{endpoint:string,label:string}){
 const [message,setMessage]=useState('');const [busy,setBusy]=useState(false);const router=useRouter();
 return <span><button disabled={busy} className="m-1 rounded border px-3 py-1" onClick={async()=>{
  setBusy(true);setMessage('');try{const r=await fetch('/api/erp/'+endpoint,{method:'POST'});const data=await r.json();if(!r.ok)throw new Error(typeof data.detail==='string'?data.detail:'Unable to update');setMessage('Updated');router.refresh();}catch(e){setMessage(e instanceof Error?e.message:'Unable to update');}finally{setBusy(false);}
 }}>{label}</button><span role="status">{message}</span></span>
}
