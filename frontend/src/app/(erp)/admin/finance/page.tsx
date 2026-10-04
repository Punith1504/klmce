import React from 'react';
import prisma from '@/lib/prisma';
import { Banknote, TrendingUp, TrendingDown, Users } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminFinancePage() {
    // Count total students to generate a mock aggregate for now, since we lack a real 'Fee' model
    const studentCount = await prisma.student.count();
    const mockTotalExpected = studentCount * 125000; // Assuming 1.25 Lakh fee
    const mockCollected = mockTotalExpected * 0.85; // 85% collection rate
    const mockPending = mockTotalExpected - mockCollected;

    const formatter = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    });

    return (
        <div className="space-y-6 max-w-7xl mx-auto p-6 lg:p-8 font-sans text-white">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-50 flex items-center gap-3 mb-2">
                        <Banknote className="w-7 h-7 text-emerald-400"/> Finance & Accounts
                    </h1>
                    <p className="text-slate-400 text-sm">Monitor fee collections, outstanding dues, and institutional revenue.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-[#221F32]/80 backdrop-blur rounded-3xl p-6 border border-emerald-500/20 shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                    <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1 relative z-10">Total Collected</p>
                    <h3 className="text-3xl font-bold text-emerald-400 relative z-10">{formatter.format(mockCollected)}</h3>
                    <div className="mt-4 flex items-center gap-2 text-xs text-emerald-300 bg-emerald-500/10 w-fit px-2 py-1 rounded-md border border-emerald-500/20">
                        <TrendingUp className="w-3.5 h-3.5" /> 85% of target
                    </div>
                </div>

                <div className="bg-[#221F32]/80 backdrop-blur rounded-3xl p-6 border border-rose-500/20 shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                    <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1 relative z-10">Pending Dues</p>
                    <h3 className="text-3xl font-bold text-rose-400 relative z-10">{formatter.format(mockPending)}</h3>
                    <div className="mt-4 flex items-center gap-2 text-xs text-rose-300 bg-rose-500/10 w-fit px-2 py-1 rounded-md border border-rose-500/20">
                        <TrendingDown className="w-3.5 h-3.5" /> Follow up required
                    </div>
                </div>

                <div className="bg-[#221F32]/80 backdrop-blur rounded-3xl p-6 border border-white/10 shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                    <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1 relative z-10">Total Students Billed</p>
                    <h3 className="text-3xl font-bold text-slate-50 relative z-10">{studentCount}</h3>
                    <div className="mt-4 flex items-center gap-2 text-xs text-indigo-300 bg-indigo-500/10 w-fit px-2 py-1 rounded-md border border-indigo-500/20">
                        <Users className="w-3.5 h-3.5" /> Academic Year 2024-25
                    </div>
                </div>
            </div>
        </div>
    );
}
