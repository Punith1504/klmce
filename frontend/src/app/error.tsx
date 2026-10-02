'use client'; // Error components must be Client Components

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // 1. Instantly dispatch the stack trace to Sentry
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center text-white px-4">
      <div className="max-w-md w-full bg-gray-900 border border-red-500/20 rounded-3xl p-10 text-center shadow-[0_0_50px_rgba(239,68,68,0.1)]">
        <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-red-500/20">
          <svg className="w-10 h-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        
        <h2 className="text-2xl font-bold mb-3 tracking-tight">System Recovering</h2>
        
        <p className="text-gray-400 mb-10 text-sm leading-relaxed">
          The education matrix encountered an unexpected paradox. Our engineering team has been automatically notified with the full cryptographic telemetry trace.
        </p>
        
        <button
          onClick={() => reset()}
          className="w-full py-3.5 px-4 bg-white hover:bg-gray-100 text-black font-bold rounded-xl transition-all shadow-lg hover:shadow-white/20 active:scale-[0.98]"
        >
          Reboot Interface
        </button>
      </div>
    </div>
  );
}
