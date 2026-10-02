"use client";
import React, { useEffect } from 'react';
import { useDemoStore } from '@/store/useDemoStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Sparkles, Users, X, Zap } from 'lucide-react';
import { Button } from './ui/button';

export function DemoProvider({ children }: { children: React.ReactNode }) {
    const { 
        isPitchModeActive, 
        togglePitchMode, 
        triggerAttendanceRush, 
        triggerPerfectMatch 
    } = useDemoStore();

    // ==========================================
    // STEALTH KEYBOARD SHORTCUT LISTENER
    // ==========================================
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Secret Hook: Ctrl + Shift + V (or Cmd + Shift + V on Mac)
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'v') {
                e.preventDefault();
                togglePitchMode();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [togglePitchMode]);

    return (
        <>
            {/* The entire application renders normally underneath this provider */}
            {children}
            
            {/* ==========================================
                FLOATING STEALTH COMMAND PALETTE
                ========================================== */}
            <AnimatePresence>
                {isPitchModeActive && (
                    <motion.div 
                        initial={{ opacity: 0, y: 50, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 50, scale: 0.95 }}
                        className="fixed bottom-6 right-6 z-[9999] w-84 bg-black/80 backdrop-blur-xl border border-rose-500/50 rounded-xl shadow-2xl overflow-hidden"
                    >
                        {/* Header */}
                        <div className="bg-rose-950/40 p-3 border-b border-rose-500/20 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-rose-400 animate-pulse" />
                                <span className="text-xs font-bold text-rose-200 uppercase tracking-widest">Golden Path: Active</span>
                            </div>
                            <button onClick={togglePitchMode} className="text-slate-400 hover:text-white transition-colors">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        
                        {/* 1-Click Execution Injectors */}
                        <div className="p-4 space-y-3">
                            <Button 
                                onClick={triggerAttendanceRush}
                                className="w-full justify-start bg-indigo-600/20 hover:bg-indigo-600/40 border border-indigo-500/30 text-indigo-200 h-10 transition-colors"
                            >
                                <Users className="w-4 h-4 mr-3 text-indigo-400" /> Simulate WebSocket Rush
                            </Button>
                            
                            <Button 
                                onClick={triggerPerfectMatch}
                                className="w-full justify-start bg-emerald-600/20 hover:bg-emerald-600/40 border border-emerald-500/30 text-emerald-200 h-10 transition-colors"
                            >
                                <Zap className="w-4 h-4 mr-3 text-emerald-400" /> AI Matrix: Perfect Match (pgvector)
                            </Button>
                            
                            <Button 
                                className="w-full justify-start bg-amber-600/20 hover:bg-amber-600/40 border border-amber-500/30 text-amber-200 h-10 transition-colors"
                            >
                                <Play className="w-4 h-4 mr-3 text-amber-400" /> Fast-Forward Kanban Pipeline
                            </Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
