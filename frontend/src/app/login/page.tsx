"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, User, ShieldCheck, ArrowRight, Loader2, AlertCircle } from "lucide-react";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from "@/components/ui/input-otp";
import apiClient from '@/lib/api/client';
import { useQueryClient } from '@tanstack/react-query';

export default function SecureLoginFlow() {
    const router = useRouter();
    const queryClient = useQueryClient();
    
    // FSM State Tracking
    const [step, setStep] = useState<1 | 2>(1);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    // Form Payload
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [tempSessionToken, setTempSessionToken] = useState('');

    const handlePrimaryAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            // Simulated payload to backend authentication route
            const { data, status } = await apiClient.post('/auth/login', { email, password });
            
            // Backend identifies 2FA is enabled and returns a 206 Partial Content / specialized payload
            if (status === 206 || data.requires_2fa) {
                setTempSessionToken(data.temp_token); // Short-lived token for OTP validation
                setStep(2); // Trigger Framer Motion slide-transition
            } else {
                // If 2FA isn't enforced, proceed directly
                handleSessionHydration(data.role);
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Authentication rejected. Verify credentials.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleTotpVerification = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            // Submit the 6-digit TOTP along with the temporary session identifier
            const { data } = await apiClient.post('/auth/verify-2fa', { 
                temp_token: tempSessionToken, 
                otp_code: otp 
            });

            // At this exact moment, the backend has set the robust HttpOnly JWT cookie.
            // Our globally configured Axios interceptor from `client.ts` is now locked and loaded.
            handleSessionHydration(data.role);

        } catch (err: any) {
            setError(err.response?.data?.message || 'Invalid or expired TOTP code.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSessionHydration = (role: string) => {
        // 1. Invalidate all stale cache queries globally so TanStack Query rehydrates 
        // with the fresh, securely authenticated session data.
        queryClient.invalidateQueries();

        // 2. Perform Role-Based Access Control (RBAC) routing
        switch (role?.toUpperCase()) {
            case 'ADMIN':
                router.push('/admin/dashboard');
                break;
            case 'FACULTY':
                router.push('/faculty/dashboard');
                break;
            case 'STUDENT':
                router.push('/student/dashboard');
                break;
            default:
                router.push('/dashboard');
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0f1c] flex items-center justify-center p-4 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/10 via-[#0a0f1c] to-[#0a0f1c]">
            <Card className="w-full max-w-md bg-white/5 border-white/10 backdrop-blur-xl shadow-2xl overflow-hidden relative">
                
                {/* Decorative glowing orb */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                
                <CardHeader className="text-center pb-2">
                    <div className="mx-auto bg-blue-500/20 w-16 h-16 rounded-2xl flex items-center justify-center mb-4 border border-blue-500/30">
                        {step === 1 ? <Lock className="w-8 h-8 text-blue-400" /> : <ShieldCheck className="w-8 h-8 text-emerald-400" />}
                    </div>
                    <CardTitle className="text-2xl font-bold text-white tracking-tight">
                        {step === 1 ? 'KLMCE Secure Portal' : 'Two-Factor Verification'}
                    </CardTitle>
                    <CardDescription className="text-slate-400 mt-2">
                        {step === 1 
                            ? 'Enter your institutional credentials to proceed.' 
                            : 'Enter the 6-digit TOTP code from your authenticator app.'}
                    </CardDescription>
                </CardHeader>

                <CardContent className="mt-4">
                    <AnimatePresence mode="wait">
                        
                        {/* STEP 1: Username & Password */}
                        {step === 1 && (
                            <motion.form 
                                key="step1"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ duration: 0.3 }}
                                onSubmit={handlePrimaryAuth}
                                className="space-y-4"
                            >
                                <div className="space-y-2">
                                    <Label className="text-slate-300">Institutional Email</Label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-3 h-5 w-5 text-slate-500" />
                                        <Input 
                                            type="email" 
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="pl-10 bg-black/40 border-white/10 text-white focus:ring-blue-500" 
                                            placeholder="erp_id@klmce.edu" 
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <Label className="text-slate-300">Master Password</Label>
                                    </div>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-500" />
                                        <Input 
                                            type="password" 
                                            required
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="pl-10 bg-black/40 border-white/10 text-white focus:ring-blue-500" 
                                            placeholder="••••••••••••" 
                                        />
                                    </div>
                                </div>

                                {error && (
                                    <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg flex items-center text-sm text-rose-400">
                                        <AlertCircle className="w-4 h-4 mr-2 shrink-0" /> {error}
                                    </div>
                                )}

                                <Button 
                                    type="submit" 
                                    disabled={isLoading}
                                    className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-lg border-0 shadow-lg shadow-blue-900/50 mt-4 transition-all"
                                >
                                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Authenticate <ArrowRight className="w-5 h-5 ml-2" /></>}
                                </Button>
                            </motion.form>
                        )}

                        {/* STEP 2: TOTP Input */}
                        {step === 2 && (
                            <motion.form 
                                key="step2"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ duration: 0.3 }}
                                onSubmit={handleTotpVerification}
                                className="space-y-6 flex flex-col items-center"
                            >
                                <div className="text-sm text-slate-400 text-center w-full bg-black/20 p-3 rounded-lg border border-white/5">
                                    A robust security policy is enforced on your account. Open Google Authenticator or Authy to retrieve your code.
                                </div>

                                <div className="w-full flex justify-center py-4">
                                    {/* Shadcn UI InputOTP Component */}
                                    <InputOTP 
                                        maxLength={6} 
                                        value={otp} 
                                        onChange={(val) => setOtp(val)}
                                        autoFocus
                                    >
                                        <InputOTPGroup className="gap-2">
                                            {[0, 1, 2].map((idx) => (
                                                <InputOTPSlot key={idx} index={idx} className="w-12 h-14 bg-black/40 border-white/20 text-white text-2xl font-bold rounded-md ring-emerald-500" />
                                            ))}
                                        </InputOTPGroup>
                                        <InputOTPSeparator className="text-slate-500" />
                                        <InputOTPGroup className="gap-2">
                                            {[3, 4, 5].map((idx) => (
                                                <InputOTPSlot key={idx} index={idx} className="w-12 h-14 bg-black/40 border-white/20 text-white text-2xl font-bold rounded-md ring-emerald-500" />
                                            ))}
                                        </InputOTPGroup>
                                    </InputOTP>
                                </div>

                                {error && (
                                    <div className="w-full p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg flex items-center text-sm text-rose-400">
                                        <AlertCircle className="w-4 h-4 mr-2 shrink-0" /> {error}
                                    </div>
                                )}

                                <div className="w-full flex gap-3">
                                    <Button 
                                        type="button" 
                                        variant="outline" 
                                        onClick={() => { setStep(1); setOtp(''); setError(null); }}
                                        disabled={isLoading}
                                        className="w-1/3 h-12 bg-white/5 border-white/10 text-slate-300 hover:bg-white/10"
                                    >
                                        Back
                                    </Button>
                                    <Button 
                                        type="submit" 
                                        disabled={isLoading || otp.length !== 6}
                                        className="flex-1 h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-lg border-0 shadow-lg shadow-emerald-900/50 transition-all"
                                    >
                                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Verify & Hydrate <ShieldCheck className="w-5 h-5 ml-2" /></>}
                                    </Button>
                                </div>
                            </motion.form>
                        )}
                    </AnimatePresence>
                </CardContent>
            </Card>
        </div>
    );
}
