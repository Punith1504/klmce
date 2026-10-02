"use client";
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, CheckCircle2, XCircle, User, ChevronRight, Download, Eye } from "lucide-react";
// Note: In production, import { Document, Page } from 'react-pdf';

const MOCK_CANDIDATES = [
    { id: 'APP-101', name: 'Arjun Sharma', branch: 'CSE', cgpa: 9.1, status: 'HR Round', resumeUrl: '/resumes/arjun.pdf' },
    { id: 'APP-102', name: 'Priya Patel', branch: 'IT', cgpa: 8.8, status: 'Technical Round', resumeUrl: '/resumes/priya.pdf' },
    { id: 'APP-103', name: 'Rahul Gupta', branch: 'CSE', cgpa: 8.5, status: 'Applied', resumeUrl: '/resumes/rahul.pdf' },
];

export default function PlacementAdminDashboard({ params }: { params: { drive_id: string } }) {
    const [selectedCandidate, setSelectedCandidate] = useState(MOCK_CANDIDATES[0]);

    return (
        <div className="h-screen bg-[#0a0f1c] text-white flex overflow-hidden">
            
            {/* Left Sidebar: Application Tracking List */}
            <div className="w-1/3 bg-[#13192b] border-r border-white/10 flex flex-col h-full shrink-0">
                <div className="p-6 border-b border-white/10">
                    <h1 className="text-xl font-bold text-white">Google - Software Engineer</h1>
                    <p className="text-sm text-slate-400 mt-1">Drive ID: {params.drive_id || 'DRV-001'}</p>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {MOCK_CANDIDATES.map((candidate) => (
                        <Card 
                            key={candidate.id} 
                            onClick={() => setSelectedCandidate(candidate)}
                            className={`cursor-pointer transition-all border ${selectedCandidate.id === candidate.id ? 'bg-blue-900/20 border-blue-500/50' : 'bg-black/20 border-white/5 hover:bg-white/5'}`}
                        >
                            <CardContent className="p-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
                                        <User className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-slate-200">{candidate.name}</h3>
                                        <div className="flex gap-2 mt-1">
                                            <Badge variant="outline" className="text-[10px] bg-black/40 border-white/10">{candidate.branch}</Badge>
                                            <Badge variant="outline" className="text-[10px] bg-black/40 border-white/10">{candidate.cgpa} CGPA</Badge>
                                        </div>
                                    </div>
                                </div>
                                <ChevronRight className="w-5 h-5 text-slate-600" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Right Pane: Unified Recruiter Dashboard & Resume Previewer */}
            <div className="flex-1 flex flex-col h-full bg-[#0a0f1c]">
                
                {/* Candidate Action Header */}
                <div className="h-24 px-8 border-b border-white/10 flex items-center justify-between bg-black/20 shrink-0">
                    <div>
                        <h2 className="text-2xl font-bold text-white">{selectedCandidate.name}</h2>
                        <div className="flex items-center gap-2 mt-2 text-sm text-slate-400">
                            <span>Current Stage:</span>
                            <Badge className="bg-blue-500/20 text-blue-300 border-0">{selectedCandidate.status}</Badge>
                        </div>
                    </div>
                    
                    <div className="flex gap-3">
                        <Button variant="outline" className="border-rose-500/30 text-rose-400 hover:bg-rose-500/10">
                            <XCircle className="w-4 h-4 mr-2" /> Reject
                        </Button>
                        <Button className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20 border-0">
                            <CheckCircle2 className="w-4 h-4 mr-2" /> Advance to Next Round
                        </Button>
                    </div>
                </div>

                {/* React-PDF Resume Viewer Container */}
                <div className="flex-1 p-8 overflow-hidden flex flex-col">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-semibold text-slate-300 flex items-center gap-2">
                            <FileText className="w-5 h-5" /> Resume Preview
                        </h3>
                        <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                            <Download className="w-4 h-4 mr-2" /> Download Original PDF
                        </Button>
                    </div>
                    
                    {/* Simulated react-pdf Canvas Workspace */}
                    <div className="flex-1 w-full bg-[#13192b] border border-white/10 rounded-xl flex items-center justify-center overflow-hidden shadow-2xl">
                        {/* In production, <Document file={selectedCandidate.resumeUrl}><Page pageNumber={1} /></Document> goes here */}
                        <div className="text-center">
                            <Eye className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                            <p className="text-slate-400 font-medium">Native PDF Previewer Active</p>
                            <p className="text-xs text-slate-500 mt-2">Displaying 1536-dimensional vectorized CV for {selectedCandidate.name}</p>
                            <div className="mt-8 w-64 h-80 bg-white/5 rounded mx-auto border border-white/10 animate-pulse flex items-center justify-center">
                                <span className="text-slate-600 text-sm">PDF Render Canvas</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
