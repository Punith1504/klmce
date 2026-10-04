"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, BookOpen, Banknote, Menu, Briefcase, PenTool, Calendar, CalendarCheck, Award, FileSignature, Map } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';

const studentNavItems = [
  { name: 'Student Dashboard', href: '/student/dashboard', icon: LayoutDashboard },
  { name: 'My Classes', href: '/student/classes', icon: Calendar },
  { name: 'Attendance & Projections', href: '/student/attendance', icon: CalendarCheck },
  { name: 'Examinations & Results', href: '/student/results', icon: Award },
  { name: 'My Courses', href: '/student/courses', icon: BookOpen },
  { name: 'Academics & Analytics', href: '/student/academics', icon: BookOpen },
  { name: 'e-Assessments', href: '/student/assessments', icon: PenTool },
  { name: 'Placement Cell', href: '/student/placements', icon: Briefcase },
  { name: 'Fees & Payments', href: '/student/fees', icon: Banknote },
  { name: 'Services & Requests', href: '/student/requests', icon: FileSignature },
  { name: 'Campus (Library/Hostel)', href: '/student/campus', icon: Map },
  { name: 'Faculty Directory', href: '/student/departments', icon: Users },
];

const facultyNavItems = [
  { name: 'Faculty Dashboard', href: '/faculty/dashboard', icon: LayoutDashboard },
  { name: 'Timetable & Classes', href: '/faculty/timetable', icon: Calendar },
  { name: 'Attendance Entry', href: '/faculty/attendance', icon: CalendarCheck },
  { name: 'Course & LMS', href: '/faculty/courses', icon: BookOpen },
  { name: 'Assessments', href: '/faculty/assessments', icon: PenTool },
  { name: 'Marks Entry', href: '/faculty/marks', icon: Award },
  { name: 'Mentoring', href: '/faculty/mentoring', icon: Users },
  { name: 'HR & Workload', href: '/faculty/hr', icon: Briefcase },
];

const parentNavItems = [
  { name: 'Parent Dashboard', href: '/parent/dashboard', icon: LayoutDashboard },
  { name: 'Attendance & Alerts', href: '/parent/attendance', icon: CalendarCheck },
  { name: 'Academics & Results', href: '/parent/academics', icon: Award },
  { name: 'Fee Payments', href: '/parent/fees', icon: Banknote },
  { name: 'Communication', href: '/parent/communication', icon: FileSignature },
];

const adminNavItems = [
  { name: 'Principal Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Student Info & Roster', href: '/admin/students', icon: Users },
  { name: 'New Admissions', href: '/admin/admissions', icon: Users },
  { name: 'Bulk Data Imports', href: '/admin/bulk-upload', icon: FileSignature },
  { name: 'Academics & Timetable', href: '/admin/timetable', icon: Calendar },
  { name: 'Examination Cell', href: '/admin/examinations', icon: Award },
  { name: 'Finance & Accounts', href: '/admin/finance', icon: Banknote },
  { name: 'HR & Workload', href: '/admin/hr', icon: Briefcase },
  { name: 'Central Library', href: '/admin/library', icon: BookOpen },
  { name: 'Hostel Management', href: '/admin/hostel', icon: Map },
  { name: 'Transport Logistics', href: '/admin/transport', icon: Map },
];

export function Sidebar() {
  const pathname = usePathname();
  const isFaculty = pathname.startsWith('/faculty');
  const isParent = pathname.startsWith('/parent');
  const isAdmin = pathname.startsWith('/admin');
  
  const navItems = isFaculty 
    ? facultyNavItems 
    : isParent 
      ? parentNavItems 
      : isAdmin
        ? adminNavItems
        : studentNavItems;

  const NavContent = () => (
    <div className="flex flex-col h-full bg-[#221F32]/80 backdrop-blur-md border-r border-white/10">
      <div className="h-16 flex items-center px-6 border-b border-white/10">
        <img src="/college-logo.png" alt="KLMCEW Logo" className="w-10 h-10 object-contain mr-3 drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]" />
        <span className="font-bold text-lg text-slate-50 tracking-tight">KSRMMS ERP</span>
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
