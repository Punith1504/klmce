"use client";
import React, { useState, useEffect, useRef } from 'react';
import { Card } from "@/components/ui/card";
import { ScanLine, CheckCircle, XCircle, Utensils, AlertTriangle } from "lucide-react";

export default function CanteenPOSKiosk() {
    const [scanState, setScanState] = useState<'IDLE' | 'APPROVED' | 'DECLINED'>('IDLE');
    const [scanDetails, setScanDetails] = useState<any>(null);
    
    // Web Audio API Context for High-Throughput Audible Feedback
    const audioCtxRef = useRef<AudioContext | null>(null);

    useEffect(() => {
        // Initialize AudioContext on mount (requires user interaction in strict mode, 
        // but typically allowed in dedicated POS kiosk browsers).
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        
        // Mock continuous scanner loop replacing the actual `html5-qrcode` camera hook
        const interval = setInterval(() => {
            simulateHardwareScan();
        }, 5000); // Scans every 5 seconds for demonstration
        
        return () => clearInterval(interval);
    }, []);

    const playTone = (type: 'SUCCESS' | 'ERROR') => {
        if (!audioCtxRef.current) return;
        const ctx = audioCtxRef.current;
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        osc.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        if (type === 'SUCCESS') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(880, ctx.currentTime); // High pitched friendly beep (A5)
            gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
            osc.start();
            osc.stop(ctx.currentTime + 0.15);
        } else {
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(150, ctx.currentTime); // Low harsh buzzer tone
            gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
            osc.start();
            osc.stop(ctx.currentTime + 0.4);
        }
    };

    const simulateHardwareScan = () => {
        const isSuccess = Math.random() > 0.3; // 70% success rate mock
        
        if (isSuccess) {
            setScanState('APPROVED');
            setScanDetails({ name: 'Rahul Gupta', id: '2026-CSE-1422', plan: 'South Indian Mess' });
            playTone('SUCCESS');
        } else {
            setScanState('DECLINED');
            setScanDetails({ reason: 'Double-Dip Detected: Lunch already consumed at 13:12 PM.' });
            playTone('ERROR');
        }
        
        // Auto-reset UI for the next student in queue
        setTimeout(() => setScanState('IDLE'), 2500);
    };

    return (
        <div className="h-screen bg-black flex flex-col items-center justify-center p-8 overflow-hidden">
            
            {/* Header */}
            <div className="absolute top-8 left-8 flex items-center gap-3 text-slate-400">
                <Utensils className="w-6 h-6" />
                <span className="font-bold text-xl tracking-widest uppercase">POS Kiosk Terminal 04</span>
            </div>

            {/* IDLE STATE: Camera Feed Simulation */}
            {scanState === 'IDLE' && (
                <div className="flex flex-col items-center justify-center space-y-8 animate-in fade-in zoom-in duration-300">
                    <div className="relative w-96 h-96 border-4 border-dashed border-slate-600 rounded-3xl flex items-center justify-center bg-[#0a0f1c]">
                        <ScanLine className="w-32 h-32 text-slate-500 animate-pulse" />
                        
                        {/* Laser Scanner Animation overlay */}
                        <div className="absolute top-0 left-0 w-full h-1 bg-cyan-500 shadow-[0_0_15px_#06b6d4] animate-[scan_2s_ease-in-out_infinite]" />
                    </div>
                    <h2 className="text-3xl font-medium text-slate-300">Awaiting QR / RFID Scan</h2>
                </div>
            )}

            {/* MASSIVE OVERLAYS FOR RAPID VISUAL PROCESSING */}
            {scanState === 'APPROVED' && (
                <div className="absolute inset-0 bg-emerald-600 flex flex-col items-center justify-center animate-in zoom-in-95 fade-in duration-150 z-50">
                    <CheckCircle className="w-48 h-48 text-white mb-8 drop-shadow-2xl" />
                    <h1 className="text-8xl font-black text-white tracking-tight drop-shadow-2xl">APPROVED</h1>
                    
                    <Card className="mt-12 bg-black/20 border-white/20 backdrop-blur-md">
                        <div className="p-8 text-center text-white">
                            <div className="text-2xl font-medium mb-2">{scanDetails?.name}</div>
                            <div className="font-mono text-emerald-200 mb-4">{scanDetails?.id}</div>
                            <Badge className="bg-white/20 text-white text-lg border-0 py-2 px-6">{scanDetails?.plan}</Badge>
                        </div>
                    </Card>
                </div>
            )}

            {scanState === 'DECLINED' && (
                <div className="absolute inset-0 bg-rose-600 flex flex-col items-center justify-center animate-in zoom-in-95 fade-in duration-150 z-50">
                    <XCircle className="w-48 h-48 text-white mb-8 drop-shadow-2xl" />
                    <h1 className="text-8xl font-black text-white tracking-tight drop-shadow-2xl">DECLINED</h1>
                    
                    <Card className="mt-12 bg-black/20 border-white/20 backdrop-blur-md max-w-2xl mx-4">
                        <div className="p-8 flex items-start gap-4 text-white">
                            <AlertTriangle className="w-10 h-10 shrink-0 text-rose-200 mt-1" />
                            <div className="text-3xl font-medium leading-tight">{scanDetails?.reason}</div>
                        </div>
                    </Card>
                </div>
            )}

            <style jsx global>{`
                @keyframes scan {
                    0% { transform: translateY(0); }
                    50% { transform: translateY(384px); }
                    100% { transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}
