"use client";

import React, { useState, useEffect } from 'react';
import { Award, Save, Users, Filter, CheckCircle } from 'lucide-react';
import { submitResults } from './actions';

type Student = {
    id: string;
    rollNo: string;
    name: string;
};

type ExamSchedule = {
    id: string;
    exam: { name: string };
    course: { title: string, code: string };
    date: string;
    students: Student[];
    existingResults: { studentId: string, marksObtained: number }[];
};

export default function FacultyResultsClient({ schedules }: { schedules: ExamSchedule[] }) {
    const [selectedScheduleId, setSelectedScheduleId] = useState<string>(schedules.length > 0 ? schedules[0].id : "");
    const [marksState, setMarksState] = useState<Record<string, number>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMsg, setSuccessMsg] = useState("");

    const selectedSchedule = schedules.find(s => s.id === selectedScheduleId);

    // Initialize marks state when schedule changes
    useEffect(() => {
        if (selectedSchedule) {
            const initialState: Record<string, number> = {};
            selectedSchedule.students.forEach(s => {
                const existing = selectedSchedule.existingResults.find(r => r.studentId === s.id);
                initialState[s.id] = existing ? existing.marksObtained : 0;
            });
            setMarksState(initialState);
            setSuccessMsg("");
        }
    }, [selectedScheduleId, selectedSchedule]);

    const handleMarksChange = (studentId: string, value: string) => {
        let num = parseInt(value, 10);
        if (isNaN(num)) num = 0;
        if (num < 0) num = 0;
        if (num > 30) num = 30; // Hardcoded max marks 30 for MVP
        setMarksState(prev => ({ ...prev, [studentId]: num }));
    };

    const handleSubmit = async () => {
        if (!selectedSchedule) return;
        setIsSubmitting(true);
        setSuccessMsg("");
        
        const records = Object.keys(marksState).map(studentId => ({
            studentId,
            marks: marksState[studentId]
        }));

        const result = await submitResults(selectedSchedule.id, records);
        setIsSubmitting(false);

        if (result.success) {
            setSuccessMsg("Results published successfully!");
            setTimeout(() => setSuccessMsg(""), 3000);
        } else {
            alert("Failed to publish results: " + result.error);
        }
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 font-sans text-white">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-50 flex items-center gap-3 mb-2">
                        <Award className="w-6 h-6 sm:w-7 sm:h-7 text-fuchsia-400"/> Results Publishing
                    </h1>
                    <p className="text-slate-400 text-xs sm:text-sm">Enter grades and marks for your examination subjects.</p>
                </div>
            </div>

            {/* Context Selector */}
            <div className="bg-[#221F32]/80 backdrop-blur rounded-2xl p-4 sm:p-6 border border-white/10 shadow-lg flex flex-col md:flex-row gap-4 items-stretch md:items-end">
                <div className="flex-1 w-full">
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Exam Schedule</label>
                    <select 
                        value={selectedScheduleId}
                        onChange={(e) => setSelectedScheduleId(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-base sm:text-sm text-slate-200 outline-none focus:border-fuchsia-500 transition">
                        {schedules.map(sch => (
                            <option key={sch.id} value={sch.id}>
                                {sch.course.title} - {sch.exam.name} ({sch.date})
                            </option>
                        ))}
                        {schedules.length === 0 && <option value="">No exams assigned</option>}
                    </select>
                </div>
                <button 
                    onClick={() => {}} 
                    className="w-full md:w-auto bg-white/10 hover:bg-white/20 text-white px-6 py-3 min-h-[44px] rounded-xl text-sm font-semibold transition border border-white/10 flex items-center justify-center gap-2">
                    <Filter className="w-4 h-4" /> Load Roster
                </button>
            </div>

            {/* Roster & Marks Entry */}
            {selectedSchedule && (
                <div className="bg-[#221F32]/80 backdrop-blur rounded-2xl border border-white/10 shadow-lg overflow-hidden relative">
                    <div className="p-4 border-b border-white/10 bg-black/20 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <Users className="w-5 h-5 text-slate-400" />
                            <h2 className="font-bold text-slate-50 text-sm sm:text-base">Score Entry (Max: 30)</h2>
                        </div>
                    </div>
                    
                    {/* Mobile Card List (< md) */}
                    <div className="block md:hidden divide-y divide-white/5">
                        {selectedSchedule.students.length > 0 ? selectedSchedule.students.map((student, i) => (
                            <div key={i} className="p-4 flex items-center justify-between gap-3 hover:bg-white/5 transition-colors">
                                <div className="min-w-0">
                                    <span className="text-xs font-mono font-bold text-fuchsia-400 block">{student.rollNo}</span>
                                    <h4 className="text-sm font-medium text-slate-200 truncate">{student.name}</h4>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    <span className="text-xs text-slate-400 font-semibold">Marks:</span>
                                    <input 
                                        type="number"
                                        min="0"
                                        max="30"
                                        value={marksState[student.id] || ''}
                                        onChange={(e) => handleMarksChange(student.id, e.target.value)}
                                        className="w-20 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-base text-white outline-none focus:border-fuchsia-500 transition text-center font-bold"
                                        placeholder="0"
                                    />
                                </div>
                            </div>
                        )) : (
                            <div className="text-center py-8 text-slate-500 text-sm">
                                No students found for this exam.
                            </div>
                        )}
                    </div>

                    {/* Desktop Table (>= md) */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-slate-400 uppercase bg-black/40 border-b border-white/10">
                                <tr>
                                    <th className="px-6 py-4 font-semibold">Roll Number</th>
                                    <th className="px-6 py-4 font-semibold">Student Name</th>
                                    <th className="px-6 py-4 font-semibold text-right">Marks Obtained</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {selectedSchedule.students.length > 0 ? selectedSchedule.students.map((student, i) => (
                                    <tr key={i} className="hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4 font-medium text-slate-300 font-mono">{student.rollNo}</td>
                                        <td className="px-6 py-4 text-slate-300">{student.name}</td>
                                        <td className="px-6 py-4 text-right">
                                            <input 
                                                type="number"
                                                min="0"
                                                max="30"
                                                value={marksState[student.id] || ''}
                                                onChange={(e) => handleMarksChange(student.id, e.target.value)}
                                                className="w-20 bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white outline-none focus:border-fuchsia-500 transition text-right"
                                                placeholder="0"
                                            />
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={3} className="text-center py-8 text-slate-500">
                                            No students found for this exam.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    
                    {/* Bottom Status & Submit */}
                    <div className="p-4 border-t border-white/10 bg-black/20 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
                        <div>
                            {successMsg && (
                                <span className="flex items-center gap-2 text-sm text-emerald-400 font-semibold">
                                    <CheckCircle className="w-4 h-4" /> {successMsg}
                                </span>
                            )}
                        </div>
                        <button 
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="w-full sm:w-auto bg-fuchsia-600 hover:bg-fuchsia-500 text-white px-6 py-3 min-h-[44px] rounded-xl text-sm font-semibold transition shadow-[0_4px_14px_0_rgba(192,38,211,0.39)] flex items-center justify-center gap-2 disabled:opacity-50">
                            <Save className="w-4 h-4" /> {isSubmitting ? 'Publishing...' : 'Publish Results'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
