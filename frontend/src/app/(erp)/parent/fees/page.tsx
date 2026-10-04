"use client";

import React from 'react';
import { Banknote, CreditCard } from 'lucide-react';

export default function ParentFees() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto p-6 lg:p-8 font-sans text-white">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-50 flex items-center gap-3 mb-2">
            <Banknote className="w-7 h-7 text-indigo-400"/> Fee Payments
          </h1>
          <p className="text-slate-400 text-sm">View fee demand and pay online securely.</p>
        </div>
      </div>

      <div className="bg-[#221F32]/80 backdrop-blur rounded-2xl border border-white/10 shadow-lg overflow-hidden">
        <div className="p-6 border-b border-white/10 bg-black/20">
            <h2 className="text-lg font-bold text-slate-50">Pending Dues</h2>
        </div>
        <div className="p-6 flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
                <h4 className="text-slate-50 font-semibold text-lg">Tuition Fee - 2nd Installment</h4>
                <p className="text-sm text-amber-400 mt-1 font-bold">Due Date: 15 Oct 2026</p>
            </div>
            <div className="flex items-center gap-6">
                <span className="text-2xl font-bold text-slate-50">₹45,000</span>
                <button className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition shadow-[0_4px_14px_0_rgba(16,185,129,0.39)] flex items-center gap-2">
                    <CreditCard className="w-4 h-4"/> Pay Online
                </button>
            </div>
        </div>
      </div>
    </div>
  );
}
