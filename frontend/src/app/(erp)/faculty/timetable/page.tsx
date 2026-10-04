"use client";

import React from 'react';
import { Calendar, Clock, MapPin } from 'lucide-react';

export default function FacultyTimetable() {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const periods = ["09:00", "09:50", "10:40", "11:30", "12:20", "01:10", "02:00", "02:50"];

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-6 lg:p-8 font-sans text-white">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-50 flex items-center gap-3 mb-2">
            <Calendar className="w-7 h-7 text-indigo-400"/> Timetable & Workload
          </h1>
          <p className="text-slate-400 text-sm">Your weekly class and lab allocations.</p>
        </div>
      </div>

      <div className="bg-[#221F32]/80 backdrop-blur rounded-2xl border border-white/10 shadow-lg overflow-x-auto">
        <table className="w-full text-sm text-left border-collapse">
          <thead className="bg-black/40 border-b border-white/10">
            <tr>
              <th className="px-4 py-4 font-semibold text-slate-400 text-center border-r border-white/10 w-24">Day</th>
              {periods.map(p => (
                <th key={p} className="px-4 py-4 font-semibold text-slate-400 text-center border-r border-white/10 min-w-[120px]">
                  <Clock className="w-3 h-3 inline mr-1 mb-0.5 opacity-50"/> {p}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {days.map((day, i) => (
              <tr key={day} className="hover:bg-white/5 transition-colors">
                <td className="px-4 py-6 font-bold text-slate-300 text-center border-r border-white/10 bg-black/20">{day}</td>
                {periods.map((_, j) => {
                  // Mock some random blocks
                  const isClass = (i === 0 && j === 0) || (i === 1 && j === 2);
                  const isLab = (i === 2 && j >= 3 && j <= 5);
                  
                  if (isClass) {
                    return (
                      <td key={j} className="p-2 border-r border-white/10">
                        <div className="bg-indigo-500/10 border border-indigo-500/30 p-2 rounded-lg h-full flex flex-col justify-center items-center text-center">
                          <p className="font-bold text-indigo-300 text-xs">DBMS</p>
                          <p className="text-[10px] text-slate-400 mt-1">CSE-B</p>
                          <p className="text-[10px] text-slate-400"><MapPin className="w-2.5 h-2.5 inline"/> 304</p>
                        </div>
                      </td>
                    );
                  }
                  
                  if (isLab && j === 3) {
                    return (
                      <td key={j} colSpan={3} className="p-2 border-r border-white/10">
                        <div className="bg-emerald-500/10 border border-emerald-500/30 p-2 rounded-lg h-full flex flex-col justify-center items-center text-center">
                          <p className="font-bold text-emerald-300 text-xs">Operating Systems Lab</p>
                          <p className="text-[10px] text-slate-400 mt-1">CSE-A</p>
                          <p className="text-[10px] text-slate-400"><MapPin className="w-2.5 h-2.5 inline"/> Lab 2</p>
                        </div>
                      </td>
                    );
                  } else if (isLab) {
                      return null; // Handled by colSpan
                  }

                  return <td key={j} className="p-2 border-r border-white/10 bg-black/10"></td>;
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
