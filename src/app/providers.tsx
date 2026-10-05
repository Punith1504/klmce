"use client";

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store';
import { useRouter } from 'next/navigation';

export default function GlobalProvidersAndLayout({ children }: { children: ReactNode }) {
  // Ensure QueryClient is stable across re-renders
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute
        refetchOnWindowFocus: false,
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      <AppShell>{children}</AppShell>
    </QueryClientProvider>
  );
}

function AppShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { role, name, clearAuth } = useAuthStore();
  
  // If user is not logged in (e.g. on /auth/login), bypass the AppShell wrapper completely
  if (!role) {
    return <>{children}</>;
  }

  const handleLogout = () => {
    // In a real flow, you'd also call POST /api/v1/auth/logout to clear HttpOnly cookies
    clearAuth();
    router.push('/auth/login');
  };

  return (
    <div className="flex h-screen bg-gray-950 text-gray-100 font-sans selection:bg-indigo-500/30 overflow-hidden">
      
      {/* Global Context-Aware Sidebar */}
      <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col hidden md:flex shrink-0">
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-black text-white shadow-lg">
                K
             </div>
             <span className="font-bold tracking-tight text-white">KLMCE ERP</span>
          </div>
          <div className="mt-4 px-3 py-1.5 bg-gray-950 rounded-md border border-gray-800 inline-block">
             <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-400">{role.replace('_', ' ')}</span>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          
          {/* Admin Links */}
          {(role === 'SUPER_ADMIN' || role === 'INSTITUTION_ADMIN') && (
            <>
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 mt-4 px-3">Infrastructure</div>
              <SidebarLink href="/admin/dashboard" icon="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z">
                Control Plane
              </SidebarLink>
              <SidebarLink href="/admin/timetable" icon="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z">
                Timetable Matrix
              </SidebarLink>
            </>
          )}

          {/* Faculty Links */}
          {role === 'FACULTY' && (
            <>
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 mt-4 px-3">Teaching</div>
              <SidebarLink href="/faculty/attendance" icon="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z">
                QR Broadcast
              </SidebarLink>
            </>
          )}

          {/* Student Links */}
          {role === 'STUDENT' && (
            <>
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 mt-4 px-3">Academics</div>
              <SidebarLink href="/student/scanner" icon="M3 4a1 1 0 011-1h4a1 1 0 010 2H5v3a1 1 0 01-2 0V4zm14-1a1 1 0 011 1v3a1 1 0 01-2 0V5h-3a1 1 0 010-2h4zM4 15a1 1 0 012 0v3h3a1 1 0 010 2H4a1 1 0 01-1-1v-4zm15-1a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 010-2h3v-3a1 1 0 011-1z">
                Scan Attendance
              </SidebarLink>
            </>
          )}

          {/* Parent Links */}
          {role === 'PARENT' && (
            <>
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 mt-4 px-3">Monitoring</div>
              <SidebarLink href="/parent/dashboard" icon="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z">
                Parent Portal
              </SidebarLink>
            </>
          )}
        </nav>

        <div className="p-4 border-t border-gray-800">
           <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 truncate">
                 <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-gray-400">{name?.charAt(0) || 'U'}</span>
                 </div>
                 <span className="text-sm font-medium text-gray-300 truncate">{name || 'User'}</span>
              </div>
              <button onClick={handleLogout} className="text-gray-500 hover:text-red-400 p-2 transition-colors">
                 <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                 </svg>
              </button>
           </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-gray-950 relative">
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </main>

    </div>
  );
}

function SidebarLink({ href, icon, children }: { href: string, icon: string, children: ReactNode }) {
  return (
    <Link href={href} className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-xl transition-all group">
      <svg className="w-5 h-5 text-gray-500 group-hover:text-indigo-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
      </svg>
      {children}
    </Link>
  );
}
