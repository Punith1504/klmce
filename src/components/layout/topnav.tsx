"use client";

import React from 'react';
import { usePathname } from 'next/navigation';
import { ChevronRight, Search, LogOut } from 'lucide-react';
import { UserButton, useUser, SignInButton } from '@clerk/nextjs';
import { useRole } from '@/lib/auth/roleContext';
import { RoleSwitcher } from './RoleSwitcher';

export function TopNav() {
  const pathname = usePathname();
  const paths = pathname.split('/').filter(p => p);
  const { user: clerkUser, isLoaded: isClerkLoaded, isSignedIn: isClerkSignedIn } = useUser();
  const { user: roleUser, role, logout } = useRole();

  const displayName = roleUser?.name || clerkUser?.fullName || clerkUser?.firstName || 'User';
  const displayRoleTitle = roleUser?.roleTitle || roleUser?.role?.replace('_', ' ') || 'Institutional Member';

  return (
    <header className="sticky top-0 z-40 w-full h-14 sm:h-16 bg-[#161226]/95 backdrop-blur-xl border-b border-white/10 flex items-center justify-between px-3 sm:px-6">
      {/* Mobile Branding / Breadcrumbs */}
      <div className="flex items-center space-x-1.5 text-xs text-slate-400 capitalize pl-10 md:pl-0 min-w-0">
        <span className="font-extrabold text-indigo-400 tracking-tight text-sm hidden sm:inline">KLMCE</span>
        <span className="hidden sm:inline opacity-30 text-slate-600">/</span>
        <span className="text-slate-100 font-bold text-xs tracking-wide uppercase bg-white/5 px-2 py-0.5 rounded-md border border-white/5 truncate max-w-[110px] sm:max-w-none">
          {paths[paths.length - 1]?.replace('-', ' ') || 'Dashboard'}
        </span>
      </div>

      <div className="flex items-center gap-3 md:gap-4">
        {/* Role Switcher Pill */}
        <RoleSwitcher />

        {/* Global Search Input */}
        <div className="hidden lg:flex relative group">
          <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search roll no, course, bus..." 
            className="bg-black/25 border border-white/10 rounded-full pl-9 pr-4 py-1 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 w-56 transition-all"
          />
        </div>

        {/* User Profile */}
        <div className="flex items-center gap-2 pl-2 border-l border-white/10">
          <div className="hidden sm:flex flex-col items-end mr-1 text-right">
            <span className="text-xs font-semibold text-slate-100 leading-none mb-1">
              {displayName}
            </span>
            <span className="text-[10px] text-indigo-300 font-medium leading-none">
              {displayRoleTitle}
            </span>
          </div>

          {isClerkLoaded && isClerkSignedIn ? (
            <UserButton />
          ) : (
            <button
              onClick={() => logout()}
              title="Sign Out of Portal"
              className="p-1.5 rounded-lg bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 border border-white/10 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
