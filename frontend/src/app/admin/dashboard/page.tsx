import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ADMINS, STUDENTS, FACULTY } from "@/lib/syntheticData";

export default function AdminDashboard() {
    return (
        <div className="p-8 space-y-6 text-white min-h-screen bg-[#050014]">
            <h1 className="text-3xl font-bold tracking-tight">Admin Workspace</h1>
            <p className="text-violet-200">Welcome back, {ADMINS[0].name} - {ADMINS[0].role}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
                    <CardHeader><CardTitle className="text-violet-300">Total Students</CardTitle></CardHeader>
                    <CardContent className="text-4xl font-bold text-white">{STUDENTS.length}</CardContent>
                </Card>
                <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
                    <CardHeader><CardTitle className="text-fuchsia-300">Active Faculty</CardTitle></CardHeader>
                    <CardContent className="text-4xl font-bold text-white">{FACULTY.length}</CardContent>
                </Card>
            </div>
            
            <div className="mt-8">
                <h2 className="text-xl font-semibold mb-4 text-white">Recent Student Enrollments</h2>
                <div className="space-y-4">
                    {STUDENTS.slice(0, 5).map(s => (
                        <div key={s.id} className="p-4 bg-white/5 border border-white/10 rounded-xl flex justify-between items-center">
                            <div>
                                <p className="font-bold text-white">{s.name}</p>
                                <p className="text-sm text-violet-300">{s.email}</p>
                            </div>
                            <span className="px-3 py-1 bg-fuchsia-500/20 text-fuchsia-300 rounded-full text-xs font-semibold">{s.department}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
