"use client";
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Briefcase, GraduationCap, XCircle, CheckCircle2, Filter } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Simulated Live Data from the ERP Backend
const STUDENT_METRICS = { 
    cgpa: 7.2, 
    activeBacklogs: 1, 
    branch: 'CSE',
    tier: 'Tier 2'
};

const PLACEMENT_DRIVES = [
    { id: 'DRV-001', company: 'Google', role: 'Software Engineer', type: 'Full-Time (Super Dream)', ctc: '32 LPA', reqCgpa: 8.5, maxBacklogs: 0, allowedBranches: ['CSE', 'IT'] },
    { id: 'DRV-002', company: 'TCS Digital', role: 'Systems Engineer', type: 'Full-Time (Dream)', ctc: '7.5 LPA', reqCgpa: 6.5, maxBacklogs: 2, allowedBranches: ['CSE', 'IT', 'ECE', 'MECH'] },
    { id: 'DRV-003', company: 'Stripe', role: 'Backend Intern', type: 'Summer Internship', stipend: '1L / month', reqCgpa: 8.0, maxBacklogs: 0, allowedBranches: ['CSE'] },
];

export default function StudentOpportunityBoard() {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredDrives = useMemo(() => {
        return PLACEMENT_DRIVES.filter(d => 
            d.company.toLowerCase().includes(searchQuery.toLowerCase()) || 
            d.role.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [searchQuery]);

    const checkEligibility = (drive: any) => {
        let reasons = [];
        if (STUDENT_METRICS.cgpa < drive.reqCgpa) reasons.push(`CGPA (${STUDENT_METRICS.cgpa}) is below required ${drive.reqCgpa}`);
        if (STUDENT_METRICS.activeBacklogs > drive.maxBacklogs) reasons.push(`Active Backlogs (${STUDENT_METRICS.activeBacklogs}) exceed limit of ${drive.maxBacklogs}`);
        if (!drive.allowedBranches.includes(STUDENT_METRICS.branch)) reasons.push(`Branch ${STUDENT_METRICS.branch} is not eligible`);
        
        return { isEligible: reasons.length === 0, reasons };
    };

    return (
        <div className="min-h-screen bg-[#0a0f1c] text-white p-8 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-indigo-900/10 via-[#0a0f1c] to-[#0a0f1c]">
            <div className="max-w-7xl mx-auto space-y-8">
                
                {/* Header & Metrics Dashboard */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-white/10 pb-6 gap-6">
                    <div>
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400">Corporate Opportunity Board</h1>
                        <p className="text-slate-400 mt-2">Discover and apply for campus drives dynamically matched to your academic profile.</p>
                    </div>
                    <div className="flex gap-4 p-4 bg-white/5 rounded-xl border border-white/10 backdrop-blur-md">
                        <div className="text-center px-4 border-r border-white/10">
                            <div className="text-sm text-slate-400">Live CGPA</div>
                            <div className="text-2xl font-bold text-blue-400">{STUDENT_METRICS.cgpa}</div>
                        </div>
                        <div className="text-center px-4">
                            <div className="text-sm text-slate-400">Active Arrears</div>
                            <div className={`text-2xl font-bold ${STUDENT_METRICS.activeBacklogs > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                                {STUDENT_METRICS.activeBacklogs}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search & Filter Bar */}
                <div className="flex gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                        <Input 
                            placeholder="Search by company or role..." 
                            className="pl-10 h-12 bg-black/40 border-white/10 text-white focus:ring-blue-500"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Button variant="outline" className="h-12 px-6 border-white/20 bg-white/5 hover:bg-white/10 text-slate-200">
                        <Filter className="w-4 h-4 mr-2" /> Filters
                    </Button>
                </div>

                {/* Drives Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <AnimatePresence>
                        {filteredDrives.map((drive) => {
                            const { isEligible, reasons } = checkEligibility(drive);
                            
                            return (
                                <motion.div 
                                    key={drive.id}
                                    layout
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                >
                                    <Card className={`relative overflow-hidden h-full border ${isEligible ? 'border-blue-500/30 bg-blue-950/10' : 'border-white/5 bg-black/40'} backdrop-blur-xl transition-all`}>
                                        <CardHeader>
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <CardTitle className="text-2xl font-bold text-white flex items-center gap-2">
                                                        {drive.company}
                                                        {isEligible && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                                                    </CardTitle>
                                                    <CardDescription className="text-blue-300 font-medium text-lg mt-1">{drive.role}</CardDescription>
                                                </div>
                                                <Badge className="bg-white/10 text-slate-300 border-0 py-1 px-3 text-sm">{drive.type}</Badge>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="space-y-6">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="bg-black/30 p-3 rounded-lg border border-white/5 flex items-center gap-3">
                                                    <Briefcase className="w-5 h-5 text-slate-400" />
                                                    <div>
                                                        <div className="text-xs text-slate-500">Compensation</div>
                                                        <div className="font-semibold text-slate-200">{drive.ctc || drive.stipend}</div>
                                                    </div>
                                                </div>
                                                <div className="bg-black/30 p-3 rounded-lg border border-white/5 flex items-center gap-3">
                                                    <GraduationCap className="w-5 h-5 text-slate-400" />
                                                    <div>
                                                        <div className="text-xs text-slate-500">Criteria</div>
                                                        <div className="font-semibold text-slate-200">>{drive.reqCgpa} CGPA | Max {drive.maxBacklogs} BL</div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Dynamic Eligibility Engine UI */}
                                            {!isEligible ? (
                                                <div className="bg-rose-950/30 border border-rose-900/50 rounded-lg p-4 space-y-2">
                                                    <div className="flex items-center text-rose-400 font-medium text-sm">
                                                        <XCircle className="w-4 h-4 mr-2" /> Application Blocked by Automation
                                                    </div>
                                                    <ul className="list-disc list-inside text-xs text-slate-400 space-y-1 ml-6">
                                                        {reasons.map((reason, idx) => (
                                                            <li key={idx}>{reason}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            ) : (
                                                <Button className="w-full h-12 bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20 text-white font-semibold text-lg border-0 transition-transform active:scale-95">
                                                    Apply Now
                                                </Button>
                                            )}
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
