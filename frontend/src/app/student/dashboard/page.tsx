import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { STUDENTS } from "@/lib/syntheticData";

export default function StudentDashboard() {
    const me = STUDENTS[0];
    return (
        <div className="p-8 space-y-6 text-white min-h-screen bg-[#050014] relative overflow-hidden">
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-violet-600/30 blur-[120px] mix-blend-screen pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-fuchsia-600/20 blur-[120px] mix-blend-screen pointer-events-none" />

            <div className="relative z-10">
                <h1 className="text-3xl font-bold tracking-tight">Student Portal</h1>
                <p className="text-violet-200">Welcome back, {me.name} ({me.id})</p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                    <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
                        <CardHeader><CardTitle className="text-fuchsia-300">Current CGPA</CardTitle></CardHeader>
                        <CardContent className="text-5xl font-bold text-white">{me.cgpa}</CardContent>
                    </Card>
                    <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
                        <CardHeader><CardTitle className="text-violet-300">Department</CardTitle></CardHeader>
                        <CardContent className="text-xl font-bold text-white">{me.department}</CardContent>
                    </Card>
                    <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
                        <CardHeader><CardTitle className="text-blue-300">Attendance</CardTitle></CardHeader>
                        <CardContent className="text-5xl font-bold text-white">{me.attendance_pct}%</CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
