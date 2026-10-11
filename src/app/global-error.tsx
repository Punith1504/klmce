'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';
import { AlertTriangle, Home, RotateCcw } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    try {
      Sentry.captureException(error);
    } catch (e) {
      console.warn('Sentry global error capture failed:', e);
    }
    console.error('Fatal Root Application Error:', error);
  }, [error]);

  const handleReboot = () => {
    try {
      if (typeof window !== 'undefined') {
        sessionStorage.clear();
      }
    } catch {}
    window.location.href = '/';
  };

  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#070514] flex flex-col items-center justify-center text-white px-4 py-8 font-sans">
        <div className="max-w-md w-full bg-[#161226]/90 backdrop-blur-2xl border border-red-500/25 rounded-3xl p-8 text-center shadow-[0_0_60px_rgba(239,68,68,0.15)] space-y-6">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto border border-red-500/25">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white mb-2">
              System Recovering
            </h1>
            <p className="text-slate-400 text-xs leading-relaxed">
              A foundational paradox was intercepted at the application shell. Use the recovery controls below to restore normal operations.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleReboot}
              className="flex-1 py-3 px-4 bg-white hover:bg-slate-100 text-slate-950 font-bold rounded-xl transition text-sm flex items-center justify-center gap-2"
            >
              <Home className="w-4 h-4" />
              Reboot Interface
            </button>
            <button
              onClick={() => reset()}
              className="py-3 px-4 bg-white/10 hover:bg-white/15 text-white font-semibold rounded-xl border border-white/10 transition text-sm flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Retry
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
