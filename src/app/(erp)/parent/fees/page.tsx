"use client";

import React, { useState } from 'react';
import { Banknote, CheckCircle2, ArrowLeft, Download, CreditCard, ShieldCheck, QrCode } from 'lucide-react';
import Link from 'next/link';
import { STUDENTS } from '@/lib/syntheticData';

export default function ParentFeesPage() {
  const ward = STUDENTS[0];
  const [showPayModal, setShowPayModal] = useState(false);
  const [selectedFee, setSelectedFee] = useState<any>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const feeLedger = [
    {
      id: "FEE-2026-001",
      title: "Tuition Fee - Year 4 (Academic Year 2026-27)",
      category: "TUITION",
      amount: 65000,
      paidAmount: 65000,
      dueDate: "15-Aug-2026",
      status: "PAID",
      receiptNo: "REC-SBI-98214",
      paymentDate: "12-Aug-2026",
      method: "SBI NetBanking (State Bank of India KSRM Branch)"
    },
    {
      id: "FEE-2026-002",
      title: "JNTUA End Semester Regular Examination Fee (Sem 7)",
      category: "EXAMINATION",
      amount: 1750,
      paidAmount: 1750,
      dueDate: "15-Oct-2026",
      status: "PAID",
      receiptNo: "REC-EXAM-44120",
      paymentDate: "05-Oct-2026",
      method: "PhonePe UPI"
    },
    {
      id: "FEE-2026-003",
      title: "Rani Chennamma Ladies Hostel - Mess & Room Charges (Term 2)",
      category: "HOSTEL",
      amount: 32000,
      paidAmount: 32000,
      dueDate: "01-Nov-2026",
      status: "PAID",
      receiptNo: "REC-HST-11093",
      paymentDate: "28-Sep-2026",
      method: "Google Pay UPI"
    },
    {
      id: "FEE-2026-004",
      title: "Campus Placement Training & TCS Certification Fee",
      category: "TRAINING",
      amount: 4500,
      paidAmount: 0,
      dueDate: "25-Oct-2026",
      status: "PENDING",
      receiptNo: "Pending",
      paymentDate: "-",
      method: "-"
    }
  ];

  const handlePay = (fee: any) => {
    setSelectedFee(fee);
    setShowPayModal(true);
    setPaymentSuccess(false);
  };

  const handleCompletePayment = () => {
    setPaymentSuccess(true);
    setTimeout(() => {
      setShowPayModal(false);
      alert(`Payment of ₹${selectedFee.amount} successfully processed! Receipt generated.`);
    }, 1500);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 font-sans text-white">
      {/* Breadcrumb Header */}
      <div className="flex items-center gap-3">
        <Link href="/parent/dashboard" className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Banknote className="w-6 h-6 text-indigo-400" /> College Fee Ledgers & Payments
          </h1>
          <p className="text-xs text-slate-400">
            Institutional fee records for {ward.name} ({ward.rollNo}) • Bank Account: SBI KSRM Campus Branch
          </p>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#1f1b30]/80 rounded-2xl p-6 border border-white/10 shadow-lg">
          <p className="text-xs text-slate-400 uppercase font-semibold">Total Paid (Year 2026)</p>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold text-emerald-400">₹98,750</span>
          </div>
          <p className="text-xs text-slate-500 mt-2">Tuition, JNTUA Exams & Rani Chennamma Hostel</p>
        </div>

        <div className="bg-[#1f1b30]/80 rounded-2xl p-6 border border-white/10 shadow-lg">
          <p className="text-xs text-slate-400 uppercase font-semibold">Current Outstanding Dues</p>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold text-amber-400">₹4,500</span>
            <span className="text-xs text-amber-300 font-medium">Due by Oct 25</span>
          </div>
          <p className="text-xs text-slate-500 mt-2">Special Placement Training & Mock Drives</p>
        </div>

        <div className="bg-[#1f1b30]/80 rounded-2xl p-6 border border-white/10 shadow-lg">
          <p className="text-xs text-slate-400 uppercase font-semibold">AP Govt Scholarship (JVD)</p>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-bold text-sky-400">₹35,000</span>
            <span className="text-xs text-sky-300">Sanctioned</span>
          </div>
          <p className="text-xs text-slate-500 mt-2">Jagananna Vidya Deevena DBT credit reconciled</p>
        </div>
      </div>

      {/* Fee Table */}
      <div className="bg-[#1f1b30]/80 rounded-3xl border border-white/10 p-6 shadow-xl space-y-4">
        <div className="flex justify-between items-center border-b border-white/10 pb-4">
          <h2 className="text-lg font-bold text-white">Institutional Fee Items</h2>
          <span className="text-xs text-slate-400">Ref: YSR Kadapa District Treasury</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-xs uppercase text-slate-400 border-b border-white/10">
                <th className="pb-3 px-4">Fee Item</th>
                <th className="pb-3 px-4">Category</th>
                <th className="pb-3 px-4">Amount</th>
                <th className="pb-3 px-4">Due Date</th>
                <th className="pb-3 px-4">Status</th>
                <th className="pb-3 px-4 text-right">Receipt / Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm">
              {feeLedger.map((fee) => (
                <tr key={fee.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-4 px-4">
                    <p className="font-semibold text-slate-100">{fee.title}</p>
                    <p className="text-xs text-slate-500 font-mono mt-0.5">{fee.id}</p>
                  </td>
                  <td className="py-4 px-4">
                    <span className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-xs font-mono text-slate-300">
                      {fee.category}
                    </span>
                  </td>
                  <td className="py-4 px-4 font-bold text-slate-100">₹{fee.amount.toLocaleString()}</td>
                  <td className="py-4 px-4 text-xs text-slate-400">{fee.dueDate}</td>
                  <td className="py-4 px-4">
                    {fee.status === 'PAID' ? (
                      <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> PAID
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold inline-flex items-center gap-1">
                        PENDING
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-4 text-right">
                    {fee.status === 'PAID' ? (
                      <button
                        onClick={() => alert(`Downloading official stamped receipt ${fee.receiptNo} for ₹${fee.amount}...`)}
                        className="inline-flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
                      >
                        <Download className="w-3.5 h-3.5" /> Stamped Receipt
                      </button>
                    ) : (
                      <button
                        onClick={() => handlePay(fee)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition-colors"
                      >
                        <CreditCard className="w-3.5 h-3.5" /> Pay Online
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Online Payment Modal */}
      {showPayModal && selectedFee && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-[#19152b] border-t sm:border border-white/15 rounded-t-3xl sm:rounded-3xl p-5 sm:p-8 max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl relative text-left pb-8 sm:pb-8">
            <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-4 sm:hidden" />
            <h3 className="text-xl font-bold text-white mb-1">Instant Online Payment</h3>
            <p className="text-xs text-slate-400 mb-6">KLMCE Merchant Account • SBI Kadapa Branch</p>

            <div className="bg-black/30 p-4 rounded-2xl border border-white/10 mb-6 space-y-2">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Fee Item:</span>
                <span className="text-white font-medium">{selectedFee.title}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-400">
                <span>Ward Roll No:</span>
                <span className="text-white font-mono">{ward.rollNo}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-white/10">
                <span>Payable Amount:</span>
                <span className="text-emerald-400 font-mono text-base">₹{selectedFee.amount.toLocaleString()}</span>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <p className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Select Payment Method</p>
              <div className="grid grid-cols-2 gap-3">
                <button className="p-3 rounded-xl bg-indigo-600/20 border border-indigo-500/40 text-left text-xs font-bold text-white flex items-center gap-2">
                  <QrCode className="w-4 h-4 text-indigo-400" /> UPI / QR
                </button>
                <button className="p-3 rounded-xl bg-white/5 border border-white/10 text-left text-xs font-medium text-slate-300 flex items-center gap-2">
                  <Banknote className="w-4 h-4 text-emerald-400" /> SBI NetBanking
                </button>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowPayModal(false)}
                className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCompletePayment}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-lg"
              >
                {paymentSuccess ? "Processing..." : `Confirm ₹${selectedFee.amount}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
