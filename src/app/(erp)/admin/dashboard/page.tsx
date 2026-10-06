import { requireRole,serverApi } from '@/lib/server-api';
import { RecordTable } from '@/components/record-table';
export default async function Page(){ await requireRole('SUPER_ADMIN','INSTITUTION_ADMIN'); const values=await serverApi<Record<string,unknown>>('/analytics/kpis'); return <RecordTable title='Institution records' rows={[values]}/>; }
