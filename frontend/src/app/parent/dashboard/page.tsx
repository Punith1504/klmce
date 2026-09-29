"use client";

import { useState, useEffect } from "react";
import { useQuery, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fetchClient } from "@/lib/api-client";

// ==========================================
// TanStack Query Client Initialization
// ==========================================
// In a full application, this would typically reside in app/layout.tsx inside a <Providers> component.
// We instantiate it here to guarantee the dashboard is standalone and functional.
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

// ==========================================
// Interfaces
// ==========================================
interface Student {
  student_id: string;
  first_name: string;
  last_name: string;
  enrollment_number: string;
}

interface AttendanceSummary {
  total_days: number;
  present_days: number;
  absent_days: number;
  percentage: number;
}

interface ExamGrade {
  mark_id: string;
  subject: string;
  marks_obtained: number;
  max_marks: number;
  exam_date: string;
  status: "DRAFT" | "SUBMITTED" | "LOCKED" | "PUBLISHED";
}

interface FinanceDues {
  total_dues: number;
  currency: string;
  next_due_date: string;
}

// ==========================================
// Skeletons
// ==========================================
const WidgetSkeleton = () => (
  <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6 shadow-xl animate-pulse">
    <div className="h-6 bg-gray-800 rounded w-1/3 mb-4"></div>
    <div className="h-12 bg-gray-800 rounded w-1/2 mb-2"></div>
    <div className="h-4 bg-gray-800 rounded w-3/4"></div>
  </div>
);

const TableSkeleton = () => (
  <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6 shadow-xl animate-pulse col-span-1 md:col-span-2">
    <div className="h-6 bg-gray-800 rounded w-1/4 mb-6"></div>
    <div className="space-y-4">
      {[1, 2, 3].map(i => (
        <div key={i} className="h-12 bg-gray-800/50 rounded-xl w-full"></div>
      ))}
    </div>
  </div>
);

// ==========================================
// Inner Dashboard Component
// ==========================================
function ParentDashboard() {
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  // 1. Fetch Roster of Children linked to this Parent
  const { data: students, isLoading: isLoadingStudents, isError: isStudentsError } = useQuery({
    queryKey: ['parent-students'],
    queryFn: () => fetchClient<Student[]>("/students"),
  });

  // Auto-select first child on load
  const activeStudentId = selectedStudentId || (students && students.length > 0 ? students[0].student_id : null);

  // 2. Parallel Fetch Metrics for Active Child
  const { data: attendance, isLoading: isLoadingAttendance } = useQuery({
    queryKey: ['attendance', activeStudentId],
    queryFn: () => fetchClient<AttendanceSummary>(`/attendance/summary?student_id=${activeStudentId}`),
    enabled: !!activeStudentId,
  });

  const { data: exams, isLoading: isLoadingExams } = useQuery({
    queryKey: ['exams', activeStudentId],
    queryFn: () => fetchClient<ExamGrade[]>(`/exams/grades?student_id=${activeStudentId}`),
    enabled: !!activeStudentId,
  });

  const { data: finance, isLoading: isLoadingFinance } = useQuery({
    queryKey: ['finance', activeStudentId],
    queryFn: () => fetchClient<FinanceDues>(`/finance/dues?student_id=${activeStudentId}`),
    enabled: !!activeStudentId,
  });

  // Helper for color coding attendance
  const getAttendanceColor = (percentage: number) => {
    if (percentage >= 75) return "text-emerald-400";
    if (percentage >= 65) return "text-amber-400";
    return "text-red-400";
  };

  const activeStudent = students?.find(s => s.student_id === activeStudentId);

  if (isLoadingStudents) {
    return (
      <div className="min-h-screen bg-gray-950 p-8 flex flex-col gap-6">
        <div className="h-10 bg-gray-900 rounded w-64 animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <WidgetSkeleton /><WidgetSkeleton />
        </div>
      </div>
    );
  }

  if (isStudentsError || !students || students.length === 0) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-4">
        <div className="bg-gray-900 border border-gray-800 p-8 rounded-3xl max-w-md w-full text-center">
           <h2 className="text-xl font-bold text-white mb-2">No Students Found</h2>
           <p className="text-gray-400 text-sm">We could not find any active student profiles linked to your parent account. Please contact the administration office.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-6 md:p-10 font-sans selection:bg-indigo-500/30">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header & Context Switcher */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">Parent Portal</h1>
            <p className="text-gray-400 mt-1">Real-time academic and administrative overview.</p>
          </div>
          
          <div className="flex items-center gap-3 bg-gray-900 p-2 rounded-2xl border border-gray-800 shadow-lg">
             <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center font-bold text-sm shadow-inner shadow-white/20">
                {activeStudent?.first_name[0]}{activeStudent?.last_name[0]}
             </div>
             <div className="pr-3">
               <select 
                 className="bg-transparent text-white font-semibold outline-none border-none focus:ring-0 cursor-pointer appearance-none pr-8"
                 value={activeStudentId || ''}
                 onChange={(e) => setSelectedStudentId(e.target.value)}
                 style={{ backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="gray"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>')`, backgroundPosition: 'right 0.1rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.2em 1.2em' }}
               >
                 {students.map(s => (
                   <option key={s.student_id} value={s.student_id} className="bg-gray-900 text-white">
                     {s.first_name} {s.last_name} ({s.enrollment_number})
                   </option>
                 ))}
               </select>
             </div>
          </div>
        </div>

        {/* Top Widgets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Attendance Widget */}
          {isLoadingAttendance ? <WidgetSkeleton /> : (
            <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6 shadow-xl relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-6 opacity-10 transform translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform duration-500">
                  <svg className="w-32 h-32 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
               </div>
               <h3 className="text-gray-400 font-semibold mb-2">Cumulative Attendance</h3>
               <div className="flex items-end gap-3">
                 <span className={`text-5xl font-black tracking-tighter ${getAttendanceColor(attendance?.percentage || 0)}`}>
                   {attendance?.percentage || 0}%
                 </span>
                 <span className="text-sm text-gray-500 mb-1 font-medium tracking-wide">
                   {attendance?.present_days} / {attendance?.total_days} Days
                 </span>
               </div>
               
               {/* Contextual Warning */}
               {(attendance?.percentage || 0) < 75 && (
                 <div className="mt-5 p-3 rounded-xl bg-red-950/30 border border-red-900/50 flex items-start gap-2">
                    <svg className="w-4 h-4 text-red-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <p className="text-xs text-red-400 font-medium leading-relaxed">
                       Warning: Attendance is below the 75% institutional mandate. The student may face exam debarment.
                    </p>
                 </div>
               )}
            </div>
          )}

          {/* Finance Dues Widget */}
          {isLoadingFinance ? <WidgetSkeleton /> : (
            <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6 shadow-xl relative overflow-hidden flex flex-col justify-between">
               <div>
                 <h3 className="text-gray-400 font-semibold mb-2">Outstanding Dues</h3>
                 <div className="text-5xl font-black tracking-tighter text-white">
                   {finance?.currency || 'USD'} {(finance?.total_dues || 0).toLocaleString()}
                 </div>
                 {finance?.total_dues && finance.total_dues > 0 ? (
                   <p className="text-sm text-red-400 mt-2 font-medium">Due by: {new Date(finance.next_due_date).toLocaleDateString()}</p>
                 ) : (
                   <p className="text-sm text-emerald-400 mt-2 font-medium">All accounts are settled. No action required.</p>
                 )}
               </div>
               
               {finance?.total_dues && finance.total_dues > 0 ? (
                 <button className="mt-6 w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-900/20 transform transition-all active:scale-[0.98]">
                    Pay Now via Portal
                 </button>
               ) : null}
            </div>
          )}
        </div>

        {/* Academic Progress Table */}
        {isLoadingExams ? <TableSkeleton /> : (
          <div className="bg-gray-900 border border-gray-800 rounded-3xl shadow-xl overflow-hidden">
            <div className="p-6 border-b border-gray-800">
               <h3 className="text-xl font-bold text-white">Academic Progress</h3>
               <p className="text-sm text-gray-400 mt-1">Official examination records for the current semester.</p>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-gray-950/50 text-gray-400 border-b border-gray-800 uppercase tracking-wider font-semibold text-xs">
                  <tr>
                    <th className="px-6 py-4">Subject</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Score</th>
                    <th className="px-6 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/50">
                  {exams && exams.length > 0 ? exams.map((exam) => {
                    const percentage = (exam.marks_obtained / exam.max_marks) * 100;
                    return (
                      <tr key={exam.mark_id} className="hover:bg-gray-800/20 transition-colors">
                        <td className="px-6 py-4 font-medium text-white">{exam.subject}</td>
                        <td className="px-6 py-4 text-gray-400">{new Date(exam.exam_date).toLocaleDateString()}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                             <span className="font-bold text-white">{exam.marks_obtained}</span>
                             <span className="text-gray-500">/ {exam.max_marks}</span>
                             <div className="w-16 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                                <div className={`h-full rounded-full ${percentage >= 70 ? 'bg-emerald-500' : percentage >= 40 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${percentage}%` }}></div>
                             </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                           {exam.status === "PUBLISHED" ? (
                             <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase tracking-wider rounded-md border border-emerald-500/20">Published</span>
                           ) : exam.status === "LOCKED" ? (
                             <span className="px-2.5 py-1 bg-blue-500/10 text-blue-400 text-[10px] font-bold uppercase tracking-wider rounded-md border border-blue-500/20">Locked (Under Review)</span>
                           ) : (
                             <span className="px-2.5 py-1 bg-gray-800 text-gray-400 text-[10px] font-bold uppercase tracking-wider rounded-md">Processing</span>
                           )}
                        </td>
                      </tr>
                    );
                  }) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                        No examination records found for this student.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

// ==========================================
// Expose Component wrapped with QueryClient
// ==========================================
export default function ParentPortalPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <ParentDashboard />
    </QueryClientProvider>
  );
}
