"use client";

import React, { useState, useEffect } from 'react';
import { CalendarCheck, Save, Users, Filter, CheckCircle } from 'lucide-react';
import { submitAttendance } from './actions';

type Student = {
    id: string;
    rollNo: string;
    name: string;
};

type Slot = {
    id: string;
    course: { title: string, code: string };
    section: { name: string };
    dayOfWeek: string;
    startTime: string;
    endTime: string;
    students: Student[];
};

export default function FacultyAttendanceClient({ slots }: { slots: Slot[] }) {
    const todayStr = new Date().toISOString().split('T')[0];
    const [date, setDate] = useState(todayStr);
    const [selectedSlotId, setSelectedSlotId] = useState<string>(slots.length > 0 ? slots[0].id : "");
    const [attendanceState, setAttendanceState] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMsg, setSuccessMsg] = useState("");

    const selectedSlot = slots.find(s => s.id === selectedSlotId);

    // Initialize attendance state when slot changes
    useEffect(() => {
        if (selectedSlot) {
            const initialState: Record<string, string> = {};
            selectedSlot.students.forEach(s => {
                initialState[s.id] = "PRESENT"; // Default to present
            });
            setAttendanceState(initialState);
            setSuccessMsg("");
        }
    }, [selectedSlotId, date, selectedSlot]);

    const markAll = (status: string) => {
        if (!selectedSlot) return;
        const newState: Record<string, string> = {};
        selectedSlot.students.forEach(s => {
            newState[s.id] = status;
        });
        setAttendanceState(newState);
    };

    const handleStatusChange = (studentId: string, status: string) => {
        setAttendanceState(prev => ({ ...prev, [studentId]: status }));
    };

    const handleSubmit = async () => {
        if (!selectedSlot) return;
        setIsSubmitting(true);
        setSuccessMsg("");
        
        const records = Object.keys(attendanceState).map(studentId => ({
            studentId,
            status: attendanceState[studentId]
        }));

        const result = await submitAttendance(selectedSlot.id, date, records);
        setIsSubmitting(false);

        if (result.success) {
            setSuccessMsg("Attendance successfully saved!");
            setTimeout(() => setSuccessMsg(""), 3000);
        } else {
            alert("Failed to submit attendance: " + result.error);
        }
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto p-6 lg:p-8 font-sans text-white">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-50 flex items-center gap-3 mb-2">
                        <CalendarCheck className="w-7 h-7 text-indigo-400"/> Attendance Entry
                    </h1>
                    <p className="text-slate-400 text-sm">Roster-based attendance for your assigned classes.</p>
                </div>
            </div>

            {/* Context Selector */}
            <div className="bg-[#221F32]/80 backdrop-blur rounded-2xl p-6 border border-white/10 shadow-lg flex flex-col md:flex-row gap-4 items-end">
                <div className="flex-1 w-full">
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Course & Section / Slot</label>
                    <select 
                        value={selectedSlotId}
                        onChange={(e) => setSelectedSlotId(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-slate-200 outline-none focus:border-indigo-500 transition">
                        {slots.map(slot => (
                            <option key={slot.id} value={slot.id}>
                                {slot.course.title} ({slot.section.name}) - {slot.dayOfWeek} {slot.startTime}
                            </option>
                        ))}
                        {slots.length === 0 && <option value="">No classes assigned</option>}
                    </select>
                </div>
                <div className="flex-1 w-full">
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Date</label>
                    <input 
                        type="date" 
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-sm text-slate-200 outline-none focus:border-indigo-500 transition [color-scheme:dark]" 
                    />
                </div>
                <button 
                    onClick={() => {}} 
                    className="bg-white/10 hover:bg-white/20 text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition border border-white/10 flex items-center gap-2">
                    <Filter className="w-4 h-4" /> Load Roster
                </button>
            </div>

            {/* Roster */}
            {selectedSlot && (
                <div className="bg-[#221F32]/80 backdrop-blur rounded-2xl border border-white/10 shadow-lg overflow-hidden relative">
                    <div className="p-4 border-b border-white/10 bg-black/20 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <Users className="w-5 h-5 text-slate-400" />
                            <h2 className="font-bold text-slate-50">Student Roster ({selectedSlot.section.name})</h2>
                        </div>
                        <div className="flex gap-2">
                            <button 
                                onClick={() => markAll('PRESENT')}
                                className="text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1.5 rounded-md hover:bg-emerald-500/30">
                                Mark All Present
                            </button>
                            <button 
                                onClick={() => markAll('ABSENT')}
                                className="text-xs bg-rose-500/20 text-rose-400 border border-rose-500/30 px-3 py-1.5 rounded-md hover:bg-rose-500/30">
                                Mark All Absent
                            </button>
                        </div>
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-slate-400 uppercase bg-black/40 border-b border-white/10">
                                <tr>
                                    <th className="px-6 py-4 font-semibold">Roll Number</th>
                                    <th className="px-6 py-4 font-semibold">Student Name</th>
                                    <th className="px-6 py-4 font-semibold text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {selectedSlot.students.length > 0 ? selectedSlot.students.map((student, i) => (
                                    <tr key={i} className="hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4 font-medium text-slate-300">{student.rollNo}</td>
                                        <td className="px-6 py-4 text-slate-300">{student.name}</td>
                                        <td className="px-6 py-4 flex justify-center gap-2">
                                            {[
                                                { label: "Present", value: "PRESENT" },
                                                { label: "Absent", value: "ABSENT" },
                                                { label: "Excused", value: "EXCUSED" }
                                            ].map(statusObj => (
                                                <button 
                                                    key={statusObj.value}
                                                    onClick={() => handleStatusChange(student.id, statusObj.value)}
                                                    className={`px-3 py-1 rounded-md text-xs font-bold border transition ${
                                                        attendanceState[student.id] === statusObj.value
                                                            ? statusObj.value === 'PRESENT' ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
                                                            : statusObj.value === 'ABSENT' ? 'bg-rose-500/20 border-rose-500/50 text-rose-400'
                                                            : 'bg-amber-500/20 border-amber-500/50 text-amber-400'
                                                            : 'bg-black/30 border-white/10 text-slate-500 hover:bg-white/10 hover:text-slate-300'
                                                    }`}
                                                >
                                                    {statusObj.label}
                                                </button>
                                            ))}
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={3} className="text-center py-8 text-slate-500">
                                            No students found in this section.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    <div className="p-4 border-t border-white/10 bg-black/20 flex justify-between items-center">
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
                            className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-xl text-sm font-semibold transition shadow-[0_4px_14px_0_rgba(79,70,229,0.39)] flex items-center gap-2 disabled:opacity-50">
                            <Save className="w-4 h-4" /> {isSubmitting ? 'Saving...' : 'Submit Attendance'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
