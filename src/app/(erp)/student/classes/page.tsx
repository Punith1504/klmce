"use client";
import React, { useState } from 'react';
import { Calendar, Clock, MapPin, User, Hash, GraduationCap, Video } from "lucide-react";

export default function StudentClassesPage() {
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
    const [activeDay, setActiveDay] = useState("Wednesday"); // Default to Wednesday for mock

    // Mock Timetable Data
    const scheduleData: Record<string, any[]> = {
        "Wednesday": [
            {
                id: 1,
                time: "09:00 AM - 10:30 AM",
                subject: "Data Structures & Algorithms",
                code: "CS201",
                location: "Block C - Room 201",
                faculty: "Prof. Alan Turing",
                type: "Lecture",
                isOnline: false
            },
            {
                id: 2,
                time: "11:00 AM - 01:00 PM",
                subject: "Web Technologies",
                code: "CS205",
                location: "Block A - Computer Lab 4",
                faculty: "Dr. Ada Lovelace",
                type: "Practical",
                isOnline: false
            },
            {
                id: 3,
                time: "02:00 PM - 03:00 PM",
                subject: "Linear Algebra",
                code: "MA201",
                location: "Block B - Room 105",
                faculty: "Dr. John von Neumann",
                type: "Lecture",
                isOnline: false
            },
            {
                id: 4,
                time: "03:15 PM - 04:15 PM",
                subject: "Career Skills & Aptitude",
                code: "HS202",
                location: "Virtual Classroom",
                faculty: "Prof. Grace Hopper",
                type: "Workshop",
                isOnline: true
            }
        ],
        "Thursday": [
            {
                id: 5,
                time: "09:00 AM - 11:00 AM",
                subject: "Database Management Systems",
                code: "CS301",
                location: "Block C - Room 204",
                faculty: "Dr. Edgar Codd",
                type: "Lecture",
                isOnline: false
            }
        ]
    };

    const currentClasses = scheduleData[activeDay] || [];

    return (
        <div className="space-y-8 max-w-7xl mx-auto p-6 lg:p-8 font-sans">
            
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-slate-50 flex items-center gap-3 mb-2">
                    <Calendar className="w-8 h-8 text-fuchsia-400"/> My Class Schedule
                </h1>
                <p className="text-slate-400 text-sm">View your personalized timetable, locations, and faculty assignments.</p>
            </div>

            {/* Day Selector (Horizontal Scroll) */}
            <div className="flex overflow-x-auto gap-3 pb-4 scrollbar-hide border-b border-white/10">
                {days.map((day) => (
                    <button 
                        key={day} 
                        onClick={() => setActiveDay(day)}
                        className={`px-6 py-3 rounded-xl text-sm font-bold transition-all shrink-0 ${
                            activeDay === day 
                                ? "bg-fuchsia-600 text-white shadow-[0_4px_20px_0_rgba(192,38,211,0.4)]" 
                                : "bg-white/5 border border-white/10 text-slate-400 hover:text-slate-200 hover:bg-white/10"
                        }`}
                    >
                        {day}
                    </button>
                ))}
            </div>

            {/* Schedule Timeline Grid */}
            <div className="space-y-6">
                {currentClasses.length > 0 ? (
                    currentClasses.map((cls) => (
                        <div key={cls.id} className="bg-[#221F32]/80 backdrop-blur-md rounded-3xl p-6 border border-white/10 shadow-xl flex flex-col md:flex-row gap-6 relative overflow-hidden group hover:border-fuchsia-500/50 transition-colors">
                            
                            {/* Decorative Glow */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-fuchsia-500/10 rounded-full blur-3xl pointer-events-none -mr-10 -mt-10"></div>

                            {/* Left: Time & Type Block */}
                            <div className="md:w-48 shrink-0 flex flex-col justify-center border-b md:border-b-0 md:border-r border-white/10 pb-4 md:pb-0 md:pr-6">
                                <div className="text-fuchsia-400 font-bold text-lg leading-tight">{cls.time.split('-')[0].trim()}</div>
                                <div className="text-slate-500 text-sm font-medium mb-3">to {cls.time.split('-')[1].trim()}</div>
                                <span className={`self-start px-3 py-1 rounded-full text-xs font-bold border ${
                                    cls.type === 'Practical' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                    cls.type === 'Lecture' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' :
                                    'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                }`}>
                                    {cls.type.toUpperCase()}
                                </span>
                            </div>

                            {/* Middle: Subject Details */}
                            <div className="flex-1 space-y-4">
                                <div>
                                    <h2 className="text-2xl font-bold text-slate-50 tracking-tight group-hover:text-fuchsia-200 transition-colors">{cls.subject}</h2>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Hash className="w-4 h-4 text-slate-500" />
                                        <span className="text-sm font-medium text-slate-400 tracking-wider">{cls.code}</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="flex items-center gap-3 bg-black/20 p-3 rounded-xl border border-white/5">
                                        <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                                            <User className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Faculty</p>
                                            <p className="text-sm text-slate-200 font-medium">{cls.faculty}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 bg-black/20 p-3 rounded-xl border border-white/5">
                                        <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                                            {cls.isOnline ? <Video className="w-4 h-4" /> : <MapPin className="w-4 h-4" />}
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Location</p>
                                            <p className="text-sm text-slate-200 font-medium">{cls.location}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Action */}
                            {cls.isOnline && (
                                <div className="md:w-32 flex flex-col justify-center items-end shrink-0">
                                    <button className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-xl text-sm font-bold shadow-[0_4px_14px_0_rgba(16,185,129,0.39)] transition-colors flex items-center justify-center gap-2">
                                        Join Link
                                    </button>
                                </div>
                            )}

                        </div>
                    ))
                ) : (
                    <div className="py-20 text-center bg-white/[0.02] border border-dashed border-white/10 rounded-3xl">
                        <GraduationCap className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-slate-300">No classes scheduled</h3>
                        <p className="text-slate-500 mt-2">You have a free day today. Use it to catch up on assignments!</p>
                    </div>
                )}
            </div>

        </div>
    );
}
