"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, FileText, CheckCircle, GraduationCap, Banknote, Users, PenTool, Calendar, CalendarCheck, Award, Map, FileSignature } from 'lucide-react';

export function CommandMenu() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  if (!open) return null;

  const navigate = (href: string) => {
    setOpen(false);
    setQuery("");
    router.push(href);
  };

  const pages = [
    { icon: FileText, label: "Student Academics & Analytics", href: "/student/academics" },
    { icon: Calendar, label: "My Classes Schedule", href: "/student/classes" },
    { icon: CalendarCheck, label: "Attendance & Projections", href: "/student/attendance" },
    { icon: Award, label: "Examinations & Results", href: "/student/results" },
    { icon: GraduationCap, label: "Admissions Board", href: "/admin/admissions/board" },
    { icon: Users, label: "Departments & Faculty", href: "/student/departments" },
    { icon: FileText, label: "Academics", href: "/student/courses" },
    { icon: PenTool, label: "e-Assessments Hub", href: "/student/assessments" },
    { icon: GraduationCap, label: "Placements", href: "/student/placements" },
    { icon: Banknote, label: "Fees & Payments", href: "/student/fees" },
    { icon: FileSignature, label: "Services & Requests", href: "/student/requests" },
    { icon: Map, label: "Campus (Library/Hostel)", href: "/student/campus" },
    { icon: Banknote, label: "Finance", href: "/admin/finance" },
    { icon: Users, label: "Students Directory", href: "/admin/students" },
  ];

  const quickActions = [
    { icon: Banknote, label: "Collect Fee", href: "/admin/finance" },
    { icon: CheckCircle, label: "Mark Attendance", href: "/admin/academics" },
  ];

  const searchResults = [
    { label: "Rahul Sharma (STU-001)", href: "/admin/students/1" },
    { label: "Priya Patel (STU-002)", href: "/admin/students/2" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" 
        onClick={() => setOpen(false)}
      />

      {/* Dialog */}
      <div className="relative w-full max-w-xl overflow-hidden rounded-xl border border-white/10 bg-[#13111c] shadow-2xl text-white animate-in fade-in zoom-in-95 duration-200">
        
        {/* Search Input */}
        <div className="flex items-center border-b border-white/10 px-4">
          <Search className="w-5 h-5 text-indigo-400 shrink-0" />
          <input
            autoFocus
            type="text"
            placeholder="Type a command or search..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent px-3 py-4 outline-none text-sm placeholder:text-slate-500 font-medium"
          />
        </div>

        {/* Results */}
        <div className="max-h-[60vh] overflow-y-auto p-2 scrollbar-none">
          
          <div className="mb-3 mt-1">
            <div className="px-3 py-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Pages</div>
            {pages.map(page => (
              <button 
                key={page.label}
                onClick={() => navigate(page.href)}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg hover:bg-indigo-500/20 hover:text-indigo-300 transition-colors"
              >
                <page.icon className="w-4 h-4 text-slate-400" />
                {page.label}
              </button>
            ))}
          </div>

          <div className="mb-3">
            <div className="px-3 py-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Quick Actions</div>
            {quickActions.map(action => (
              <button 
                key={action.label}
                onClick={() => navigate(action.href)}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg hover:bg-indigo-500/20 hover:text-indigo-300 transition-colors"
              >
                <action.icon className="w-4 h-4 text-slate-400" />
                {action.label}
              </button>
            ))}
          </div>

          <div>
            <div className="px-3 py-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Search</div>
            {searchResults.map(result => (
              <button 
                key={result.label}
                onClick={() => navigate(result.href)}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg hover:bg-indigo-500/20 hover:text-indigo-300 transition-colors"
              >
                <UserIcon className="w-4 h-4 text-slate-400" />
                {result.label}
              </button>
            ))}
          </div>

        </div>

      </div>
    </div>
  );
}

const UserIcon = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
);
