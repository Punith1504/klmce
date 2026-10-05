"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Lock, ArrowRight, Sparkles, Loader2, AlertCircle, Phone, Mail, Hash, ShieldCheck, ChevronLeft, CheckCircle } from 'lucide-react';

type AuthView = 'login' | 'register' | 'forgot' | 'otp';

export default function UnifiedAuthPortal() {
    const router = useRouter();
    const [view, setView] = useState<AuthView>('login');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    // Form States
    const [loginId, setLoginId] = useState(''); // Can be Roll No, Mobile, or Email
    const [password, setPassword] = useState('');
    
    const [regRollNo, setRegRollNo] = useState('');
    const [regMobile, setRegMobile] = useState('');
    const [regEmail, setRegEmail] = useState('');
    const [regPassword, setRegPassword] = useState('');
    
    const [recoveryRollNo, setRecoveryRollNo] = useState('');
    const [recoveryOtp, setRecoveryOtp] = useState('');

    const handleSimulation = (callback: () => void) => {
        setIsLoading(true);
        setError(null);
        setTimeout(() => {
            setIsLoading(false);
            callback();
        }, 1500);
    };

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        handleSimulation(() => {
            const lowerId = loginId.toLowerCase();
            if (lowerId.includes('admin')) router.push('/admin/dashboard');
            else if (lowerId.includes('fac')) router.push('/faculty/dashboard');
            else router.push('/student/dashboard');
        });
    };

    const handleRegister = (e: React.FormEvent) => {
        e.preventDefault();
        handleSimulation(() => {
            setView('login');
            alert("Account created successfully! Your mobile number is now linked to your Roll Number.");
        });
    };

    const handleSendOTP = (e: React.FormEvent) => {
        e.preventDefault();
        handleSimulation(() => {
            setView('otp');
        });
    };

    const handleVerifyOTP = (e: React.FormEvent) => {
        e.preventDefault();
        handleSimulation(() => {
            setView('login');
            alert("Password successfully reset! Please login with your new credentials.");
        });
    };

    const switchView = (newView: AuthView) => {
        setError(null);
        setView(newView);
    };

    return (
        <div className="min-h-screen bg-[#050014] flex items-center justify-center p-4 relative overflow-hidden font-sans">
            
            {/* Animated Background Gradients */}
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-violet-600/30 blur-[120px] mix-blend-screen pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-fuchsia-600/20 blur-[120px] mix-blend-screen pointer-events-none" />
            <div className="absolute top-[40%] left-[30%] w-[40%] h-[40%] rounded-full bg-indigo-800/20 blur-[150px] mix-blend-screen pointer-events-none" />

            <div className="w-full max-w-md relative z-10">
                {/* Glassmorphic Panel */}
                <div className="bg-white/[0.03] backdrop-blur-2xl border border-white/[0.08] p-8 sm:p-10 rounded-[2rem] shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] overflow-hidden relative">
                    
                    <div className="text-center mb-8 relative z-10">
                        <img 
                            src="/college-logo.png" 
                            alt="Institution Logo" 
                            className="w-24 h-24 mx-auto mb-4 object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]"
                        />
                        <h1 className="text-3xl font-bold text-white tracking-tight mb-2">
                            {view === 'login' && "Welcome Back"}
                            {view === 'register' && "Create Account"}
                            {view === 'forgot' && "Account Recovery"}
                            {view === 'otp' && "Verify Identity"}
                        </h1>
                        <p className="text-violet-200/60 text-sm">
                            {view === 'login' && "Sign in to your KSRMMS portal."}
                            {view === 'register' && "Link your Roll No to your Mobile/Email."}
                            {view === 'forgot' && "Enter your Roll No to receive an OTP."}
                            {view === 'otp' && "Enter the OTP sent to your registered mobile."}
                        </p>
                    </div>

                    <AnimatePresence mode="wait">
                        {/* ---------------- LOGIN VIEW ---------------- */}
                        {view === 'login' && (
                            <motion.form 
                                key="login"
                                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                                onSubmit={handleLogin} className="space-y-5"
                            >
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-violet-200/80 uppercase tracking-wider ml-1">Roll No / Mobile / Email</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <User className="h-5 w-5 text-violet-300/50 group-focus-within:text-violet-400 transition-colors" />
                                        </div>
                                        <input
                                            type="text" required value={loginId} onChange={(e) => setLoginId(e.target.value)}
                                            placeholder="Enter your credential"
                                            className="w-full bg-black/20 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-violet-200/30 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all backdrop-blur-sm"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between items-center ml-1">
                                        <label className="text-xs font-semibold text-violet-200/80 uppercase tracking-wider">Password</label>
                                        <button type="button" onClick={() => switchView('forgot')} className="text-xs text-fuchsia-400 hover:text-fuchsia-300 transition-colors font-medium">Forgot Password?</button>
                                    </div>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Lock className="h-5 w-5 text-violet-300/50 group-focus-within:text-violet-400 transition-colors" />
                                        </div>
                                        <input
                                            type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                                            placeholder="••••••••"
                                            className="w-full bg-black/20 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-violet-200/30 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all backdrop-blur-sm"
                                        />
                                    </div>
                                </div>

                                <button type="submit" disabled={isLoading} className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-semibold py-4 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 mt-2">
                                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Sign In <ArrowRight className="w-5 h-5" /></>}
                                </button>
                                
                                <div className="relative flex py-4 items-center">
                                    <div className="flex-grow border-t border-white/10"></div>
                                    <span className="flex-shrink-0 mx-4 text-violet-200/40 text-xs">OR</span>
                                    <div className="flex-grow border-t border-white/10"></div>
                                </div>

                                <button type="button" className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium py-3.5 rounded-2xl transition-all flex items-center justify-center gap-3">
                                    <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
                                    Continue with Google
                                </button>

                                <p className="text-center text-sm text-violet-200/60 mt-6">
                                    Don't have an account? <button type="button" onClick={() => switchView('register')} className="text-fuchsia-400 hover:text-white transition-colors font-medium">Create one</button>
                                </p>
                            </motion.form>
                        )}

                        {/* ---------------- REGISTER VIEW ---------------- */}
                        {view === 'register' && (
                            <motion.form 
                                key="register"
                                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                                onSubmit={handleRegister} className="space-y-4"
                            >
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-violet-200/80 uppercase tracking-wider ml-1">Enrollment / Roll No</label>
                                    <div className="relative">
                                        <Hash className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-violet-300/50" />
                                        <input type="text" required value={regRollNo} onChange={(e) => setRegRollNo(e.target.value)} placeholder="e.g. 21BCE1029" className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-violet-200/30 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all" />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-violet-200/80 uppercase tracking-wider ml-1">Mobile Number</label>
                                    <div className="relative">
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-violet-300/50" />
                                        <input type="tel" required value={regMobile} onChange={(e) => setRegMobile(e.target.value)} placeholder="+91 98765 43210" className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-violet-200/30 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all" />
                                    </div>
                                    <p className="text-[10px] text-fuchsia-400/80 ml-1">This number will be linked for account recovery.</p>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-violet-200/80 uppercase tracking-wider ml-1">Email (Optional)</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-violet-300/50" />
                                        <input type="email" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} placeholder="student@example.com" className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-violet-200/30 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all" />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-violet-200/80 uppercase tracking-wider ml-1">Create Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-violet-300/50" />
                                        <input type="password" required value={regPassword} onChange={(e) => setRegPassword(e.target.value)} placeholder="••••••••" className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-violet-200/30 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all" />
                                    </div>
                                </div>

                                <button type="submit" disabled={isLoading} className="w-full bg-violet-600 hover:bg-violet-500 text-white font-semibold py-3.5 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 mt-2">
                                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Complete Registration"}
                                </button>
                                
                                <button type="button" onClick={() => switchView('login')} className="w-full text-sm text-violet-300/60 hover:text-white flex items-center justify-center gap-2 mt-4 transition-colors">
                                    <ChevronLeft className="w-4 h-4" /> Back to Login
                                </button>
                            </motion.form>
                        )}

                        {/* ---------------- FORGOT PASSWORD VIEW ---------------- */}
                        {view === 'forgot' && (
                            <motion.form 
                                key="forgot"
                                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                                onSubmit={handleSendOTP} className="space-y-6"
                            >
                                <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4 flex gap-3 text-sm text-indigo-200 mb-2">
                                    <ShieldCheck className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                                    <p>Enter your Enrollment / Roll Number. We will send a secure OTP to the mobile number linked to this account.</p>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-violet-200/80 uppercase tracking-wider ml-1">Enrollment / Roll No</label>
                                    <div className="relative">
                                        <Hash className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-violet-300/50" />
                                        <input type="text" required value={recoveryRollNo} onChange={(e) => setRecoveryRollNo(e.target.value)} placeholder="e.g. 21BCE1029" className="w-full bg-black/20 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-violet-200/30 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all" />
                                    </div>
                                </div>

                                <button type="submit" disabled={isLoading} className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-semibold py-4 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2">
                                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Send OTP via SMS"}
                                </button>
                                
                                <button type="button" onClick={() => switchView('login')} className="w-full text-sm text-violet-300/60 hover:text-white flex items-center justify-center gap-2 mt-4 transition-colors">
                                    <ChevronLeft className="w-4 h-4" /> Back to Login
                                </button>
                            </motion.form>
                        )}

                        {/* ---------------- OTP VERIFICATION VIEW ---------------- */}
                        {view === 'otp' && (
                            <motion.form 
                                key="otp"
                                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                                onSubmit={handleVerifyOTP} className="space-y-6"
                            >
                                <div className="text-center mb-6">
                                    <p className="text-sm text-slate-300">An OTP has been sent to the mobile number ending in <strong className="text-white">XXXXX 4321</strong>.</p>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-violet-200/80 uppercase tracking-wider ml-1 text-center block">Enter 6-Digit OTP</label>
                                    <input 
                                        type="text" required maxLength={6} value={recoveryOtp} onChange={(e) => setRecoveryOtp(e.target.value)} 
                                        placeholder="0 0 0 0 0 0" 
                                        className="w-full bg-black/30 border border-white/10 rounded-2xl py-4 text-center text-2xl tracking-[0.5em] text-white placeholder-violet-200/10 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/50 transition-all font-mono" 
                                    />
                                </div>

                                <button type="submit" disabled={isLoading} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-4 rounded-2xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2">
                                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Verify & Reset Password <CheckCircle className="w-5 h-5" /></>}
                                </button>
                                
                                <button type="button" onClick={() => switchView('forgot')} className="w-full text-sm text-violet-300/60 hover:text-white flex items-center justify-center gap-2 mt-4 transition-colors">
                                    <ChevronLeft className="w-4 h-4" /> Use a different Roll No
                                </button>
                            </motion.form>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
