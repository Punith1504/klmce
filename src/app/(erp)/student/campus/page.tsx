"use client";

import React from 'react';
import { Bus, BookMarked, Home, Search, Map } from "lucide-react";

export default function CampusPage() {
    return (
        <div className="space-y-8 max-w-7xl mx-auto p-6 lg:p-8 font-sans">
            <div>
                <h1 className="text-3xl font-bold text-slate-50 flex items-center gap-3 mb-2">
                    <Map className="w-7 h-7 text-sky-400"/> Campus Services
                </h1>
                <p className="text-slate-400 text-sm">Access Library, Transport, and Hostel information.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Library Module */}
                <div className="bg-[#221F32]/80 backdrop-blur rounded-2xl p-6 border border-white/10 shadow-lg group">
                    <div className="w-12 h-12 bg-sky-500/20 text-sky-400 rounded-xl flex items-center justify-center mb-6 border border-sky-500/30">
                        <BookMarked className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-50 mb-2">Library</h3>
                    <p className="text-sm text-slate-400 mb-6">Search catalogues, check issued books, and renew online.</p>
                    
                    <div className="space-y-4">
                        <div className="bg-black/30 p-4 rounded-xl border border-white/5">
                            <p className="text-xs text-slate-500 font-bold uppercase">Books Due</p>
                            <p className="text-slate-200 font-medium mt-1 text-sm">&quot;Operating System Concepts&quot; by Silberschatz</p>
                            <p className="text-red-400 text-xs font-bold mt-2">Due in 2 Days</p>
                        </div>
                        <button className="w-full bg-white/5 hover:bg-white/10 text-slate-200 py-2 rounded-lg text-sm font-semibold transition border border-white/10">
                            Search Catalogue
                        </button>
                    </div>
                </div>

                {/* Transport Module */}
                <div className="bg-[#221F32]/80 backdrop-blur rounded-2xl p-6 border border-white/10 shadow-lg group">
                    <div className="w-12 h-12 bg-amber-500/20 text-amber-400 rounded-xl flex items-center justify-center mb-6 border border-amber-500/30">
                        <Bus className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-50 mb-2">Transport</h3>
                    <p className="text-sm text-slate-400 mb-6">Track your bus route, driver details, and stops.</p>
                    
                    <div className="space-y-4">
                        <div className="bg-black/30 p-4 rounded-xl border border-white/5">
                            <p className="text-xs text-slate-500 font-bold uppercase">Route Assigned</p>
                            <p className="text-slate-200 font-medium mt-1 text-sm">Route No. 14 (City Center)</p>
                            <p className="text-amber-400 text-xs font-bold mt-2">Pickup: 7:45 AM</p>
                        </div>
                        <button className="w-full bg-white/5 hover:bg-white/10 text-slate-200 py-2 rounded-lg text-sm font-semibold transition border border-white/10">
                            Live Tracking
                        </button>
                    </div>
                </div>

                {/* Hostel Module */}
                <div className="bg-[#221F32]/80 backdrop-blur rounded-2xl p-6 border border-white/10 shadow-lg group">
                    <div className="w-12 h-12 bg-purple-500/20 text-purple-400 rounded-xl flex items-center justify-center mb-6 border border-purple-500/30">
                        <Home className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-50 mb-2">Hostel</h3>
                    <p className="text-sm text-slate-400 mb-6">Room allocation, mess info, and leave requests.</p>
                    
                    <div className="space-y-4">
                        <div className="bg-black/30 p-4 rounded-xl border border-white/5">
                            <p className="text-xs text-slate-500 font-bold uppercase">Room Info</p>
                            <p className="text-slate-200 font-medium mt-1 text-sm">Block B - Room 204</p>
                            <p className="text-emerald-400 text-xs font-bold mt-2">Mess Dues Cleared</p>
                        </div>
                        <button className="w-full bg-white/5 hover:bg-white/10 text-slate-200 py-2 rounded-lg text-sm font-semibold transition border border-white/10">
                            Hostel Outing Request
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}
