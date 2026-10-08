import { headers } from 'next/headers';
import { requireRole } from '@/lib/server-api';
import { ModuleUnavailable } from '@/components/module-unavailable';
const liveRoutes = new Set(['/admin/dashboard','/admin/students','/admin/analytics','/admin/admissions','/admin/timetable','/admin/examinations','/admin/finance',
  '/faculty/attendance','/faculty/results','/student/attendance','/student/results','/student/fees',
  '/parent/dashboard','/parent/attendance','/parent/fees']);
export default async function ERPLayout({children}:{children:React.ReactNode}) {
  const path=(await headers()).get('x-erp-path') || '';
  const role=path.split('/')[1];
  const roles:Record<string,string[]>={admin:['SUPER_ADMIN','INSTITUTION_ADMIN'],faculty:['FACULTY'],student:['STUDENT'],parent:['PARENT']};
  await requireRole(...(roles[role] || []));
  return liveRoutes.has(path) ? children : <ModuleUnavailable/>;
}
