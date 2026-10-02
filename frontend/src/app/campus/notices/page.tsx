"use client";
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, Pin, CheckCircle2, Eye, ShieldAlert } from "lucide-react";

const INITIAL_NOTICES = [
    { id: 'N1', title: 'Mandatory Anti-Ragging Affidavit', content: 'All students must submit the signed cryptographic affidavit by Friday. Failure to comply will result in a temporary portal lock.', isPinned: true, isMandatory: true, acknowledged: false, analytics: '82%' },
    { id: 'N2', title: 'Hostel Maintenance Schedule', content: 'Water supply will be interrupted in Block A tomorrow between 2-4 PM for physical plumbing upgrades.', isPinned: false, isMandatory: false, acknowledged: false, analytics: '45%' }
];

export default function InteractiveNoticeBoard() {
    const [notices, setNotices] = useState(INITIAL_NOTICES);

    const handleAcknowledge = (id: string) => {
        // Trigger TanStack Query mutation to write securely to `social.enotice_receipts` table
        setNotices(notices.map(n => n.id === id ? { ...n, acknowledged: true } : n));
    };

    return (
        <div className="min-h-screen bg-[#0a0f1c] text-white p-8 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-rose-900/10 via-[#0a0f1c] to-[#0a0f1c]">
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="flex items-center gap-3 border-b border-white/10 pb-6">
                    <div className="p-3 bg-rose-500/20 rounded-xl">
                        <Bell className="w-8 h-8 text-rose-400" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-white">E-Notice Board</h1>
                        <p className="text-slate-400 mt-1">Official institutional directives targeted mathematically to your cohort.</p>
                    </div>
                </div>

                <div className="space-y-4">
                    {/* Sort by Pinned First */}
                    {notices.sort((a, b) => (a.isPinned === b.isPinned ? 0 : a.isPinned ? -1 : 1)).map((notice) => (
                        <Card key={notice.id} className={`relative overflow-hidden transition-all border ${notice.isPinned ? 'bg-gradient-to-r from-rose-950/40 to-black border-rose-900/50' : 'bg-white/5 border-white/10'}`}>
                            
                            {/* Red edge pulse for Unread Mandatory Directives */}
                            {notice.isMandatory && !notice.acknowledged && (
                                <div className="absolute top-0 left-0 w-1 h-full bg-rose-500 animate-pulse" />
                            )}
                            
                            <CardContent className="p-6">
                                <div className="flex justify-between items-start gap-4 flex-col md:flex-row">
                                    <div className="flex-1 space-y-2">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            {notice.isPinned && <Pin className="w-4 h-4 text-rose-400 fill-rose-400/20" />}
                                            <h3 className="text-xl font-bold text-slate-100">{notice.title}</h3>
                                            {notice.isMandatory && <Badge variant="destructive" className="bg-rose-500/20 text-rose-300 border border-rose-500/50">Mandatory Action</Badge>}
                                        </div>
                                        <p className="text-slate-300 leading-relaxed pr-8">{notice.content}</p>
                                    </div>

                                    {/* Action & Administrative Analytics Area */}
                                    <div className="flex flex-col items-start md:items-end gap-3 min-w-[140px] w-full md:w-auto mt-4 md:mt-0">
                                        {notice.acknowledged ? (
                                            <div className="flex items-center text-emerald-400 bg-emerald-950/30 px-4 py-2 rounded-lg border border-emerald-900/50 w-full justify-center">
                                                <CheckCircle2 className="w-4 h-4 mr-2" /> Acknowledged
                                            </div>
                                        ) : (
                                            <Button 
                                                onClick={() => handleAcknowledge(notice.id)}
                                                className={`w-full ${notice.isMandatory ? 'bg-rose-600 hover:bg-rose-700 shadow-lg shadow-rose-600/20' : 'bg-white/10 hover:bg-white/20'} text-white border-0`}
                                            >
                                                {notice.isMandatory ? 'Acknowledge Now' : 'Mark as Read'}
                                            </Button>
                                        )}
                                        
                                        {/* In production, this block is only visible to the Admin who issued the notice */}
                                        <div className="flex items-center text-xs text-slate-500 bg-black/40 px-2 py-1 rounded w-full md:w-auto justify-center">
                                            <Eye className="w-3 h-3 mr-1" /> {notice.analytics} read
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}
