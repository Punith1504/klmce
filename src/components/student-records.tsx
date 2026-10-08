import { serverApi,requireRole } from '@/lib/server-api';
import { RecordTable } from './record-table';
export async function StudentRecords({area,roles}:{area:'attendance'|'marks'|'fees',roles:string[]}) {
  await requireRole(...roles);
  const records=await serverApi<Record<string,Record<string,unknown>[]>>('/students/records');
  return <RecordTable title={area==='marks'?'Published results':area==='fees'?'Payment records':'Attendance'} rows={records[area]}/>;
}
