"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Home, 
  CalendarCheck, 
  Award, 
  Banknote, 
  Menu, 
  Users, 
  MessageSquare, 
  Map, 
  Building,
  GraduationCap,
  X,
  Briefcase,
  BookOpen
} from "lucide-react";
import { useRole } from "@/lib/auth/roleContext";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export function MobileBottomNav({ navContent }: { navContent?: React.ReactNode }) {
  const pathname = usePathname();
  const { role } = useRole();
  const [sheetOpen, setSheetOpen] = useState(false);

  // Define 4 primary quick-action tabs for each role
  const getNavItems = () => {
    if (pathname.startsWith("/faculty")) {
      return [
        { label: "Home", href: "/faculty/dashboard", icon: Home },
        { label: "Attendance", href: "/faculty/attendance", icon: CalendarCheck },
        { label: "Marks", href: "/faculty/marks", icon: Award },
        { label: "Mentoring", href: "/faculty/mentoring", icon: Users },
      ];
    }
    if (pathname.startsWith("/parent")) {
      return [
        { label: "Ward", href: "/parent/dashboard", icon: Home },
        { label: "Attendance", href: "/parent/attendance", icon: CalendarCheck },
        { label: "Fee Pay", href: "/parent/fees", icon: Banknote },
        { label: "Mentor", href: "/parent/communication", icon: MessageSquare },
      ];
    }
    if (pathname.startsWith("/admin")) {
      return [
        { label: "Admin", href: "/admin/dashboard", icon: Home },
        { label: "Students", href: "/admin/students", icon: Users },
        { label: "Transport", href: "/admin/transport", icon: Map },
        { label: "Hostel", href: "/admin/hostel", icon: Building },
      ];
    }
    // Default Student
    return [
      { label: "Home", href: "/student/dashboard", icon: Home },
      { label: "Attendance", href: "/student/attendance", icon: CalendarCheck },
      { label: "Grades", href: "/student/results", icon: Award },
      { label: "Fees", href: "/student/fees", icon: Banknote },
    ];
  };

  const items = getNavItems();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#141024]/95 backdrop-blur-2xl border-t border-white/10 px-2 pt-1.5 pb-2 safe-bottom shadow-[0_-4px_24px_rgba(0,0,0,0.5)]">
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {items.map((tab) => {
          const isActive = pathname === tab.href;
          const Icon = tab.icon;

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all min-w-[58px] min-h-[46px] active:scale-95 ${
                isActive 
                  ? "text-indigo-400 font-bold" 
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? "scale-110" : ""}`} />
                {isActive && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_8px_#6366f1]" />
                )}
              </div>
              <span className="text-[10px] mt-1 tracking-tight leading-none">{tab.label}</span>
            </Link>
          );
        })}

        {/* 5th Button: Open Full Drawer Menu */}
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <button
              type="button"
              className="flex flex-col items-center justify-center py-1 px-3 rounded-xl text-slate-400 hover:text-slate-200 transition-all min-w-[58px] min-h-[46px] active:scale-95"
            >
              <Menu className="w-5 h-5" />
              <span className="text-[10px] mt-1 tracking-tight leading-none">All Pages</span>
            </button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[80vh] p-0 rounded-t-3xl border-t border-white/15 bg-[#171329] text-white">
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <span className="font-bold text-sm text-slate-200">Complete Campus Menu</span>
              <button 
                onClick={() => setSheetOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-white/5">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto max-h-[calc(80vh-70px)] pb-10" onClick={() => setSheetOpen(false)}>
              {navContent}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
}
