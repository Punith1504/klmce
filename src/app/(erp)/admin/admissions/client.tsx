"use client";

import React, { useState } from 'react';
import { UserPlus, Save, CheckCircle } from 'lucide-react';
import { enrollStudent } from './actions';

export default function AdminAdmissionsClient({ batches, sections }: { batches: any[], sections: any[] }) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMsg, setSuccessMsg] = useState("");
    const [errorMsg, setErrorMsg] = useState("");

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSuccessMsg("");
        setErrorMsg("");

        const formData = new FormData(e.currentTarget);
        const result = await enrollStudent(formData);
        
        setIsSubmitting(false);

        if (result.success) {
            setSuccessMsg("Student successfully enrolled!");
            (e.target as HTMLFormElement).reset();
            setTimeout(() => setSuccessMsg(""), 4000);
        } else {
            setErrorMsg("Failed to enroll: " + result.error);
        }
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto p-6 lg:p-8 font-sans text-white">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-50 flex items-center gap-3 mb-2">
                        <UserPlus className="w-7 h-7 text-emerald-400"/> New Admission
                    </h1>
                    <p className="text-slate-400 text-sm">Enroll a new student into the college database.</p>
                </div>
            </div>

            <div className="bg-[#221F32]/80 backdrop-blur rounded-3xl p-8 border border-white/10 shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
                
                <form onSubmit={handleSubmit} className="relative z-10 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Full Name</label>
                            <input 
                                name="name"
                                required
                                type="text"
                                placeholder="e.g. John Doe"
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 outline-none focus:border-emerald-500 transition"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Roll Number (Unique)</label>
                            <input 
                                name="rollNo"
                                required
                                type="text"
                                placeholder="e.g. 24C01A0505"
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 outline-none focus:border-emerald-500 transition uppercase"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Email Address</label>
                            <input 
                                name="email"
                                required
                                type="email"
                                placeholder="john@example.com"
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 outline-none focus:border-emerald-500 transition"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Assigned Batch</label>
                            <select 
                                name="batchId"
                                required
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 outline-none focus:border-emerald-500 transition">
                                <option value="">Select Batch...</option>
                                {batches.map(b => (
                                    <option key={b.id} value={b.id}>{b.name} ({b.branch.name})</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Assigned Section</label>
                            <select 
                                name="sectionId"
                                required
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 outline-none focus:border-emerald-500 transition">
                                <option value="">Select Section...</option>
                                {sections.map(s => (
                                    <option key={s.id} value={s.id}>{s.name} (Batch: {s.batch.name})</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    
                    <div className="pt-4 mt-6 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
                        <div>
                            {successMsg && (
                                <p className="text-emerald-400 text-sm font-semibold flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4" /> {successMsg}
                                </p>
                            )}
                            {errorMsg && (
                                <p className="text-rose-400 text-sm font-semibold">{errorMsg}</p>
                            )}
                        </div>
                        <button 
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full md:w-auto bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-3 rounded-xl text-sm font-bold transition shadow-[0_4px_14px_0_rgba(16,185,129,0.39)] flex items-center justify-center gap-2 disabled:opacity-50">
                            <Save className="w-4 h-4" /> {isSubmitting ? 'Enrolling...' : 'Confirm Admission'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
