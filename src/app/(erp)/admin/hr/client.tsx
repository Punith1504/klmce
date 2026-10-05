"use client";

import React, { useState } from 'react';
import { Users, Search, UserCog } from 'lucide-react';

export default function AdminHRClient({ facultyList }: { facultyList: any[] }) {
    const [search, setSearch] = useState("");

    const filtered = facultyList.filter(f => 
        f.name.toLowerCase().includes(search.toLowerCase()) || 
        f.empId.toLowerCase().includes(search.toLowerCase()) ||
        f.department.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6 max-w-7xl mx-auto p-6 lg:p-8 font-sans text-white">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-50 flex items-center gap-3 mb-2">
                        <UserCog className="w-7 h-7 text-fuchsia-400"/> Faculty & Staff Directory
                    </h1>
                    <p className="text-slate-400 text-sm">Manage teaching staff, view workload, and monitor performance.</p>
                </div>
            </div>

            <div className="bg-[#221F32]/80 backdrop-blur rounded-3xl p-6 border border-white/10 shadow-lg">
                <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                    <h2 className="text-xl font-bold text-slate-50 flex items-center gap-2">
                        <Users className="w-5 h-5 text-indigo-400" /> Active Roster
                    </h2>
                    <div className="relative w-full md:w-64">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" />
                        <input 
                            type="text"
                            placeholder="Search by name, ID..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-200 outline-none focus:border-fuchsia-500 transition"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[600px]">
                        <thead>
                            <tr className="bg-white/[0.02] text-slate-300 text-xs uppercase tracking-wider border-b border-white/10">
                                <th className="p-4 font-semibold">Employee ID</th>
                                <th className="p-4 font-semibold">Full Name</th>
                                <th className="p-4 font-semibold">Email</th>
                                <th className="p-4 font-semibold">Department</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-sm text-slate-200">
                            {filtered.map(faculty => (
                                <tr key={faculty.id} className="hover:bg-white/[0.02] transition-colors">
                                    <td className="p-4 font-mono text-fuchsia-300">{faculty.empId}</td>
                                    <td className="p-4 font-semibold text-slate-100">{faculty.name}</td>
                                    <td className="p-4 text-slate-400">{faculty.email}</td>
                                    <td className="p-4">
                                        <span className="px-2.5 py-1 bg-white/5 border border-white/10 rounded-md text-xs font-medium text-slate-300">
                                            {faculty.department}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {filtered.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="p-8 text-center text-slate-500">
                                        No faculty members found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
