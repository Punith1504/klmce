"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Lock, ArrowRight, Sparkles, Loader2, AlertCircle } from 'lucide-react';

export default function UnifiedLogin() {
    const router = useRouter();
    const [id, setId] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        // Simulated Unified Login Routing
        setTimeout(() => {
            setIsLoading(false);
            
            const lowerId = id.toLowerCase();
            
            // Unified Role Redirection Logic
            if (lowerId.startsWith('admin')) {
                router.push('/admin/dashboard');
            } else if (lowerId.startsWith('fac')) {
                router.push('/faculty/dashboard');
            } else if (lowerId.startsWith('stu') || !isNaN(Number(id))) {
                router.push('/student/dashboard');
            } else {
                setError('Invalid ID. Please use a valid Student Number, Faculty ID, or Admin credentials.');
            }
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-[#050014] flex items-center justify-center p-4 relative overflow-hidden font-sans">
            
            {/* Animated Background Gradients (Purple/Violet Hues) */}
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-violet-600/30 blur-[120px] mix-blend-screen pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-fuchsia-600/20 blur-[120px] mix-blend-screen pointer-events-none" />
            <div className="absolute top-[40%] left-[30%] w-[40%] h-[40%] rounded-full bg-purple-800/20 blur-[150px] mix-blend-screen pointer-events-none" />

            <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="w-full max-w-lg relative z-10"
            >
                {/* Glassmorphic Panel */}
                <div className="bg-white/[0.03] backdrop-blur-2xl border border-white/[0.08] p-10 rounded-[2rem] shadow-[0_8px_32px_0_rgba(31,38,135,0.37)]">
                    
                    <div className="text-center mb-10">
                        <motion.div 
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                            className="w-16 h-16 bg-gradient-to-tr from-violet-500 to-fuchsia-500 rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-violet-500/30 mb-6"
                        >
                            <Sparkles className="w-8 h-8 text-white" />
                        </motion.div>
                        <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Welcome Back</h1>
                        <p className="text-violet-200/60 text-sm">Enter your institutional ID to access your personalized portal.</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-violet-200/80 uppercase tracking-wider ml-1">Institutional ID</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <User className="h-5 w-5 text-violet-300/50 group-focus-within:text-violet-400 transition-colors" />
                                </div>
                                <input
                                    type="text"
                                    required
                                    value={id}
                                    onChange={(e) => setId(e.target.value)}
                                    placeholder="e.g. STU-10294 or Admin"
                                    className="w-full bg-black/20 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-violet-200/30 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-transparent transition-all backdrop-blur-sm"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-violet-200/80 uppercase tracking-wider ml-1">Password</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-violet-300/50 group-focus-within:text-violet-400 transition-colors" />
                                </div>
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full bg-black/20 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-violet-200/30 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-transparent transition-all backdrop-blur-sm"
                                />
                            </div>
                        </div>

                        <AnimatePresence>
                            {error && (
                                <motion.div 
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm p-3 rounded-lg flex items-center"
                                >
                                    <AlertCircle className="w-4 h-4 mr-2 shrink-0" /> {error}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-semibold py-4 rounded-2xl shadow-lg shadow-violet-500/25 transition-all flex items-center justify-center gap-2 mt-4"
                        >
                            {isLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>Access Dashboard <ArrowRight className="w-5 h-5" /></>
                            )}
                        </button>
                    </form>
                </div>
            </motion.div>
        </div>
    );
}
