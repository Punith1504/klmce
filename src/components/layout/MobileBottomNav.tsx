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
  BookOpen,
  Calendar,
  PenTool,
  FileSignature,
  LayoutDashboard
} from "lucide-react";
import { useRole } from "@/lib/auth/roleContext";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const allStudentPages = [
  { name: 'Dashboard', href: '/student/dashboard', icon: LayoutDashboard },
  { name: 'My Classes', href: '/student/classes', icon: Calendar },
  { name: 'Attendance & Projections', href: '/student/attendance', icon: CalendarCheck },
  { name: 'Examinations & Results', href: '/student/results', icon: Award },
  { name: 'My Courses & Syllabus', href: '/student/courses', icon: BookOpen },
  { name: 'Academics & Analytics', href: '/student/academics', icon: BookOpen },
  { name: 'e-Assessments', href: '/student/assessments', icon: PenTool },
  { name: 'Placement Cell', href: '/student/placements', icon: Briefcase },
  { name: 'Fees & Payments', href: '/student/fees', icon: Banknote },
  { name: 'Services & Requests', href: '/student/requests', icon: FileSignature },
  { name: 'Campus (Library/Hostel)', href: '/student/campus', icon: Map },
  { name: 'Faculty Directory', href: '/student/departments', icon: Users },
];

const allFacultyPages = [
  { name: 'Dashboard', href: '/faculty/dashboard', icon: LayoutDashboard },
  { name: 'Timetable & Classes', href: '/faculty/timetable', icon: Calendar },
  { name: 'Attendance Entry', href: '/faculty/attendance', icon: CalendarCheck },
  { name: 'Course & LMS', href: '/faculty/courses', icon: BookOpen },
  { name: 'Assessments', href: '/faculty/assessments', icon: PenTool },
  { name: 'Marks Entry', href: '/faculty/marks', icon: Award },
  { name: 'Results Publishing', href: '/faculty/results', icon: Award },
  { name: 'Mentoring & Counseling', href: '/faculty/mentoring', icon: Users },
  { name: 'HR & Workload', href: '/faculty/hr', icon: Briefcase },
];

const allParentPages = [
  { name: 'Ward Overview', href: '/parent/dashboard', icon: LayoutDashboard },
  { name: 'Attendance & Alerts', href: '/parent/attendance', icon: CalendarCheck },
  { name: 'Academics & Results', href: '/parent/academics', icon: Award },
  { name: 'Fee Payments', href: '/parent/fees', icon: Banknote },
  { name: 'Mentor Communication', href: '/parent/communication', icon: MessageSquare },
];

const allAdminPages = [
  { name: 'Principal Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Student Directory', href: '/admin/students', icon: Users },
  { name: 'New Admissions', href: '/admin/admissions', icon: Users },
  { name: 'Bulk Data Imports', href: '/admin/bulk-upload', icon: FileSignature },
  { name: 'Timetable Management', href: '/admin/timetable', icon: Calendar },
  { name: 'Examination Cell', href: '/admin/examinations', icon: Award },
  { name: 'Finance & Accounts', href: '/admin/finance', icon: Banknote },
  { name: 'HR & Staff', href: '/admin/hr', icon: Briefcase },
  { name: 'Central Library', href: '/admin/library', icon: BookOpen },
  { name: 'Hostel Management', href: '/admin/hostel', icon: Building },
  { name: 'Transport Fleet', href: '/admin/transport', icon: Map },
  { name: 'Campus Canteen', href: '/admin/canteen', icon: Building },
  { name: 'Settings & Security', href: '/admin/settings', icon: LayoutDashboard },
];

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

  const getFullMenu = () => {
    if (pathname.startsWith("/faculty")) return allFacultyPages;
    if (pathname.startsWith("/parent")) return allParentPages;
    if (pathname.startsWith("/admin")) return allAdminPages;
    return allStudentPages;
  };

  const items = getNavItems();
  const fullMenu = getFullMenu();

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
          <SheetContent side="bottom" className="h-[85vh] p-0 rounded-t-3xl border-t border-white/15 bg-[#171329] text-white">
            <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mt-3" />
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <div>
                <span className="font-bold text-base text-slate-100 block">Complete Portal Navigation</span>
                <span className="text-xs text-indigo-300">KLMCE ERP • All Available Features</span>
              </div>
              <button 
                onClick={() => setSheetOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white bg-white/5 border border-white/10">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="p-4 overflow-y-auto max-h-[calc(85vh-90px)] pb-12 space-y-2">
              {navContent ? (
                <div onClick={() => setSheetOpen(false)}>{navContent}</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {fullMenu.map((page) => {
                    const isPageActive = pathname === page.href;
                    const PageIcon = page.icon;
                    return (
                      <Link
                        key={page.href}
                        href={page.href}
                        onClick={() => setSheetOpen(false)}
                        className={`flex items-center px-4 py-3 rounded-2xl text-xs font-semibold transition-all min-h-[46px] active:scale-[0.98] ${
                          isPageActive
                            ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-600/30'
                            : 'text-slate-300 bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 hover:text-white'
                        }`}
                      >
                        <PageIcon className={`w-4 h-4 mr-3 shrink-0 ${isPageActive ? 'text-white' : 'text-indigo-400'}`} />
                        <span className="truncate flex-1">{page.name}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
}
