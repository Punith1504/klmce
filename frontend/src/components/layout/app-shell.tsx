"use client";

import React from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from './sidebar';
import { TopNav } from './topnav';
import { CommandMenu } from '../command-menu';

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/' || pathname === '/login';

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#13111c] text-white">
      <CommandMenu />
      <Sidebar />
      <div className="flex-1 flex flex-col md:ml-64 overflow-hidden relative">
        <TopNav />
        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
