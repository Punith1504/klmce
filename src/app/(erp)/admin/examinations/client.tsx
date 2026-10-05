"use client";

import React, { useState } from 'react';
import { Award, Plus, Calendar, BookOpen } from 'lucide-react';
import { createExam } from './actions';

export default function AdminExaminationsClient({ exams, batches }: { exams: any[], batches: any[] }) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        const res = await createExam(new FormData(e.currentTarget));
        setIsSubmitting(false);
        if (res.success) {
            (e.target as HTMLFormElement).reset();
        } else {
            alert(res.error);
        }
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto p-6 lg:p-8 font-sans text-white">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-50 flex items-center gap-3 mb-2">
                        <Award className="w-7 h-7 text-amber-400"/> Examination Cell
                    </h1>
                    <p className="text-slate-400 text-sm">Schedule exams and manage assessment blocks.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 bg-[#221F32]/80 backdrop-blur rounded-3xl p-6 border border-white/10 shadow-lg h-fit">
                    <h2 className="text-lg font-bold text-slate-50 mb-6 flex items-center gap-2">
                        <Plus className="w-5 h-5 text-amber-400" /> New Examination
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Exam Name</label>
                            <input name="name" required placeholder="e.g. Mid Term 1" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 outline-none focus:border-amber-500" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Exam Type</label>
                            <select name="type" required className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 outline-none focus:border-amber-500">
                                <option value="MID_TERM">Mid Term</option>
                                <option value="END_SEMESTER">End Semester</option>
                                <option value="PRACTICAL">Practical</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Target Batch</label>
                            <select name="batchId" required className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 outline-none focus:border-amber-500">
                                <option value="">Select Batch...</option>
                                {batches.map(b => (
                                    <option key={b.id} value={b.id}>{b.name} ({b.branch.name})</option>
                                ))}
                            </select>
                        </div>
                        <button type="submit" disabled={isSubmitting} className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-[0_0_15px_rgba(217,119,6,0.4)] disabled:opacity-50 mt-4">
                            {isSubmitting ? 'Scheduling...' : 'Schedule Exam'}
                        </button>
                    </form>
                </div>

                <div className="lg:col-span-2 bg-[#221F32]/80 backdrop-blur rounded-3xl p-6 border border-white/10 shadow-lg">
                    <h2 className="text-lg font-bold text-slate-50 mb-6 flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-indigo-400" /> Active Examinations
                    </h2>
                    <div className="space-y-3">
                        {exams.length > 0 ? exams.map(exam => (
                            <div key={exam.id} className="bg-black/40 border border-white/5 rounded-2xl p-4 flex justify-between items-center">
                                <div>
                                    <h3 className="font-bold text-slate-200">{exam.name}</h3>
                                    <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                                        <BookOpen className="w-3.5 h-3.5" /> Batch: {exam.batch.name} • {exam.type.replace('_', ' ')}
                                    </p>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${exam.status === 'SCHEDULED' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}>
                                    {exam.status}
                                </span>
                            </div>
                        )) : (
                            <div className="text-center py-8 text-slate-500">No exams scheduled.</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
