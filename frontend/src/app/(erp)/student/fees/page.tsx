"use client";

import React from 'react';
import { Banknote, Download, CreditCard, CheckCircle2, AlertCircle } from "lucide-react";

export default function FeesPage() {
    const feeRecords = [
        { id: "TUI-2026-01", head: "Tuition Fee - Sem 5", amount: "₹45,000", status: "Paid", date: "22 Aug 2026" },
        { id: "JNTU-EX-05", head: "JNTUA Exam Fee - Reg", amount: "₹1,500", status: "Pending", date: "Due: 15 Oct 2026" },
        { id: "LIB-FINE-12", head: "Library Late Fine", amount: "₹150", status: "Pending", date: "Due: 20 Oct 2026" },
    ];

    return (
        <div className="space-y-8 max-w-7xl mx-auto p-6 lg:p-8 font-sans">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-50 flex items-center gap-3 mb-2">
                        <Banknote className="w-7 h-7 text-emerald-400"/> Fee Management & Ledger
                    </h1>
                    <p className="text-slate-400 text-sm">Track your tuition, exam fees, and download payment receipts.</p>
                </div>
                <button className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2 rounded-xl text-sm font-semibold transition shadow-[0_4px_14px_0_rgba(16,185,129,0.39)] flex items-center gap-2">
                    <CreditCard className="w-4 h-4" /> Pay Dues (₹1,650)
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-[#221F32]/80 backdrop-blur rounded-2xl p-6 border border-emerald-500/20 shadow-lg flex flex-col justify-center">
                    <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-1">Total Assessed (Year)</p>
                    <h3 className="text-3xl font-black text-slate-50">₹90,000</h3>
                </div>
                <div className="bg-[#221F32]/80 backdrop-blur rounded-2xl p-6 border border-emerald-500/20 shadow-lg flex flex-col justify-center">
                    <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-1">Total Paid</p>
                    <h3 className="text-3xl font-black text-emerald-400">₹45,000</h3>
                </div>
                <div className="bg-[#221F32]/80 backdrop-blur rounded-2xl p-6 border border-red-500/20 shadow-lg flex flex-col justify-center">
                    <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-1">Total Pending</p>
                    <h3 className="text-3xl font-black text-red-400">₹1,650</h3>
                </div>
            </div>

            <div className="bg-[#221F32]/80 backdrop-blur rounded-2xl border border-white/10 overflow-hidden shadow-lg">
                <div className="p-6 border-b border-white/10 bg-black/20">
                    <h2 className="text-lg font-bold text-slate-50">Transaction Ledger</h2>
                </div>
                <div className="divide-y divide-white/10">
                    {feeRecords.map((fee, i) => (
                        <div key={i} className="p-6 flex flex-col md:flex-row justify-between items-center gap-4 hover:bg-white/5 transition-colors">
                            <div className="flex items-center gap-4 w-full md:w-auto">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${fee.status === 'Paid' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                                    {fee.status === 'Paid' ? <CheckCircle2 className="w-5 h-5"/> : <AlertCircle className="w-5 h-5"/>}
                                </div>
                                <div>
                                    <h4 className="text-slate-50 font-semibold">{fee.head}</h4>
                                    <p className="text-xs text-slate-400 mt-0.5">Ref: {fee.id} • {fee.date}</p>
                                </div>
                            </div>
                            
                            <div className="flex items-center justify-between w-full md:w-auto gap-6 border-t border-white/10 md:border-t-0 pt-4 md:pt-0">
                                <span className="text-lg font-bold text-slate-50">{fee.amount}</span>
                                {fee.status === 'Paid' ? (
                                    <button className="text-slate-400 hover:text-indigo-400 flex items-center gap-2 text-sm font-medium transition-colors">
                                        <Download className="w-4 h-4"/> Receipt
                                    </button>
                                ) : (
                                    <button className="bg-white/10 hover:bg-white/20 text-slate-50 px-4 py-1.5 rounded-lg text-sm font-semibold transition">
                                        Pay Now
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
