"use client";

import React from 'react';
import { usePathname } from 'next/navigation';
import { ChevronRight, User as UserIcon, Search, LogOut } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useDemoStore } from '@/store/useDemoStore';
import { useRouter } from 'next/navigation';

export function TopNav() {
  const pathname = usePathname();
  const paths = pathname.split('/').filter(p => p);
  const { currentUser, logout } = useDemoStore();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/auth/login');
  };

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
          <div className="hidden sm:flex flex-col items-end mr-2">
            <span className="text-sm font-medium text-slate-50 leading-none mb-1">{currentUser ? currentUser.name : 'Guest'}</span>
            <span className="text-xs text-slate-400 leading-none">{currentUser ? currentUser.role : 'Visitor'}</span>
          </div>
          <div 
            onClick={handleLogout}
            className="flex items-center justify-center w-9 h-9 rounded-full bg-indigo-500/20 hover:bg-red-500/20 text-indigo-400 hover:text-red-400 border border-white/10 cursor-pointer transition-colors"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </div>
        </div>
      </div>
    </header>
  );
}
