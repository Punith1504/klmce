import Link from 'next/link';
import { requireRole,serverApi } from '@/lib/server-api';
import { RecordTable } from '@/components/record-table';
export default async function Page({searchParams}:{searchParams:Promise<{page?:string}>}) {
  await requireRole('SUPER_ADMIN','INSTITUTION_ADMIN');
  const requested=Number((await searchParams).page || 1);
  const page=Number.isInteger(requested) && requested>0 ? Math.min(requested,1000) : 1;
  const rows=await serverApi<Record<string,unknown>[]>(`/students?limit=100&offset=${(page-1)*100}`);
  return <>
    <RecordTable title={`Students — page ${page}`} rows={rows}/>
    <nav aria-label="Student pages" className="flex gap-6 px-8 pb-8 text-slate-200">
      {page>1 && <Link href={`/admin/students?page=${page-1}`}>Previous</Link>}
      {rows.length===100 && page<1000 && <Link href={`/admin/students?page=${page+1}`}>Next</Link>}
    </nav>
  </>;
}
