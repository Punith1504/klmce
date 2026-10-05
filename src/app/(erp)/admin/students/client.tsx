"use client";

import React, { useState } from 'react';
import { DataTable } from '@/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { X, Mail, Phone, MapPin, GraduationCap, Calendar, FileText, Banknote } from 'lucide-react';

export default function StudentsClient({ students }: { students: any[] }) {
    const [selectedStudent, setSelectedStudent] = useState<any>(null);

    const columns: ColumnDef<any>[] = [
        {
            accessorKey: 'rollNo',
            header: 'Roll No',
            cell: ({ row }) => <span className="font-mono text-indigo-300 font-semibold">{row.getValue('rollNo')}</span>,
        },
        {
            accessorKey: 'name',
            header: 'Full Name',
            cell: ({ row }) => <span className="font-medium text-white">{row.getValue('name')}</span>,
        },
        {
            accessorKey: 'email',
            header: 'Institutional Email',
        },
        {
            accessorKey: 'batch.branch.name',
            header: 'Program / Dept',
            cell: ({ row }) => {
                const batch = row.original.batch;
                const prog = batch?.branch?.programme?.name || '';
                const branch = batch?.branch?.code || 'N/A';
                return (
                    <span className="px-2.5 py-1 rounded-md bg-fuchsia-500/10 border border-fuchsia-500/20 text-fuchsia-300 text-xs font-semibold">
                        {prog} {branch}
                    </span>
                );
            },
        },
        {
            accessorKey: 'mobile',
            header: 'Contact',
        }
    ];

    return (
        <div className="p-8 relative min-h-[calc(100vh-64px)] bg-[#050014] overflow-hidden flex flex-col font-sans">
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-violet-600/10 blur-[150px] mix-blend-screen pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-fuchsia-600/10 blur-[120px] mix-blend-screen pointer-events-none" />

            <div className="relative z-10 mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Student Directory</h1>
                <p className="text-violet-200/60">Unified institutional registry. Connected to Prisma SQLite Database.</p>
            </div>

            <div className="relative z-10">
                <DataTable 
                    columns={columns} 
                    data={students} 
                    onRowClick={(student) => setSelectedStudent(student)} 
                />
            </div>

            <div 
                className={`fixed inset-0 z-[100] transition-opacity duration-300 ${selectedStudent ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
            >
                <div 
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    onClick={() => setSelectedStudent(null)}
                />
                
                <div 
                    className={`absolute top-0 right-0 h-full w-full max-w-md bg-[#13111c] border-l border-white/10 shadow-2xl transition-transform duration-300 ease-in-out transform ${selectedStudent ? 'translate-x-0' : 'translate-x-full'} flex flex-col`}
                >
                    {selectedStudent && (
                        <>
                            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-black/20">
                                <div>
                                    <h2 className="text-xl font-bold text-white">{selectedStudent.name}</h2>
                                    <span className="text-sm font-mono text-indigo-400">{selectedStudent.rollNo}</span>
                                </div>
                                <button 
                                    onClick={() => setSelectedStudent(null)}
                                    className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-none">
                                <div>
                                    <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Contact Information</h3>
                                    <div className="space-y-4">
                                        <div className="flex items-center text-sm">
                                            <Mail className="w-4 h-4 text-slate-400 mr-3 shrink-0" />
                                            <span className="text-slate-200">{selectedStudent.email}</span>
                                        </div>
                                        <div className="flex items-center text-sm">
                                            <Phone className="w-4 h-4 text-slate-400 mr-3 shrink-0" />
                                            <span className="text-slate-200">{selectedStudent.mobile}</span>
                                        </div>
                                        <div className="flex items-center text-sm">
                                            <MapPin className="w-4 h-4 text-slate-400 mr-3 shrink-0" />
                                            <span className="text-slate-200">Campus Records</span>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Academic Details</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                                            <GraduationCap className="w-5 h-5 text-indigo-400 mb-2" />
                                            <div className="text-xl font-bold text-white">{selectedStudent.batch?.name || 'N/A'}</div>
                                            <div className="text-xs text-slate-400 mt-1">Batch</div>
                                        </div>
                                        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                                            <Calendar className="w-5 h-5 text-fuchsia-400 mb-2" />
                                            <div className="text-xl font-bold text-white">{selectedStudent.section?.name || 'N/A'}</div>
                                            <div className="text-xs text-slate-400 mt-1">Section</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
