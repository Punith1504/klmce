import React from 'react';
import prisma from '@/lib/prisma';
import { Users, Banknote, BookOpen, AlertTriangle, Building2, UserCog } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const studentCount = await prisma.student.count();
  const facultyCount = await prisma.faculty.count();
  const courseCount = await prisma.course.count();
  const batchCount = await prisma.batch.count();

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-6 lg:p-8 font-sans text-white">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-50 flex items-center gap-3 mb-2">
            Principal / Management Dashboard
          </h1>
          <p className="text-slate-400 text-sm">Institution-wide KPIs, financial oversight, and academic health.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-[#221F32]/80 backdrop-blur rounded-2xl p-6 border border-white/10 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
          <div className="flex items-center gap-4 mb-4 relative z-10">
             <div className="w-12 h-12 bg-indigo-500/20 text-indigo-400 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6" />
             </div>
             <div>
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Total Students</p>
                <h3 className="text-2xl font-bold text-slate-50">{studentCount}</h3>
             </div>
          </div>
          <p className="text-xs text-indigo-400 font-bold relative z-10">Active in {batchCount} Batches</p>
        </div>

        <div className="bg-[#221F32]/80 backdrop-blur rounded-2xl p-6 border border-white/10 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
          <div className="flex items-center gap-4 mb-4 relative z-10">
             <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-xl flex items-center justify-center">
                <UserCog className="w-6 h-6" />
             </div>
             <div>
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Total Faculty</p>
                <h3 className="text-2xl font-bold text-slate-50">{facultyCount}</h3>
             </div>
          </div>
          <p className="text-xs text-emerald-400 font-bold relative z-10">Across all departments</p>
        </div>

        <div className="bg-[#221F32]/80 backdrop-blur rounded-2xl p-6 border border-white/10 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-sky-500/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
          <div className="flex items-center gap-4 mb-4 relative z-10">
             <div className="w-12 h-12 bg-sky-500/20 text-sky-400 rounded-xl flex items-center justify-center">
                <BookOpen className="w-6 h-6" />
             </div>
             <div>
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Active Courses</p>
                <h3 className="text-2xl font-bold text-slate-50">{courseCount}</h3>
             </div>
          </div>
          <p className="text-xs text-sky-400 font-bold relative z-10">Offered this semester</p>
        </div>

        <div className="bg-[#221F32]/80 backdrop-blur rounded-2xl p-6 border border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.1)] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
          <div className="flex items-center gap-4 mb-4 relative z-10">
             <div className="w-12 h-12 bg-amber-500/20 text-amber-400 rounded-xl flex items-center justify-center">
                <Banknote className="w-6 h-6" />
             </div>
             <div>
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Fee Collection</p>
                <h3 className="text-2xl font-bold text-slate-50">₹8.4 Cr</h3>
             </div>
          </div>
          <p className="text-xs text-amber-400 font-bold relative z-10">₹1.2 Cr Pending Collection</p>
        </div>
      </div>
    </div>
  );
}
