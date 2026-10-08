import { StudentRecords } from '@/components/student-records';
import { SandboxInvoices } from '@/components/sandbox-invoices';
export default function Page() { return <><StudentRecords area='fees' roles={['STUDENT']}/><SandboxInvoices roles={['STUDENT']}/></>; }
