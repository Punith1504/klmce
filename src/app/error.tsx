'use client'; // Error components must be Client Components

import * as Sentry from '@sentry/nextjs';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  AlertTriangle, 
  RotateCcw, 
  Home, 
  ChevronDown, 
  ChevronUp, 
  Copy, 
  Check, 
  GraduationCap, 
  Briefcase, 
  Users, 
  ShieldCheck 
} from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [showDetails, setShowDetails] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // 1. Safely dispatch exception to Sentry without risking secondary error
    try {
      Sentry.captureException(error);
    } catch (e) {
      console.warn('Sentry capture failed:', e);
    }
    // 2. Also log to console for instant developer feedback
    console.error('Unhandled Application Exception caught by error.tsx:', error);
  }, [error]);

  const handleReboot = () => {
    try {
      if (typeof window !== 'undefined') {
        sessionStorage.clear();
      }
    } catch {
      // Ignore storage errors
    }
    window.location.href = '/';
  };

  const handleCopyDiagnostics = () => {
    const diagnosticPayload = [
      `Error: ${error?.name || 'Error'}: ${error?.message || 'Unknown error'}`,
      `Digest: ${error?.digest || 'N/A'}`,
      `Time: ${new Date().toISOString()}`,
      `User Agent: ${typeof navigator !== 'undefined' ? navigator.userAgent : 'N/A'}`,
      `Stack Trace:`,
      error?.stack || 'No stack trace available'
    ].join('\n');

    try {
      navigator.clipboard.writeText(diagnosticPayload);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="min-h-screen bg-[#070514] flex flex-col items-center justify-center text-white px-4 py-8 font-sans selection:bg-rose-500/30">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-red-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-xl w-full bg-[#161226]/90 backdrop-blur-2xl border border-red-500/25 rounded-3xl p-6 sm:p-10 text-center shadow-[0_0_60px_rgba(239,68,68,0.15)] relative z-10 space-y-6">
        
        {/* Animated Alert Badge */}
        <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto border border-red-500/25 shadow-inner">
          <AlertTriangle className="w-10 h-10 text-red-500 animate-pulse" />
        </div>
        
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-2">
            System Recovering
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm leading-relaxed max-w-md mx-auto">
            The institutional matrix encountered an unexpected paradox. Telemetry trace has been logged. Use the recovery controls below to return safely.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={handleReboot}
            className="w-full sm:w-auto flex-1 py-3.5 px-6 bg-white hover:bg-slate-100 text-slate-950 font-bold rounded-xl transition-all shadow-lg hover:shadow-white/20 active:scale-[0.98] flex items-center justify-center gap-2 text-sm"
          >
            <Home className="w-4 h-4 text-slate-950" />
            Reboot Interface
          </button>
          
          <button
            onClick={() => reset()}
            className="w-full sm:w-auto py-3.5 px-5 bg-white/10 hover:bg-white/15 text-white font-semibold rounded-xl border border-white/15 transition-all active:scale-[0.98] flex items-center justify-center gap-2 text-sm"
          >
            <RotateCcw className="w-4 h-4 text-slate-300" />
            Try Again
          </button>
        </div>

        {/* Quick Portal Switcher */}
        <div className="pt-4 border-t border-white/10">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-3">
            Quick Portal Navigation
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <Link
              href="/student/dashboard"
              className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-left transition group"
            >
              <div className="flex items-center gap-2 text-indigo-400 mb-1">
                <GraduationCap className="w-4 h-4" />
                <span className="text-xs font-bold text-white group-hover:text-indigo-300">Student</span>
              </div>
              <p className="text-[10px] text-slate-400 truncate">Dashboard</p>
            </Link>

            <Link
              href="/faculty/dashboard"
              className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-left transition group"
            >
              <div className="flex items-center gap-2 text-violet-400 mb-1">
                <Briefcase className="w-4 h-4" />
                <span className="text-xs font-bold text-white group-hover:text-violet-300">Faculty</span>
              </div>
              <p className="text-[10px] text-slate-400 truncate">Roster & Marks</p>
            </Link>

            <Link
              href="/parent/dashboard"
              className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-left transition group"
            >
              <div className="flex items-center gap-2 text-emerald-400 mb-1">
                <Users className="w-4 h-4" />
                <span className="text-xs font-bold text-white group-hover:text-emerald-300">Parent</span>
              </div>
              <p className="text-[10px] text-slate-400 truncate">Attendance</p>
            </Link>

            <Link
              href="/admin/dashboard"
              className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-left transition group"
            >
              <div className="flex items-center gap-2 text-amber-400 mb-1">
                <ShieldCheck className="w-4 h-4" />
                <span className="text-xs font-bold text-white group-hover:text-amber-300">Admin</span>
              </div>
              <p className="text-[10px] text-slate-400 truncate">Control Hub</p>
            </Link>
          </div>
        </div>

        {/* Expandable Diagnostic Information */}
        <div className="pt-2 text-left">
          <button
            onClick={() => setShowDetails(prev => !prev)}
            className="flex items-center justify-between w-full px-3 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 bg-black/30 hover:bg-black/50 rounded-xl transition border border-white/5"
          >
            <span>Technical Diagnostic Telemetry</span>
            {showDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {showDetails && (
            <div className="mt-2.5 p-3.5 bg-black/60 rounded-xl border border-white/10 font-mono text-[11px] text-slate-300 space-y-2 relative">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <span className="text-rose-400 font-bold truncate">
                  {error?.name || 'Error'}: {error?.message || 'Unknown runtime error'}
                </span>
                <button
                  onClick={handleCopyDiagnostics}
                  className="px-2 py-1 rounded bg-white/10 hover:bg-white/20 text-slate-200 text-[10px] font-sans flex items-center gap-1 shrink-0 ml-2"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  {copied ? 'Copied' : 'Copy Report'}
                </button>
              </div>

              {error?.digest && (
                <div className="text-[10px] text-slate-400">
                  Digest: <span className="text-slate-200">{error.digest}</span>
                </div>
              )}

              {error?.stack && (
                <pre className="max-h-40 overflow-y-auto overflow-x-auto text-[10px] text-slate-400 whitespace-pre-wrap break-all pt-1 leading-relaxed">
                  {error.stack}
                </pre>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
