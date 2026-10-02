"use client";
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, CheckCircle2, Clock, Users, XCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { motion } from "framer-motion";

const MOCK_COURSES = [
    { id: 'CS401', title: 'Advanced Machine Learning', type: 'Core Elective', credits: 4, seats: 2, totalSeats: 60, waitlist: 0, conflict: false, prereqMet: true },
    { id: 'CS405', title: 'Quantum Computing', type: 'Open Elective', credits: 3, seats: 0, totalSeats: 40, waitlist: 12, conflict: true, prereqMet: true, conflictReason: "Overlaps with CS401 (Tue/Thu 10:00 AM)" },
    { id: 'CS410', title: 'Blockchain Architecture', type: 'Open Elective', credits: 3, seats: 15, totalSeats: 50, waitlist: 0, conflict: false, prereqMet: false, prereqReason: "Requires Cryptography (CS302)" },
];

export default function CBCSRegistrationPortal() {
    const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
    const maxCredits = 24;
    const currentCredits = selectedCourses.reduce((acc, id) => {
        const c = MOCK_COURSES.find(c => c.id === id);
        return acc + (c ? c.credits : 0);
    }, 0);

    const handleToggleCourse = (course: any) => {
        if (!course.prereqMet) return;
        
        if (selectedCourses.includes(course.id)) {
            setSelectedCourses(selectedCourses.filter(id => id !== course.id));
        } else {
            if (currentCredits + course.credits > maxCredits) return;
            setSelectedCourses([...selectedCourses, course.id]);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0f1c] text-white p-8 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-indigo-900/10 via-[#0a0f1c] to-[#0a0f1c]">
            <div className="max-w-6xl mx-auto space-y-8">
                <div className="flex justify-between items-end border-b border-white/10 pb-6">
                    <div>
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400">Choice-Based Credit System (CBCS)</h1>
                        <p className="text-slate-400 mt-2">Select your learning pathway for Fall Semester 2026.</p>
                    </div>
                    <div className="text-right">
                        <div className="text-sm text-slate-400 mb-2">Credit Utilization</div>
                        <div className="flex items-center space-x-4">
                            <Progress value={(currentCredits / maxCredits) * 100} className="w-48 h-3 bg-white/5" indicatorColor={currentCredits > 20 ? "bg-amber-400" : "bg-cyan-400"} />
                            <span className="font-bold text-xl">{currentCredits} / {maxCredits}</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {MOCK_COURSES.map((course) => {
                        const isSelected = selectedCourses.includes(course.id);
                        const isConflict = course.conflict && isSelected;
                        
                        return (
                            <motion.div whileHover={{ scale: 1.02 }} key={course.id}>
                                <Card className={`relative overflow-hidden h-full border ${isConflict ? 'border-red-500/50 bg-red-950/20' : isSelected ? 'border-cyan-500/50 bg-cyan-950/20' : 'border-white/10 bg-white/5 backdrop-blur-xl'}`}>
                                    {isConflict && (
                                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-rose-500 animate-pulse" />
                                    )}
                                    <CardHeader className="pb-4">
                                        <div className="flex justify-between items-start">
                                            <Badge variant="outline" className={`${isSelected ? 'border-cyan-400/50 text-cyan-300' : 'border-white/20 text-slate-300'}`}>
                                                {course.type}
                                            </Badge>
                                            <span className="font-mono text-sm text-slate-400">{course.id}</span>
                                        </div>
                                        <CardTitle className="text-xl mt-2 text-white">{course.title}</CardTitle>
                                        <CardDescription className="flex items-center text-slate-300 mt-2">
                                            <CheckCircle2 className="w-4 h-4 mr-1 text-cyan-400" /> {course.credits} Credits
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="flex justify-between items-center text-sm p-3 bg-black/20 rounded-lg">
                                            <div className="flex items-center text-slate-300">
                                                <Users className="w-4 h-4 mr-2 text-slate-400" />
                                                Seats: {course.seats}/{course.totalSeats}
                                            </div>
                                            {course.waitlist > 0 && (
                                                <div className="flex items-center text-amber-400">
                                                    <Clock className="w-4 h-4 mr-1" />
                                                    WL: {course.waitlist}
                                                </div>
                                            )}
                                        </div>

                                        {!course.prereqMet && (
                                            <Alert variant="destructive" className="bg-red-950/50 border-red-900/50 py-2">
                                                <XCircle className="h-4 w-4" />
                                                <AlertTitle className="text-xs font-semibold ml-2">Prerequisite Blocked</AlertTitle>
                                                <AlertDescription className="text-xs ml-2 mt-1">{course.prereqReason}</AlertDescription>
                                            </Alert>
                                        )}

                                        {isConflict && (
                                            <Alert variant="destructive" className="bg-red-950/50 border-red-900/50 py-2 animate-pulse">
                                                <AlertCircle className="h-4 w-4" />
                                                <AlertTitle className="text-xs font-semibold ml-2">Timetable Collision!</AlertTitle>
                                                <AlertDescription className="text-xs ml-2 mt-1">{course.conflictReason}</AlertDescription>
                                            </Alert>
                                        )}

                                        <Button 
                                            onClick={() => handleToggleCourse(course)}
                                            disabled={!course.prereqMet || (currentCredits + course.credits > maxCredits && !isSelected)}
                                            className={`w-full ${isSelected 
                                                ? 'bg-red-500/20 text-red-300 hover:bg-red-500/30' 
                                                : course.seats === 0 
                                                    ? 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30' 
                                                    : 'bg-cyan-500 hover:bg-cyan-600 text-white shadow-lg shadow-cyan-500/25'
                                            } border-0 transition-all`}
                                        >
                                            {isSelected ? 'Drop Course' : course.seats === 0 ? 'Join Waitlist' : 'Enroll'}
                                        </Button>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
