"use client";
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Building2, Search, UserPlus, CheckCircle2, AlertTriangle, Hammer, Users } from "lucide-react";

// Simulated Room Data structure mapping to the backend physical topology
const INITIAL_ROOMS = [
    { id: '101', capacity: 2, beds: [{ id: 'B1', status: 'CONFIRMED', student: 'Arjun S.' }, { id: 'B2', status: 'AVAILABLE', student: null }] },
    { id: '102', capacity: 2, beds: [{ id: 'B1', status: 'PROVISIONAL', student: 'Priya P.' }, { id: 'B2', status: 'MAINTENANCE', student: null }] },
    { id: '103', capacity: 3, beds: [{ id: 'B1', status: 'AVAILABLE', student: null }, { id: 'B2', status: 'AVAILABLE', student: null }, { id: 'B3', status: 'AVAILABLE', student: null }] },
    { id: '104', capacity: 2, beds: [{ id: 'B1', status: 'CONFIRMED', student: 'Rahul G.' }, { id: 'B2', status: 'CONFIRMED', student: 'Amit T.' }] },
];

export default function InteractiveHostelFloorPlan() {
    const [rooms, setRooms] = useState(INITIAL_ROOMS);
    const [selectedBed, setSelectedBed] = useState<any>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const getStatusColor = (status: string) => {
        switch(status) {
            case 'AVAILABLE': return 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/30';
            case 'PROVISIONAL': return 'bg-amber-500/20 border-amber-500/50 text-amber-400 hover:bg-amber-500/30';
            case 'CONFIRMED': return 'bg-blue-500/20 border-blue-500/50 text-blue-400 hover:bg-blue-500/30';
            case 'MAINTENANCE': return 'bg-rose-500/20 border-rose-500/50 text-rose-400 hover:bg-rose-500/30';
            default: return 'bg-slate-500/20 border-slate-500/50 text-slate-400';
        }
    };

    const handleAssign = () => {
        // Optimistic UI Update: Binding the student to the bed instantly
        setRooms(prev => prev.map(room => ({
            ...room,
            beds: room.beds.map(b => b.id === selectedBed.id 
                ? { ...b, status: 'CONFIRMED', student: 'Newly Assigned' } 
                : b)
        })));
        setSelectedBed(null);
    };

    return (
        <div className="min-h-screen bg-[#0a0f1c] text-white p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                
                {/* Header & Legends */}
                <div className="flex justify-between items-end border-b border-white/10 pb-6">
                    <div>
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-cyan-400">Hostel Block A - Floor 1</h1>
                        <p className="text-slate-400 mt-2">Physical Topology & Dynamic Allocation Grid</p>
                    </div>
                    <div className="flex gap-4">
                        <Badge className="bg-emerald-500/20 text-emerald-400 border-0">Available</Badge>
                        <Badge className="bg-amber-500/20 text-amber-400 border-0">Provisional (Fee Pending)</Badge>
                        <Badge className="bg-blue-500/20 text-blue-400 border-0">Confirmed</Badge>
                        <Badge className="bg-rose-500/20 text-rose-400 border-0">Out of Service</Badge>
                    </div>
                </div>

                {/* Visual Floor Plan Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {rooms.map(room => (
                        <Card key={room.id} className="bg-white/5 border-white/10 backdrop-blur-sm overflow-hidden">
                            <div className="bg-black/40 px-4 py-2 border-b border-white/10 flex justify-between items-center">
                                <span className="font-bold text-slate-200">Room {room.id}</span>
                                <span className="text-xs text-slate-500 flex items-center"><Users className="w-3 h-3 mr-1" /> {room.capacity} Seater</span>
                            </div>
                            <CardContent className="p-4 grid grid-cols-2 gap-3">
                                {room.beds.map(bed => (
                                    <button 
                                        key={bed.id}
                                        onClick={() => bed.status === 'AVAILABLE' && setSelectedBed({ roomId: room.id, ...bed })}
                                        disabled={bed.status !== 'AVAILABLE'}
                                        className={`w-full h-24 rounded-lg border flex flex-col items-center justify-center gap-1 transition-all ${getStatusColor(bed.status)} ${bed.status === 'AVAILABLE' ? 'cursor-pointer hover:scale-105 shadow-lg shadow-emerald-500/10' : 'cursor-not-allowed opacity-80'}`}
                                    >
                                        {bed.status === 'CONFIRMED' && <UserPlus className="w-5 h-5 mb-1" />}
                                        {bed.status === 'AVAILABLE' && <CheckCircle2 className="w-5 h-5 mb-1" />}
                                        {bed.status === 'MAINTENANCE' && <Hammer className="w-5 h-5 mb-1" />}
                                        {bed.status === 'PROVISIONAL' && <AlertTriangle className="w-5 h-5 mb-1" />}
                                        <span className="font-mono text-xs font-bold">{bed.id}</span>
                                        <span className="text-[10px] truncate max-w-[90%] px-1">{bed.student || 'Empty'}</span>
                                    </button>
                                ))}
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Click-to-Assign Assignment Modal */}
                <Dialog open={!!selectedBed} onOpenChange={() => setSelectedBed(null)}>
                    <DialogContent className="bg-[#13192b] border-white/10 text-white sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle className="text-xl text-teal-400">Assign Room {selectedBed?.roomId} - Bed {selectedBed?.id}</DialogTitle>
                            <DialogDescription className="text-slate-400">Search institutional database to bind student dynamically.</DialogDescription>
                        </DialogHeader>
                        
                        <div className="space-y-6 mt-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                <Input 
                                    autoFocus
                                    placeholder="Search via ERP ID, Name or Roll Number..." 
                                    className="pl-10 h-10 bg-black/40 border-white/10 text-white focus:ring-teal-500"
                                />
                            </div>

                            <div className="p-4 bg-teal-900/20 border border-teal-500/30 rounded-lg flex items-center justify-between">
                                <div>
                                    <div className="font-bold text-slate-200">Suresh Kumar</div>
                                    <div className="text-xs text-slate-400 font-mono mt-1">2026-CSE-1422</div>
                                </div>
                                <Button size="sm" onClick={handleAssign} className="bg-teal-600 hover:bg-teal-700 shadow-lg shadow-teal-600/25 border-0">
                                    Bind to Bed
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>

            </div>
        </div>
    );
}
