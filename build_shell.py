import os

os.makedirs("src/components/layout", exist_ok=True)

sidebar_content = """\"use client\";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, BookOpen, Banknote, Menu } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';

const navItems = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Admissions', href: '/admin/admissions', icon: Users },
  { name: 'Academics', href: '/admin/academics', icon: BookOpen },
  { name: 'Finance', href: '/admin/finance', icon: Banknote },
];

export function Sidebar() {
  const pathname = usePathname();

  const NavContent = () => (
    <div className="flex flex-col h-full bg-[#1a1625] border-r border-white/5">
      <div className="h-16 flex items-center px-6 border-b border-white/5">
        <div className="w-8 h-8 rounded bg-indigo-500 flex items-center justify-center font-bold text-white mr-3">E</div>
        <span className="font-bold text-lg text-white">Enterprise ERP</span>
      </div>
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive ? 'bg-indigo-500 text-white shadow' : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className="w-5 h-5 mr-3 shrink-0" />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (w-64 = 16rem = 256px) */}
      <aside className="hidden md:flex flex-col w-64 fixed inset-y-0 z-50">
        <NavContent />
      </aside>

      {/* Mobile Sidebar Trigger (Header part usually, but placed here for isolation) */}
      <div className="md:hidden fixed top-0 left-0 z-50 p-4">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
              <Menu className="w-6 h-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64 border-none bg-transparent">
            <NavContent />
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
"""

topnav_content = """\"use client\";

import React from 'react';
import { usePathname } from 'next/navigation';
import { ChevronRight, User as UserIcon } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export function TopNav() {
  const pathname = usePathname();
  const paths = pathname.split('/').filter(p => p);

  return (
    <header className="sticky top-0 z-40 w-full h-16 bg-[#1a1625]/80 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-4 md:px-8">
      {/* Breadcrumbs */}
      <div className="flex items-center space-x-2 text-sm text-slate-400 capitalize pl-10 md:pl-0">
        <span className="hover:text-white cursor-pointer transition">Home</span>
        {paths.map((path, i) => (
          <React.Fragment key={path}>
            <ChevronRight className="w-4 h-4 opacity-50" />
            <span className={i === paths.length - 1 ? 'text-white font-medium' : 'hover:text-white cursor-pointer transition'}>
              {path}
            </span>
          </React.Fragment>
        ))}
      </div>

      {/* User Profile */}
      <div className="flex items-center space-x-4">
        <div className="hidden sm:flex flex-col items-end mr-2">
          <span className="text-sm font-medium text-white leading-none mb-1">System Admin</span>
          <span className="text-xs text-slate-400 leading-none">IT Operations</span>
        </div>
        <Avatar className="h-9 w-9 bg-indigo-500 border border-white/10 cursor-pointer flex items-center justify-center">
          <AvatarFallback className="bg-transparent text-white"><UserIcon className="w-4 h-4"/></AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
"""

appshell_content = """\"use client\";

import React from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from './sidebar';
import { TopNav } from './topnav';

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/' || pathname === '/login';

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#13111c] text-white">
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
"""

layout_content = """import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/layout/app-shell";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Enterprise ERP",
  description: "Global ERP Layout Shell",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-background text-foreground`}>
        <AppShell>
          {children}
        </AppShell>
      </body>
    </html>
  );
}
"""

with open("src/components/layout/sidebar.tsx", "w", encoding="utf-8") as f: f.write(sidebar_content)
with open("src/components/layout/topnav.tsx", "w", encoding="utf-8") as f: f.write(topnav_content)
with open("src/components/layout/app-shell.tsx", "w", encoding="utf-8") as f: f.write(appshell_content)
with open("src/app/layout.tsx", "w", encoding="utf-8") as f: f.write(layout_content)
print("Enterprise Shell built successfully.")
