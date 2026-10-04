"use client";

import React, { useState, useEffect } from 'react';
import { STUDENTS } from "@/lib/syntheticData";

export default function AdmissionsKanban() {
    // We add a 'status' to each student to track them in the Kanban board.
    const [tasks, setTasks] = useState<{id: string, name: string, email: string, department: string, status: string}[]>([]);

    useEffect(() => {
        // Initialize synthetic students into the "Applied" column on mount
        const initialTasks = STUDENTS.slice(0, 15).map((s: any) => ({
            id: s.id,
            name: s.name,
            email: s.email,
            department: s.department || "B.Tech",
            status: "Applied"
        }));
        setTasks(initialTasks);
    }, []);

    const columns = ["Applied", "Screening", "Interview", "Admitted", "Rejected"];

    const onDragStart = (e: React.DragEvent, id: string) => {
        e.dataTransfer.setData("id", id);
    };

    const onDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const onDrop = (e: React.DragEvent, targetStatus: string) => {
        const id = e.dataTransfer.getData("id");
        setTasks(prevTasks => prevTasks.map(t => {
            if (t.id === id) {
                return { ...t, status: targetStatus };
            }
            return t;
        }));
    };

    return (
        <div className="p-8 space-y-6 text-white min-h-screen bg-[#050014] relative overflow-hidden font-sans">
            {/* Glassmorphic Background Effects */}
            <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-violet-600/10 blur-[150px] mix-blend-screen pointer-events-none" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-fuchsia-600/10 blur-[120px] mix-blend-screen pointer-events-none" />

            <div className="relative z-10">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold tracking-tight">Admissions Pipeline</h1>
                    <p className="text-violet-200/60 mt-2">Fully functional Drag-and-Drop Applicant Tracking Kanban Board.</p>
                </div>
                
                <div className="flex gap-6 overflow-x-auto pb-8 h-[calc(100vh-200px)]">
                    {columns.map(status => {
                        const colTasks = tasks.filter(t => t.status === status);
                        return (
                            <div 
                                key={status}
                                className="flex-shrink-0 w-80 bg-white/[0.02] border border-white/10 rounded-2xl p-4 flex flex-col backdrop-blur-md shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-colors duration-300 hover:bg-white/[0.04]"
                                onDragOver={(e) => onDragOver(e)}
                                onDrop={(e) => onDrop(e, status)}
                            >
                                <div className="flex justify-between items-center mb-4 px-2">
                                    <h3 className="font-bold text-violet-300 uppercase tracking-wider text-sm">{status}</h3>
                                    <span className="bg-white/10 text-white text-xs px-2.5 py-1 rounded-full font-bold">{colTasks.length}</span>
                                </div>
                                
                                <div className="flex-1 overflow-y-auto space-y-4 pr-2 scrollbar-thin scrollbar-thumb-white/10">
                                    {colTasks.map(t => (
                                        <div
                                            key={t.id}
                                            draggable
                                            onDragStart={(e) => onDragStart(e, t.id)}
                                            className="bg-black/40 border border-white/5 p-5 rounded-xl cursor-grab active:cursor-grabbing hover:border-violet-500/50 hover:bg-white/[0.05] transition-all shadow-lg group"
                                        >
                                            <div className="flex justify-between items-start mb-3">
                                                <h4 className="font-bold text-white text-sm group-hover:text-violet-200 transition-colors">{t.name}</h4>
                                                <span className="text-[10px] bg-violet-500/20 text-violet-300 px-2.5 py-1 rounded font-mono font-bold tracking-wider">{t.id}</span>
                                            </div>
                                            <p className="text-xs text-violet-200/60 mb-4">{t.email}</p>
                                            <div className="flex gap-2">
                                                <span className="text-[10px] bg-fuchsia-500/10 border border-fuchsia-500/20 px-2.5 py-1 rounded text-fuchsia-300 font-medium">
                                                    {t.department}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
