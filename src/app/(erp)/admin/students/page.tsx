import { requireRole,serverApi } from '@/lib/server-api';
import { RecordTable } from '@/components/record-table';
export default async function Page(){ await requireRole('SUPER_ADMIN','INSTITUTION_ADMIN'); return <RecordTable title='Students (first 200)' rows={await serverApi('/students?limit=200')}/>; }
