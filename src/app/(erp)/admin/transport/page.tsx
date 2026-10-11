"use client";

import React, { useState } from 'react';
import { Bus, MapPin, Users, Phone, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { BUS_ROUTES } from '@/lib/syntheticData';

export default function AdminTransportPage() {
  const [routes, setRoutes] = useState(BUS_ROUTES);
  const [selectedRoute, setSelectedRoute] = useState(BUS_ROUTES[0]);

  const totalBuses = routes.length;
  const totalCapacity = routes.reduce((acc, r) => acc + r.capacity, 0);
  const totalOccupied = routes.reduce((acc, r) => acc + r.occupied, 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 font-sans text-white">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-50 flex items-center gap-3 mb-1">
            <Bus className="w-8 h-8 text-indigo-400" /> Campus Fleet & Transport Logistics
          </h1>
          <p className="text-slate-400 text-sm">
            Rayalaseema transit fleet covering Kadapa, Proddatur, Pulivendula, Badvel, and Kamalapuram routes.
          </p>
        </div>
      </div>

      {/* Fleet Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#1f1b30]/80 rounded-2xl p-6 border border-white/10 shadow-lg">
          <p className="text-xs text-slate-400 uppercase font-semibold">Total College Buses</p>
          <h3 className="text-3xl font-bold text-white mt-1">{totalBuses} Active Buses</h3>
          <p className="text-xs text-indigo-400 mt-2 font-medium">APSRTC Authorized & GPS-Monitored</p>
        </div>

        <div className="bg-[#1f1b30]/80 rounded-2xl p-6 border border-white/10 shadow-lg">
          <p className="text-xs text-slate-400 uppercase font-semibold">Total Seating Capacity</p>
          <h3 className="text-3xl font-bold text-white mt-1">{totalCapacity} Seats</h3>
          <p className="text-xs text-emerald-400 mt-2 font-medium">92% Average Route Occupancy</p>
        </div>

        <div className="bg-[#1f1b30]/80 rounded-2xl p-6 border border-white/10 shadow-lg">
          <p className="text-xs text-slate-400 uppercase font-semibold">Student & Staff Commuters</p>
          <h3 className="text-3xl font-bold text-emerald-400 mt-1">{totalOccupied} Pass Holders</h3>
          <p className="text-xs text-slate-400 mt-2 font-medium">Card verification active at entry gates</p>
        </div>
      </div>

      {/* Bus Routes Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Routes List */}
        <div className="lg:col-span-5 space-y-3">
          <h2 className="text-lg font-bold text-slate-200 mb-2">Regional Bus Routes</h2>
          {routes.map((r) => {
            const isSelected = selectedRoute.routeNo === r.routeNo;
            const occupancyPct = Math.round((r.occupied / r.capacity) * 100);

            return (
              <div
                key={r.routeNo}
                onClick={() => setSelectedRoute(r)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  isSelected 
                    ? "bg-indigo-600/20 border-indigo-500/40 shadow-lg" 
                    : "bg-[#1f1b30]/70 hover:bg-[#1f1b30] border-white/10"
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2.5">
                    <span className="w-7 h-7 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center font-mono text-xs font-bold text-indigo-300">
                      {r.routeNo}
                    </span>
                    <h3 className="font-bold text-white text-sm">{r.routeName}</h3>
                  </div>
                  <span className="text-xs font-mono text-slate-400">{r.busNo}</span>
                </div>

                <div className="flex justify-between items-center text-xs text-slate-400">
                  <span>Driver: {r.driverName}</span>
                  <span className="font-semibold text-emerald-400">{r.occupied} / {r.capacity} seats ({occupancyPct}%)</span>
                </div>

                <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden mt-2.5">
                  <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${occupancyPct}%` }} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Route Details & Stops */}
        <div className="lg:col-span-7 bg-[#1f1b30]/80 rounded-3xl border border-white/10 p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start border-b border-white/10 pb-4 mb-6">
              <div>
                <span className="px-2.5 py-1 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-xs font-bold text-indigo-300">
                  Route #{selectedRoute.routeNo}
                </span>
                <h2 className="text-2xl font-bold text-white mt-2">{selectedRoute.routeName}</h2>
                <p className="text-xs text-slate-400 mt-1 font-mono">Vehicle Registration: {selectedRoute.busNo}</p>
              </div>

              <div className="text-right bg-black/30 p-3 rounded-xl border border-white/5">
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Assigned Driver</p>
                <p className="text-xs font-bold text-slate-200 mt-0.5">{selectedRoute.driverName}</p>
                <p className="text-xs text-indigo-400 mt-0.5">{selectedRoute.driverPhone}</p>
              </div>
            </div>

            {/* Stops Timeline */}
            <h3 className="text-sm font-bold text-slate-300 mb-4 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-400" /> Designated Boarding Stops
            </h3>

            <div className="space-y-3 relative pl-6 border-l-2 border-indigo-500/30 ml-2">
              {selectedRoute.stops.map((stop, i) => (
                <div key={i} className="relative">
                  <span className="w-3 h-3 rounded-full bg-indigo-400 absolute -left-[31px] top-1 border-2 border-[#1f1b30]" />
                  <p className="text-sm font-medium text-slate-100">{stop}</p>
                  <p className="text-[11px] text-slate-500 font-mono">Stop #{i + 1} • Expected Pickup ~ {7 + Math.floor(i * 15 / 60)}:{((i * 15) % 60).toString().padStart(2, '0')} AM</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
              <CheckCircle2 className="w-4 h-4" /> Live GPS Transponder Active
            </span>
            <button
              onClick={() => alert(`Broadcasting SMS update to commuters on Route ${selectedRoute.routeNo}...`)}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition"
            >
              Broadcast Route Alert SMS
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
