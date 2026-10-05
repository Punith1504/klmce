import React from 'react';
import prisma from '@/lib/prisma';
import { Building2 as Building } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function Page() {
    // Fetch live data from Prisma
    const items = await prisma.hostelAllocation.findMany({
        take: 10,
        orderBy: { id: 'desc' }
    }).catch(() => []); // Fallback for empty DB

    return (
        <div className="space-y-6 max-w-7xl mx-auto p-6 lg:p-8 font-sans text-white">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-50 flex items-center gap-3 mb-2">
                        <Building className="w-7 h-7 text-indigo-400"/> Hostel Allocations
                    </h1>
                    <p className="text-slate-400 text-sm">Manage student room allocations.</p>
                </div>
            </div>

            <div className="bg-[#221F32]/80 backdrop-blur rounded-3xl p-6 border border-white/10 shadow-lg overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="text-xs uppercase text-slate-400 border-b border-white/10">
                            <th className="pb-3 px-4">ID</th>
                            <th className="pb-3 px-4">hostelName</th>
<th className="pb-3 px-4">roomNo</th>
<th className="pb-3 px-4">studentId</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.length > 0 ? items.map((item: any) => (
                            <tr key={item.id} className="border-b border-white/5 hover:bg-white/5">
                                <td className="py-4 px-4 text-xs text-slate-500 font-mono">{String(item.id).substring(0, 8)}</td>
                                <td className="py-4 px-4 text-sm text-slate-200">{String(item.hostelName)}</td>
<td className="py-4 px-4 text-sm text-slate-200">{String(item.roomNo)}</td>
<td className="py-4 px-4 text-sm text-slate-200">{String(item.studentId)}</td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={4} className="py-8 text-center text-slate-500">No records found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
