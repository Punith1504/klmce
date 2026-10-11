'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { AlertCircle, RefreshCw, Home, ShieldAlert, Copy, Check } from 'lucide-react';

export default function ERPErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const [showTrace, setShowTrace] = useState(false);

  useEffect(() => {
    console.error('[KLMCE ERP Exception Caught]:', error);
  }, [error]);

  const handleHardReload = () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  const handleCopyDiagnostics = () => {
    const report = [
      `Error: ${error?.name || 'Error'}: ${error?.message || 'Unknown error'}`,
      `Digest: ${error?.digest || 'N/A'}`,
      `URL: ${typeof window !== 'undefined' ? window.location.href : 'N/A'}`,
      `Time: ${new Date().toISOString()}`,
      `Stack Trace:`,
      error?.stack || 'No stack available'
    ].join('\n');

    try {
      navigator.clipboard.writeText(report);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Ignore copy error
    }
  };

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-4 sm:p-6 text-white font-sans">
      <div className="max-w-lg w-full bg-[#161226]/95 border border-amber-500/20 rounded-3xl p-6 sm:p-8 text-center shadow-[0_0_50px_rgba(245,158,11,0.1)] relative">
        <div className="w-16 h-16 bg-amber-500/10 rounded-2xl flex items-center justify-center mx-auto mb-5 border border-amber-500/20">
          <AlertCircle className="w-8 h-8 text-amber-400" />
        </div>

        <h2 className="text-xl sm:text-2xl font-bold text-white mb-2 tracking-tight">
          Portal Module Resynchronizing
        </h2>
        <p className="text-slate-400 text-xs sm:text-sm mb-6 leading-relaxed">
          The requested campus operational view encountered a transient network or data discrepancy. Your session is preserved.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-3 justify-center mb-6">
          <button
            onClick={handleHardReload}
            className="w-full sm:w-auto px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all shadow-lg text-sm flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Reload Module
          </button>

          <button
            onClick={() => reset()}
            className="w-full sm:w-auto px-5 py-3 bg-white/10 hover:bg-white/15 text-slate-200 font-semibold rounded-xl border border-white/10 transition text-sm flex items-center justify-center gap-2"
          >
            Try Again
          </button>

          <Link
            href="/"
            className="w-full sm:w-auto px-5 py-3 bg-white/5 hover:bg-white/10 text-slate-300 font-semibold rounded-xl border border-white/10 transition text-sm flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            Gateway
          </Link>
        </div>

        {/* Diagnostics accordion */}
        <div className="text-left border-t border-white/10 pt-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowTrace(prev => !prev)}
              className="text-[11px] text-slate-400 hover:text-slate-200 font-medium flex items-center gap-1.5"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
              <span>{showTrace ? 'Hide Diagnostics' : 'Show Diagnostics'}</span>
            </button>

            {showTrace && (
              <button
                onClick={handleCopyDiagnostics}
                className="text-[10px] text-indigo-300 hover:text-indigo-200 flex items-center gap-1 px-2 py-0.5 rounded bg-white/5"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            )}
          </div>

          {showTrace && (
            <div className="mt-2.5 p-3 bg-black/60 rounded-xl border border-white/10 font-mono text-[10px] text-slate-300 space-y-1 overflow-x-auto max-h-36">
              <div className="text-amber-300 font-bold">{error?.name || 'Error'}: {error?.message || 'Unknown runtime condition'}</div>
              {error?.digest && <div className="text-slate-400">Digest: {error.digest}</div>}
              {error?.stack && <pre className="text-slate-400 whitespace-pre-wrap mt-1">{error.stack}</pre>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
