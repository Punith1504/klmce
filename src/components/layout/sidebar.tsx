"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  Banknote, 
  Briefcase, 
  PenTool, 
  Calendar, 
  CalendarCheck, 
  Award, 
  FileSignature, 
  Map, 
  Building, 
  X, 
  BarChart3, 
  Settings, 
  UtensilsCrossed 
} from 'lucide-react';
import { useRole } from '@/lib/auth/roleContext';

const studentNavItems = [
  { name: 'Student Dashboard', href: '/student/dashboard', icon: LayoutDashboard },
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

const facultyNavItems = [
  { name: 'Faculty Dashboard', href: '/faculty/dashboard', icon: LayoutDashboard },
  { name: 'Timetable & Classes', href: '/faculty/timetable', icon: Calendar },
  { name: 'Attendance Entry', href: '/faculty/attendance', icon: CalendarCheck },
  { name: 'Course & LMS', href: '/faculty/courses', icon: BookOpen },
  { name: 'Assessments', href: '/faculty/assessments', icon: PenTool },
  { name: 'Marks Entry', href: '/faculty/marks', icon: Award },
  { name: 'Results Publishing', href: '/faculty/results', icon: Award },
  { name: 'Mentoring & Mentees', href: '/faculty/mentoring', icon: Users },
  { name: 'HR & Workload', href: '/faculty/hr', icon: Briefcase },
];

const parentNavItems = [
  { name: 'Parent Dashboard', href: '/parent/dashboard', icon: LayoutDashboard },
  { name: 'Attendance & Alerts', href: '/parent/attendance', icon: CalendarCheck },
  { name: 'Academics & Results', href: '/parent/academics', icon: Award },
  { name: 'Fee Payments', href: '/parent/fees', icon: Banknote },
  { name: 'Communication & Mentors', href: '/parent/communication', icon: FileSignature },
];

const adminNavItems = [
  { name: 'Principal Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Student Info & Roster', href: '/admin/students', icon: Users },
  { name: 'New Admissions', href: '/admin/admissions', icon: Users },
  { name: 'Admissions Kanban Board', href: '/admin/admissions/board', icon: Users },
  { name: 'Campus Analytics', href: '/admin/analytics', icon: BarChart3 },
  { name: 'Bulk Data Imports', href: '/admin/bulk-upload', icon: FileSignature },
  { name: 'Academics & Timetable', href: '/admin/timetable', icon: Calendar },
  { name: 'Examination Cell', href: '/admin/examinations', icon: Award },
  { name: 'Finance & Accounts', href: '/admin/finance', icon: Banknote },
  { name: 'HR & Workload', href: '/admin/hr', icon: Briefcase },
  { name: 'Central Library', href: '/admin/library', icon: BookOpen },
  { name: 'Hostel Management', href: '/admin/hostel', icon: Building },
  { name: 'Hostel Room Allocations', href: '/admin/hostels/allocation', icon: Building },
  { name: 'Transport Logistics', href: '/admin/transport', icon: Map },
  { name: 'Campus Canteen', href: '/admin/canteen', icon: UtensilsCrossed },
  { name: 'System Settings', href: '/admin/settings', icon: Settings },
];

interface SidebarProps {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export function Sidebar({ mobileOpen, onCloseMobile }: SidebarProps = {}) {
  const pathname = usePathname();
  const { role } = useRole();

  const isFaculty = pathname.startsWith('/faculty') || (!pathname.startsWith('/admin') && !pathname.startsWith('/parent') && !pathname.startsWith('/student') && role === 'FACULTY');
  const isParent = pathname.startsWith('/parent') || (!pathname.startsWith('/admin') && !pathname.startsWith('/faculty') && !pathname.startsWith('/student') && role === 'PARENT');
  const isAdmin = pathname.startsWith('/admin') || (!pathname.startsWith('/faculty') && !pathname.startsWith('/parent') && !pathname.startsWith('/student') && (role === 'SUPER_ADMIN' || role === 'INSTITUTION_ADMIN'));

  const navItems = isFaculty 
    ? facultyNavItems 
    : isParent 
      ? parentNavItems 
      : isAdmin
        ? adminNavItems
        : studentNavItems;

  const roleBadge = isFaculty 
    ? "Faculty Portal" 
    : isParent 
      ? "Parent Portal" 
      : isAdmin 
        ? "Admin Console" 
        : "Student Portal";

  const renderNavList = (isMobileView: boolean) => (
    <div className="flex flex-col h-full bg-[#161226]/95 backdrop-blur-xl">
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-5 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center font-black text-white text-xs shadow-[0_0_12px_rgba(99,102,241,0.4)] shrink-0">
            KLM
          </div>
          <div className="min-w-0">
            <span className="font-bold text-sm text-slate-50 tracking-tight block truncate">KLMCE Campus</span>
            <span className="text-[10px] text-indigo-300 font-medium block truncate">{roleBadge}</span>
          </div>
        </div>
        {isMobileView && onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
            aria-label="Close Navigation"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation Scrollable Body */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto overscroll-contain">
        {navItems.map((item) => {
          const isDashboard = item.href.endsWith('/dashboard');
          const isActive = isDashboard ? pathname === item.href : pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => {
                if (isMobileView && onCloseMobile) {
                  onCloseMobile();
                }
              }}
              className={`flex items-center px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all min-h-[42px] ${
                isActive 
                  ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-600/30' 
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className={`w-4 h-4 mr-3 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span className="truncate">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Institutional Footer Pill */}
      <div className="p-3 border-t border-white/10 shrink-0 bg-black/20 text-center">
        <p className="text-[10px] text-slate-500 font-mono">KLMCE Autonomous ERP v4.8</p>
      </div>
    </div>
  );

  return (
    <>
      {/* 1. Desktop Sidebar: Permanent, In-Flow, Never Vanishes */}
      <aside className="hidden md:flex flex-col w-64 shrink-0 h-full border-r border-white/10 z-30 select-none">
        {renderNavList(false)}
      </aside>

      {/* 2. Mobile Drawer & Backdrop */}
      {mobileOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 md:hidden animate-in fade-in duration-200"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <aside 
            className="fixed inset-y-0 left-0 w-72 max-w-[85vw] z-50 md:hidden shadow-2xl flex flex-col animate-in slide-in-from-left duration-200"
          >
            {renderNavList(true)}
          </aside>
        </>
      )}
    </>
  );
}
