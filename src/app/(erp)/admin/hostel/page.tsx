"use client";

import React, { useState } from 'react';
import { Building2, Users, Bed, Utensils, CheckCircle2, ShieldCheck, Phone } from 'lucide-react';
import { HOSTEL_BLOCKS, STUDENTS } from '@/lib/syntheticData';

export default function AdminHostelPage() {
  const [hostels] = useState(HOSTEL_BLOCKS);
  const [selectedBlock, setSelectedBlock] = useState(HOSTEL_BLOCKS[0]);

  const residents = STUDENTS.filter(s => s.hostelRoom);

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 font-sans text-white">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-50 flex items-center gap-3 mb-1">
            <Building2 className="w-8 h-8 text-indigo-400" /> Campus Hostel & Residential Administration
          </h1>
          <p className="text-slate-400 text-sm">
            Rani Chennamma, Sarojini Naidu, and Visvesvaraya boarding halls • KLMCE Kadapa Campus
          </p>
        </div>
      </div>

      {/* Hostel Blocks Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {hostels.map((block) => {
          const isSelected = selectedBlock.blockName === block.blockName;
          const occupancy = Math.round((block.occupiedRooms / block.totalRooms) * 100);

          return (
            <div
              key={block.blockName}
              onClick={() => setSelectedBlock(block)}
              className={`p-6 rounded-3xl border cursor-pointer transition-all ${
                isSelected 
                  ? "bg-indigo-600/20 border-indigo-500/40 shadow-xl" 
                  : "bg-[#1f1b30]/80 hover:bg-[#1f1b30] border-white/10"
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                  block.type === 'Girls' ? 'bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/30' : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                }`}>
                  {block.type} Hostel
                </span>
                <span className="text-xs font-bold text-emerald-400">{occupancy}% Full</span>
              </div>

              <h3 className="text-lg font-bold text-white mb-1">{block.blockName}</h3>
              <p className="text-xs text-slate-400 mb-4">Warden: {block.wardenName} • {block.wardenPhone}</p>

              <div className="flex justify-between text-xs text-slate-300 mb-1.5">
                <span>Occupied Rooms:</span>
                <span className="font-bold text-white">{block.occupiedRooms} / {block.totalRooms}</span>
              </div>

              <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${occupancy}%` }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Block Details & Allocated Residents */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Residents Table */}
        <div className="lg:col-span-8 bg-[#1f1b30]/80 rounded-3xl border border-white/10 p-6 shadow-xl space-y-4">
          <div className="flex justify-between items-center border-b border-white/10 pb-4">
            <div>
              <h2 className="text-lg font-bold text-white">Allocated Student Residents</h2>
              <p className="text-xs text-slate-400 mt-0.5">Biometric verification & night attendance active</p>
            </div>
            <span className="text-xs font-semibold text-emerald-400 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              {residents.length} Active Records
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-xs uppercase text-slate-400 border-b border-white/10">
                  <th className="pb-3 px-4">Student Name</th>
                  <th className="pb-3 px-4">Roll Number</th>
                  <th className="pb-3 px-4">Department</th>
                  <th className="pb-3 px-4">Allotted Room</th>
                  <th className="pb-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm">
                {residents.map((r) => (
                  <tr key={r.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-white">{r.name}</td>
                    <td className="py-3.5 px-4 font-mono text-indigo-300 text-xs">{r.rollNo}</td>
                    <td className="py-3.5 px-4 text-xs text-slate-300">{r.department}</td>
                    <td className="py-3.5 px-4 font-bold text-emerald-300 text-xs">{r.hostelRoom}</td>
                    <td className="py-3.5 px-4 text-right">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                        CHECKED-IN
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Pane: Mess Details & Warden Desk */}
        <div className="lg:col-span-4 bg-[#1f1b30]/80 rounded-3xl border border-white/10 p-6 shadow-xl flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-white/10 pb-3">
              <Utensils className="w-5 h-5 text-amber-400" /> Campus Dining & Mess Facility
            </h3>

            <div className="bg-black/30 p-4 rounded-2xl border border-white/5 space-y-2 text-xs">
              <p className="font-semibold text-slate-200">Daily Regional Menu</p>
              <p className="text-slate-400">Breakfast: Idli, Vada, Upma & Chutney</p>
              <p className="text-slate-400">Lunch: Authentic Andhra Meals, Pappu, Sambar, Curd</p>
              <p className="text-slate-400">Dinner: Chapati, Veg Curry & Rice / Ragi Sangati</p>
              <p className="text-[11px] text-amber-300 pt-2 border-t border-white/10">In-Charge: {selectedBlock.messManager}</p>
            </div>

            <div className="bg-black/30 p-4 rounded-2xl border border-white/5 space-y-2 text-xs">
              <p className="font-semibold text-slate-200">Warden Contact Office</p>
              <p className="text-slate-300">Warden: <strong className="text-white">{selectedBlock.wardenName}</strong></p>
              <p className="text-indigo-400 flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> {selectedBlock.wardenPhone}</p>
              <p className="text-slate-500 text-[10px]">Hostel Main Gate Curfew: 07:00 PM (Sharp)</p>
            </div>
          </div>

          <button
            onClick={() => alert(`Broadcasting curfew & dinner reminder to all residents in ${selectedBlock.blockName}...`)}
            className="w-full mt-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg transition"
          >
            Send Warden Broadcast Notification
          </button>
        </div>

      </div>
    </div>
  );
}
