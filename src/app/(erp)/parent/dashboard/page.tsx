import { requireRole,serverApi } from '@/lib/server-api';
import { RecordTable } from '@/components/record-table';
export default async function Page(){ await requireRole('PARENT'); return <RecordTable title='Linked students' rows={await serverApi('/students')}/>; }
