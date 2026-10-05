"use client";

import React from 'react';
import { usePathname } from 'next/navigation';
import { ChevronRight, Search } from 'lucide-react';
import { UserButton, useUser, SignInButton } from '@clerk/nextjs';

export function TopNav() {
  const pathname = usePathname();
  const paths = pathname.split('/').filter(p => p);
  const { user, isLoaded, isSignedIn } = useUser();

  return (
    <header className="sticky top-0 z-40 w-full h-16 bg-[#221F32]/80 backdrop-blur-md border-b border-white/10 flex items-center justify-between px-4 md:px-8">
      {/* Breadcrumbs */}
      <div className="flex items-center space-x-2 text-sm text-slate-400 capitalize pl-10 md:pl-0">
        <span className="hover:text-slate-50 cursor-pointer transition">Home</span>
        {paths.map((path, i) => (
          <React.Fragment key={path}>
            <ChevronRight className="w-4 h-4 opacity-50" />
            <span className={i === paths.length - 1 ? 'text-slate-50 font-medium' : 'hover:text-slate-50 cursor-pointer transition'}>
              {path}
            </span>
          </React.Fragment>
        ))}
      </div>

      <div className="flex items-center">
        {/* Search Input */}
        <div className="hidden md:flex relative group mr-6">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search anything..." 
            className="bg-black/20 border border-white/10 rounded-full pl-11 pr-4 py-1.5 text-sm text-slate-50 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 w-64 transition-all"
          />
        </div>

        {/* User Profile */}
        <div className="flex items-center space-x-4">
          {isLoaded && isSignedIn ? (
            <>
              <div className="hidden sm:flex flex-col items-end mr-2">
                <span className="text-sm font-medium text-slate-50 leading-none mb-1">
                  {user.fullName || user.firstName || 'User'}
                </span>
                <span className="text-xs text-slate-400 leading-none">
                  {user.primaryEmailAddress?.emailAddress || 'User Role'}
                </span>
              </div>
              <UserButton afterSignOutUrl="/auth/login" />
            </>
          ) : (
            <div className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm text-white font-medium cursor-pointer transition">
              <SignInButton mode="modal">Sign In</SignInButton>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
