import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { STUDENTS } from "@/lib/syntheticData";

export default function Page() {
    const data = STUDENTS;
    return (
        <div className="p-8 space-y-6 text-white min-h-screen bg-[#050014] relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-violet-600/10 blur-[150px] mix-blend-screen pointer-events-none" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-fuchsia-600/10 blur-[120px] mix-blend-screen pointer-events-none" />

            <div className="relative z-10">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Hostel Allocation</h1>
                    <p className="text-violet-200/60 mt-2">Room and boarding management.</p>
                </div>
                
                <div className="mt-8">
                    <Card className="bg-white/[0.02] border-white/10 backdrop-blur-2xl overflow-hidden shadow-2xl">
                        <CardHeader className="border-b border-white/5 bg-white/5 p-6">
                            <CardTitle className="text-violet-300 font-medium tracking-wide text-sm uppercase">Active Directory</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-white/5 text-xs uppercase text-white/40 tracking-wider bg-black/20">
                                            <th className="px-6 py-4 font-semibold">ID</th>
                                            <th className="px-6 py-4 font-semibold">Name</th>
                                            <th className="px-6 py-4 font-semibold">Email</th>
                                            <th className="px-6 py-4 font-semibold">Classification</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {data.slice(0, 15).map((row: any, i: number) => (
                                            <tr key={i} className="hover:bg-white/[0.02] transition-colors group">
                                                <td className="px-6 py-4 text-white/50 font-mono text-sm group-hover:text-white transition-colors">{row.id}</td>
                                                <td className="px-6 py-4 text-white font-medium">{row.name}</td>
                                                <td className="px-6 py-4 text-violet-300/70 text-sm group-hover:text-violet-300 transition-colors">{row.email}</td>
                                                <td className="px-6 py-4 text-sm">
                                                    <span className="px-3 py-1 bg-white/5 text-fuchsia-300/80 rounded-full border border-white/5 text-xs font-medium tracking-wide">
                                                        {row.department || row.role || row.designation}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
