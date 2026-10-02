"use client";
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Timer, AlertTriangle, ShieldCheck } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function StudentAssessmentKiosk() {
    const [timeLeft, setTimeLeft] = useState(3600); // 60 minutes
    const [isKioskMode, setIsKioskMode] = useState(true);

    // Kiosk Mode Enforcer: Lock the screen, disable right-clicks, track tab switching
    useEffect(() => {
        const handleContextMenu = (e: any) => e.preventDefault();
        const handleVisibilityChange = () => {
            if (document.hidden) {
                console.warn("INTEGRITY BREACH: Student switched tabs.");
                // In production: dispatch API call to flag attempt for proctor review
            }
        };

        document.addEventListener('contextmenu', handleContextMenu);
        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            document.removeEventListener('contextmenu', handleContextMenu);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, []);

    // Secure Countdown Timer
    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    // autoSubmitAssessment();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    if (!isKioskMode) {
        return (
            <div className="h-screen bg-black flex items-center justify-center text-white">
                <div className="text-center space-y-4 max-w-md p-8">
                    <ShieldCheck className="w-16 h-16 text-rose-500 mx-auto" />
                    <h2 className="text-2xl font-bold">Secure Browser Required</h2>
                    <p className="text-slate-400">This assessment enforces strict Kiosk mode. Please enter fullscreen to begin.</p>
                    <Button onClick={() => setIsKioskMode(true)} className="bg-rose-500 hover:bg-rose-600">Enter Secure Environment</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen bg-black text-white flex flex-col overflow-hidden">
            {/* Strict Proctor Header */}
            <header className="h-16 bg-[#1a1f2e] border-b border-white/10 flex items-center justify-between px-8 shrink-0">
                <div className="flex items-center space-x-4">
                    <ShieldCheck className="w-5 h-5 text-emerald-400" />
                    <div>
                        <h1 className="font-bold text-slate-200">Mid-Term Examination: CS401</h1>
                        <p className="text-xs text-emerald-400">Secure Environment Active</p>
                    </div>
                </div>
                
                <div className={`flex items-center space-x-3 px-4 py-2 rounded-lg font-mono text-xl ${timeLeft < 300 ? 'bg-red-500/20 text-red-400 animate-pulse' : 'bg-black/40 text-cyan-400'}`}>
                    <Timer className="w-5 h-5" />
                    <span>{formatTime(timeLeft)}</span>
                </div>
            </header>

            <Progress value={40} className="h-1 rounded-none bg-black" indicatorColor="bg-cyan-500" />

            {/* Assessment Content */}
            <main className="flex-1 overflow-y-auto p-8 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 via-black to-black">
                <div className="max-w-4xl mx-auto space-y-8 pb-32">
                    
                    <Card className="bg-white/5 border-white/10">
                        <CardContent className="p-8">
                            <div className="flex justify-between items-center mb-6">
                                <Badge className="bg-white/10 text-slate-300 border-0">Question 4 of 10</Badge>
                                <span className="text-sm text-slate-500 font-mono">1.0 Marks</span>
                            </div>
                            
                            <h2 className="text-xl font-medium leading-relaxed text-slate-200 mb-8">
                                In the context of quantum computing algorithms, what is the primary advantage of utilizing Shor's Algorithm over classical prime factorization methods?
                            </h2>

                            <RadioGroup defaultValue="none" className="space-y-4">
                                {['Polynomial time vs Exponential time', 'Linear time vs Quadratic time', 'O(1) Memory utilization', 'Higher error correction thresholds'].map((option, idx) => (
                                    <div key={idx} className="flex items-center space-x-3 space-y-0 p-4 rounded-lg border border-white/10 bg-black/20 hover:bg-white/5 transition-colors cursor-pointer group">
                                        <RadioGroupItem value={`opt${idx}`} id={`opt${idx}`} className="border-slate-500 text-cyan-500 focus:ring-cyan-500" />
                                        <Label htmlFor={`opt${idx}`} className="flex-1 cursor-pointer text-slate-300 group-hover:text-white">
                                            {option}
                                        </Label>
                                    </div>
                                ))}
                            </RadioGroup>
                        </CardContent>
                    </Card>

                    <Alert variant="destructive" className="bg-amber-900/20 border-amber-500/30 text-amber-200">
                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                        <AlertDescription className="ml-2">
                            Navigating away from this window will automatically terminate the assessment.
                        </AlertDescription>
                    </Alert>

                </div>
            </main>

            {/* Fixed Footer Actions */}
            <footer className="h-20 bg-[#1a1f2e] border-t border-white/10 flex items-center justify-between px-8 shrink-0">
                <Button variant="outline" className="border-white/20 text-slate-300 hover:bg-white/10">Clear Selection</Button>
                <div className="space-x-4">
                    <Button variant="outline" className="border-white/20 text-slate-300 hover:bg-white/10">Previous</Button>
                    <Button className="bg-cyan-600 hover:bg-cyan-700 text-white shadow-lg shadow-cyan-600/25 px-8">Save & Next</Button>
                </div>
            </footer>
        </div>
    );
}
