"use client";

import React, { useState } from 'react';
import { FileSignature, Send, Clock, CheckCircle2, XCircle } from "lucide-react";

export default function RequestsPage() {
    const [activeTab, setActiveTab] = useState("Certificates");

    const requests = [
        { id: "REQ-001", type: "Bonafide Certificate", date: "20 Sep 2026", status: "Approved" },
        { id: "REQ-002", type: "Placement OD Leave", date: "02 Oct 2026", status: "Pending" },
        { id: "REQ-003", type: "Transport Grievance", date: "15 Aug 2026", status: "Resolved" },
    ];

    return (
        <div className="space-y-8 max-w-7xl mx-auto p-6 lg:p-8 font-sans">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-50 flex items-center gap-3 mb-2">
                        <FileSignature className="w-7 h-7 text-indigo-400"/> Services & Requests
                    </h1>
                    <p className="text-slate-400 text-sm">Apply for certificates, leaves, ODs, and file grievances.</p>
                </div>
                <button className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-xl text-sm font-semibold transition shadow-[0_4px_14px_0_rgba(79,70,229,0.39)] flex items-center gap-2">
                    <Send className="w-4 h-4" /> New Request
                </button>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {["Certificates", "Leave & OD", "Grievances", "Bus Pass"].map(type => (
                    <button 
                        key={type}
                        onClick={() => setActiveTab(type)}
                        className={`p-4 rounded-xl border text-sm font-bold transition-all ${
                            activeTab === type 
                                ? "bg-indigo-600/20 border-indigo-500/50 text-indigo-300" 
                                : "bg-[#221F32]/80 border-white/10 text-slate-400 hover:bg-white/5 hover:border-white/20"
                        }`}
                    >
                        {type}
                    </button>
                ))}
            </div>

            <div className="bg-[#221F32]/80 backdrop-blur rounded-2xl border border-white/10 overflow-hidden shadow-lg">
                <div className="p-6 border-b border-white/10 bg-black/20 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-slate-50">Recent Applications</h2>
                </div>
                <div className="divide-y divide-white/10">
                    {requests.map((req, i) => (
                        <div key={i} className="p-6 flex justify-between items-center hover:bg-white/5 transition-colors">
                            <div>
                                <h4 className="text-slate-50 font-semibold">{req.type}</h4>
                                <p className="text-xs text-slate-400 mt-1">ID: {req.id} • Applied on {req.date}</p>
                            </div>
                            
                            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border ${
                                req.status === 'Approved' || req.status === 'Resolved' 
                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                                    : req.status === 'Pending' 
                                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                        : 'bg-red-500/10 text-red-400 border-red-500/20'
                            }`}>
                                {req.status === 'Pending' ? <Clock className="w-3 h-3"/> : req.status === 'Approved' ? <CheckCircle2 className="w-3 h-3"/> : <XCircle className="w-3 h-3"/>}
                                {req.status}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
