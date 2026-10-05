import os

layout = """"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Users, BookOpen, Video, FileText, Briefcase, MessageSquare, Search, Bell, User } from "lucide-react";

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navItems = [
    { name: "Dashboard", href: "/student/dashboard", icon: Home },
    { name: "Departments", href: "/student/departments", icon: Users },
    { name: "My Courses", href: "/student/courses", icon: BookOpen },
    { name: "Live Classes", href: "/student/classes", icon: Video },
    { name: "Examinations", href: "/student/examinations", icon: FileText },
    { name: "Placements", href: "/student/placements", icon: Briefcase },
    { name: "Messages", href: "/student/messages", icon: MessageSquare },
  ];

  return (
    <div className="min-h-screen bg-[#1c1936] text-white flex font-sans">
      {/* Sidebar */}
      <aside className="w-[260px] bg-[#252136] flex flex-col flex-shrink-0 z-20 shadow-xl border-r border-white/5">
        <div className="h-20 flex items-center px-6">
          <div className="w-8 h-8 rounded-full bg-[#8b5cf6] flex items-center justify-center font-bold text-white mr-3">
            K
          </div>
          <span className="font-serif font-bold text-xl tracking-wide">KSRMMS</span>
        </div>
        
        <nav className="flex-1 py-6 overflow-y-auto">
          <ul className="space-y-2 px-4">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <li key={item.name}>
                  <Link 
                    href={item.href}
                    className={`flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      isActive 
                        ? "text-white bg-white/5" 
                        : "text-slate-300 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <Icon className="w-5 h-5 mr-4 opacity-80" />
                    <span>{item.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 z-10 relative">
        {/* Top Header */}
        <header className="h-20 bg-[#1c1936] border-b border-white/5 flex items-center justify-between px-8 sticky top-0 z-30">
          <nav className="flex space-x-6 text-sm font-medium text-slate-300">
            <Link href="#" className="hover:text-white flex items-center gap-1">About <span className="text-[10px]">▼</span></Link>
            <Link href="/student/departments" className="hover:text-white">Departments</Link>
            <Link href="/student/courses" className="hover:text-white">Academics</Link>
            <Link href="#" className="hover:text-white">Student Services</Link>
          </nav>

          <div className="flex items-center space-x-6">
            <div className="relative group">
              <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search anything..." 
                className="bg-[#252136] border border-transparent rounded-full pl-11 pr-4 py-2 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#8b5cf6] w-64 transition-all"
              />
            </div>
            
            <button className="relative text-slate-300 hover:text-white">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#1c1936]"></span>
            </button>
            
            <button className="w-9 h-9 rounded-full bg-fuchsia-500 flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
"""

dashboard = """import React from 'react';
import { Clock, FileText, CheckCircle2 } from "lucide-react";

export default function Dashboard() {
    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            {/* Top Row: Welcome & Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 bg-gradient-to-br from-[#4c3a7e] to-[#30255a] rounded-2xl p-8 flex flex-col justify-center relative overflow-hidden shadow-lg border border-white/5">
                    <h1 className="text-3xl font-bold text-white mb-2">Welcome back, Punith! 👋</h1>
                    <p className="text-slate-300">You have 2 classes today and 1 assignment pending.</p>
                </div>
                
                <div className="bg-[#252136] rounded-2xl p-6 flex flex-col items-center justify-center border border-white/5 shadow-lg">
                    <div className="w-20 h-20 rounded-full border-4 border-green-400 flex items-center justify-center mb-3 shadow-[0_0_15px_rgba(74,222,128,0.3)]">
                        <span className="text-xl font-bold text-white">85%</span>
                    </div>
                    <span className="text-white font-semibold">Attendance</span>
                    <span className="text-xs text-slate-400">Overall</span>
                </div>
                
                <div className="bg-[#252136] rounded-2xl p-6 flex flex-col items-center justify-center border border-white/5 shadow-lg">
                    <div className="w-20 h-20 rounded-full border-4 border-indigo-400 flex items-center justify-center mb-3">
                        <span className="text-xl font-bold text-white">8.5</span>
                    </div>
                    <span className="text-white font-semibold">CGPA</span>
                    <span className="text-xs text-slate-400">Current</span>
                </div>
            </div>

            {/* Bottom Row: Schedule & Happenings */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                
                <div className="md:col-span-2 space-y-6">
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2"><Clock className="w-5 h-5 text-indigo-400"/> Today's Schedule</h2>
                            <a href="#" className="text-indigo-400 text-sm font-medium hover:underline">View Full</a>
                        </div>
                        <div className="bg-[#252136] rounded-2xl p-6 space-y-6 border border-white/5">
                            <div className="flex items-center gap-6 border-b border-white/5 pb-6">
                                <div className="bg-indigo-500/20 text-indigo-300 px-4 py-2 rounded-lg text-sm font-medium shrink-0">09:00 AM</div>
                                <div className="flex-1">
                                    <h3 className="text-white font-semibold">Data Structures</h3>
                                    <p className="text-sm text-slate-400">Block C - 201</p>
                                </div>
                                <div className="bg-white/5 text-slate-300 px-3 py-1 rounded-full text-xs border border-white/10">Lecture</div>
                            </div>
                            <div className="flex items-center gap-6">
                                <div className="bg-indigo-500/20 text-indigo-300 px-4 py-2 rounded-lg text-sm font-medium shrink-0">11:00 AM</div>
                                <div className="flex-1">
                                    <h3 className="text-white font-semibold">Web Technologies</h3>
                                    <p className="text-sm text-slate-400">Lab 4</p>
                                </div>
                                <div className="bg-white/5 text-slate-300 px-3 py-1 rounded-full text-xs border border-white/10">Practical</div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2"><FileText className="w-5 h-5 text-indigo-400"/> Upcoming Exams</h2>
                            <a href="#" className="text-indigo-400 text-sm font-medium hover:underline">View All</a>
                        </div>
                        <div className="bg-[#252136] rounded-2xl p-6 space-y-6 border border-white/5">
                            <div className="border-b border-white/5 pb-4">
                                <h3 className="text-white font-semibold mb-2">Design and Analysis of Algorithms</h3>
                                <div className="flex gap-4 text-xs text-slate-400">
                                    <span>Oct 20, 2026</span>
                                    <span>10:00 AM - 01:00 PM</span>
                                    <span>Block-A, Room 204</span>
                                </div>
                            </div>
                            <div>
                                <h3 className="text-white font-semibold mb-2">Operating Systems</h3>
                                <div className="flex gap-4 text-xs text-slate-400">
                                    <span>Oct 22, 2026</span>
                                    <span>10:00 AM - 01:00 PM</span>
                                    <span>Block-A, Room 206</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div>
                        <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-4"><span className="text-pink-500 font-bold text-2xl leading-none">!</span> Happenings</h2>
                        <div className="bg-[#252136] rounded-2xl p-6 space-y-6 border border-white/5">
                            <div className="border-b border-white/5 pb-4">
                                <div className="flex justify-between items-start">
                                    <h3 className="text-white text-sm font-medium pr-4 leading-tight">Mid-Term Examinations Schedule Released</h3>
                                    <span className="bg-pink-500 text-white text-[10px] px-2 py-0.5 rounded font-bold">NEW</span>
                                </div>
                                <p className="text-xs text-slate-500 mt-1">Oct 15</p>
                            </div>
                            <div className="border-b border-white/5 pb-4">
                                <h3 className="text-white text-sm font-medium leading-tight">TechFest 2026 Registrations Open</h3>
                                <p className="text-xs text-slate-500 mt-1">Oct 12</p>
                            </div>
                            <div>
                                <h3 className="text-white text-sm font-medium leading-tight">Holiday Declaration for Diwali</h3>
                                <p className="text-xs text-slate-500 mt-1">Oct 10</p>
                            </div>
                            <div className="pt-2 text-center">
                                <a href="#" className="text-indigo-400 text-sm font-medium hover:underline">View All Announcements</a>
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#252136] rounded-2xl p-6 border border-white/5 shadow-lg relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-3xl"></div>
                        <h3 className="text-white font-bold mb-4">Fee Status</h3>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-3xl font-bold text-green-400">NIL</span>
                            <CheckCircle2 className="w-6 h-6 text-green-400" />
                        </div>
                        <p className="text-sm text-slate-400 mb-4">No pending dues</p>
                        <div className="flex justify-end">
                             <button className="bg-white/5 border border-white/10 text-white text-sm px-4 py-2 rounded-lg hover:bg-white/10 transition">Receipts</button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    )
}
"""

departments = """import React from 'react';
import { Mail, Book, Info, MessageSquare, Users } from "lucide-react";

export default function Departments() {
    const tabs = ["Computer Science", "Electronics & Comm.", "Electrical", "Mechanical", "Civil"];
    const faculty = [
        { name: "Dr. V. Lokeswara Reddy", role: "Professor & HOD", degree: "Ph.D in Computer Science", subjects: ["Discrete Mathematics", "Machine Learning"], email: "hod.cse@ksrmce.ac.in", initial: "V" },
        { name: "Dr. M. Sreenivasulu", role: "Professor", degree: "Ph.D in Data Mining", subjects: ["Database Management Systems", "Data Science"], email: "sreenivasulu.m@ksrmce.ac.in", initial: "M" },
        { name: "Dr. N. Ramanjaneya Reddy", role: "Associate Professor", degree: "Ph.D in IoT", subjects: ["Digital Logic Design", "Computer Networks"], email: "ramanjaneya.n@ksrmce.ac.in", initial: "N" },
        { name: "Dr. S. M. Farooq", role: "Associate Professor", degree: "Ph.D in Software Engg", subjects: ["Software Engineering", "Cloud Computing"], email: "farooq.sm@ksrmce.ac.in", initial: "S" },
        { name: "Dr. K. Srinivasa Rao", role: "Professor", degree: "Ph.D in Algorithms", subjects: ["Design & Analysis of Algorithms"], email: "srinivasa.k@ksrmce.ac.in", initial: "K" },
        { name: "Sri. Nagaraju Rayapati", role: "Assistant Professor", degree: "M.Tech (CSE)", subjects: ["Object Oriented Programming through Java"], email: "nagaraju.r@ksrmce.ac.in", initial: "N" }
    ];

    return (
        <div className="space-y-8 max-w-7xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold text-white flex items-center gap-3 mb-2">
                    <Users className="w-7 h-7 text-indigo-400"/> Departments & Faculty
                </h1>
                <p className="text-indigo-400 text-sm">Connect with your professors and explore department directories.</p>
            </div>
            
            <div className="flex flex-wrap gap-3">
                {tabs.map((t, i) => (
                    <button key={i} className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${i === 0 ? "bg-[#5949d6] text-white shadow-lg shadow-indigo-500/20" : "bg-[#252136] text-slate-300 border border-white/5 hover:bg-white/5"}`}>
                        {t}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {faculty.map((f, i) => (
                    <div key={i} className="bg-[#252136] rounded-2xl p-6 border border-white/5 hover:border-white/10 transition-colors shadow-lg flex flex-col">
                        <div className="flex items-start gap-4 mb-6">
                            <div className="w-14 h-14 rounded-full bg-[#8b5cf6] flex items-center justify-center text-xl font-bold text-white shrink-0">
                                {f.initial}
                            </div>
                            <div>
                                <h3 className="text-white font-bold leading-tight">{f.name}</h3>
                                <p className="text-indigo-400 text-sm mt-1">{f.role}</p>
                            </div>
                        </div>
                        
                        <div className="space-y-4 mb-8 flex-1">
                            <div className="flex items-center gap-3 text-xs text-slate-300">
                                <Book className="w-4 h-4 opacity-50 shrink-0" />
                                <span>{f.degree}</span>
                            </div>
                            <div className="flex items-start gap-3 text-xs text-slate-300">
                                <Book className="w-4 h-4 opacity-50 shrink-0 mt-0.5" />
                                <div className="flex flex-wrap gap-2">
                                    {f.subjects.map(s => <span key={s} className="px-2 py-1 bg-white/5 border border-white/10 rounded">{s}</span>)}
                                </div>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-slate-300">
                                <Mail className="w-4 h-4 opacity-50 shrink-0" />
                                <span>{f.email}</span>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-auto">
                            <button className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 text-white py-2.5 rounded-xl text-sm font-medium transition flex items-center justify-center gap-2">
                                <Info className="w-4 h-4" /> Profile
                            </button>
                            <button className="flex-1 bg-[#5949d6] hover:bg-indigo-600 text-white py-2.5 rounded-xl text-sm font-medium transition flex items-center justify-center gap-2">
                                <MessageSquare className="w-4 h-4" /> Message
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
"""

courses = """import React from 'react';
import { BookOpen, Download } from "lucide-react";

export default function Courses() {
    const tabs = ["All", "1st Year", "2nd Year", "3rd Year", "4th Year"];
    const topTabs = ["Courses", "Assignments", "Materials"];
    
    const coursesList = [
        { id: "2021101", name: "Mathematics - I", year: "1st Year", att: "92%", res: "O", prog: 100 },
        { id: "2021102", name: "Applied Physics", year: "1st Year", att: "88%", res: "A+", prog: 100 },
        { id: "2005103", name: "C Programming & Data Structures", year: "1st Year", att: "95%", res: "O", prog: 100 },
        { id: "2024104", name: "English", year: "1st Year", att: "--", res: "--", prog: 0 },
        { id: "2021301", name: "Discrete Mathematics", year: "2nd Year", att: "--", res: "--", prog: 0 },
        { id: "2005302", name: "Database Management Systems", year: "2nd Year", att: "--", res: "--", prog: 0 }
    ];

    return (
        <div className="space-y-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3 mb-2">
                        <BookOpen className="w-7 h-7 text-indigo-400"/> My Courses
                    </h1>
                    <p className="text-indigo-400 text-sm">Access your courses from 1st Year to Final Year.</p>
                </div>
                <div className="bg-[#252136] p-1.5 rounded-xl flex border border-white/5">
                    {topTabs.map((t, i) => (
                        <button key={i} className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${i === 0 ? "bg-[#5949d6] text-white" : "text-slate-400 hover:text-white"}`}>
                            {t}
                        </button>
                    ))}
                </div>
            </div>
            
            <div className="flex gap-2">
                {tabs.map((t, i) => (
                    <button key={i} className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${i === 0 ? "bg-[#5949d6] text-white" : "bg-[#252136] text-slate-300 border border-white/5 hover:bg-white/5"}`}>
                        {t}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {coursesList.map((c, i) => (
                    <div key={i} className="bg-[#252136] rounded-2xl p-6 border border-white/5 hover:border-white/10 transition-colors shadow-lg flex flex-col">
                        <div className="flex justify-between items-start mb-4">
                            <span className="bg-indigo-500/20 text-indigo-300 text-xs px-2.5 py-1 rounded font-bold">{c.id}</span>
                            <span className="bg-white/5 text-slate-400 text-xs px-2.5 py-1 rounded border border-white/5">{c.year}</span>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-8 leading-tight">{c.name}</h3>
                        
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                                <span className="text-xs text-slate-400 block mb-1 flex items-center gap-1"><BookOpen className="w-3 h-3"/> Attendance</span>
                                <span className="text-lg font-bold text-green-400">{c.att}</span>
                            </div>
                            <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                                <span className="text-xs text-slate-400 block mb-1 flex items-center gap-1">🏆 Result</span>
                                <span className="text-lg font-bold text-green-400">{c.res}</span>
                            </div>
                        </div>

                        <div className="mb-6">
                            <div className="flex justify-between text-xs mb-2">
                                <span className="text-slate-400">Course Progress</span>
                                <span className="text-white font-medium">{c.prog}%</span>
                            </div>
                            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                                <div className="h-full bg-green-500 rounded-full" style={{ width: `${c.prog}%` }}></div>
                            </div>
                        </div>

                        <button className="w-full mt-auto bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 py-3 rounded-xl text-sm font-medium transition flex items-center justify-center gap-2">
                            <Download className="w-4 h-4" /> Download Syllabus
                        </button>
                    </div>
                ))}
            </div>
        </div>
    )
}
"""

examinations = """import React from 'react';
import { FileText, Download, Calendar, Clock } from "lucide-react";

export default function Examinations() {
    const topTabs = ["Calendars", "Notifications", "Timetables"];
    
    const docs = [
        { date: "Oct 27, 2025", title: "Academic Calendars for MTech I Semester : AY 2025 2026", tag: "M.Tech" },
        { date: "Aug 30, 2025", title: "Academic Calendars for MBA I Year: AY 2025 2026", tag: "MBA" },
        { date: "Aug 30, 2025", title: "Academic Calendars for B.Tech I Semester for AY 2025 2026", tag: "B.Tech" },
        { date: "Jul 17, 2025", title: "Academic Calendars for B.Tech VII & VIII Semester for AY 2025-2026", tag: "B.Tech" },
        { date: "Jul 17, 2025", title: "Academic Calendars for B.Tech V & VI Semester for AY 2025-2026", tag: "B.Tech" },
        { date: "Jul 17, 2025", title: "Academic Calendars for B.Tech III & IV Semester for AY 2025-2026", tag: "B.Tech" },
        { date: "Dec 20, 2024", title: "Academic Calendars for BTech Even Semester", tag: "B.Tech" }
    ];

    return (
        <div className="space-y-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3 mb-2">
                        <FileText className="w-7 h-7 text-indigo-400"/> Examination Portal
                    </h1>
                    <p className="text-indigo-400 text-sm">Personalized Academic Calendars, Timetables, and Results.</p>
                </div>
                <div className="bg-[#252136] p-1.5 rounded-xl flex border border-white/5">
                    {topTabs.map((t, i) => (
                        <button key={i} className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${i === 0 ? "bg-[#5949d6] text-white" : "text-slate-400 hover:text-white"}`}>
                            {t}
                        </button>
                    ))}
                </div>
            </div>
            
            <div className="flex justify-between items-center mt-10">
                <h2 className="text-xl font-bold text-white">Official Academic Calendars</h2>
                <span className="text-xs font-semibold bg-indigo-500/20 text-indigo-300 px-3 py-1 rounded border border-indigo-500/30">Latest Updates</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {docs.map((d, i) => (
                    <div key={i} className="bg-[#252136] rounded-2xl p-6 border border-white/5 hover:border-indigo-500/50 transition-all shadow-lg flex flex-col relative overflow-hidden group">
                        <Calendar className="absolute -right-6 -top-6 w-32 h-32 text-white/[0.02] group-hover:text-white/[0.04] transition-colors" />
                        
                        <div className="flex items-center gap-2 mb-6">
                            <span className="bg-white/5 border border-white/10 text-slate-300 text-xs px-2.5 py-1.5 rounded-full flex items-center gap-1.5 font-medium z-10">
                                <Clock className="w-3 h-3" /> {d.date}
                            </span>
                        </div>
                        
                        <h3 className="text-lg font-bold text-white mb-8 leading-relaxed z-10 pr-4">{d.title}</h3>
                        
                        <div className="mt-auto flex justify-between items-center z-10">
                            <span className="bg-[#5949d6] text-white text-xs px-3 py-1 rounded font-bold">{d.tag}</span>
                            <button className="text-blue-400 hover:text-blue-300 text-sm font-bold flex items-center gap-1.5 transition">
                                Download <Download className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
"""

placements = """import React from 'react';
import { Briefcase, FileText, CheckCircle2, MapPin } from "lucide-react";

export default function Placements() {
    const topTabs = ["Recommendations", "Job Board", "My Applications"];
    
    const jobs = [
        { company: "Wipro", role: "Project Engineer", salary: "$ 3.5 LPA", location: "Chennai", type: "Full Time", match: 98 },
        { company: "TCS Digital", role: "System Engineer", salary: "$ 7.0 LPA", location: "Hyderabad / Pune", type: "Full Time", match: 92 },
        { company: "Infosys", role: "Specialist Programmer", salary: "$ 8.0 LPA", location: "Bangalore", type: "Full Time", match: 88 }
    ];

    return (
        <div className="space-y-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3 mb-2">
                        <Briefcase className="w-7 h-7 text-indigo-400"/> Placement Cell
                    </h1>
                    <p className="text-indigo-400 text-sm">AI-driven job matching and campus recruitment portal.</p>
                </div>
                <div className="bg-[#252136] p-1.5 rounded-xl flex border border-white/5">
                    {topTabs.map((t, i) => (
                        <button key={i} className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${i === 0 ? "bg-[#5949d6] text-white" : "text-slate-400 hover:text-white"}`}>
                            {t}
                        </button>
                    ))}
                </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-10">
                
                {/* Left Col - Resume */}
                <div className="space-y-4">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">✨ AI Resume Matcher</h2>
                    <div className="bg-[#252136] rounded-2xl p-6 border border-white/5 shadow-lg">
                        <div className="flex items-center gap-4 bg-white/5 border border-white/10 p-4 rounded-xl mb-6">
                            <div className="w-10 h-10 rounded bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                                <FileText className="w-5 h-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="text-white font-semibold text-sm truncate">Punith_Resume_v2.pdf</h3>
                                <p className="text-emerald-400 text-xs flex items-center gap-1 mt-0.5"><CheckCircle2 className="w-3 h-3" /> Successfully parsed</p>
                            </div>
                        </div>

                        <div className="mb-8">
                            <h4 className="text-sm text-slate-300 mb-4 font-medium">Extracted Skills Profile:</h4>
                            <div className="flex flex-wrap gap-2">
                                {["React.js", "Next.js", "Java", "Python", "Tailwind CSS", "SQL"].map(s => (
                                    <span key={s} className="bg-white/5 border border-white/10 text-slate-300 px-3 py-1.5 rounded-full text-xs font-medium">{s}</span>
                                ))}
                            </div>
                        </div>

                        <button className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white py-3.5 rounded-xl text-sm font-medium transition">
                            Update Resume
                        </button>
                    </div>
                </div>

                {/* Right Col - Jobs */}
                <div className="lg:col-span-2 space-y-4">
                    <h2 className="text-lg font-bold text-white">Recommended Opportunities</h2>
                    <div className="space-y-4">
                        {jobs.map((j, i) => (
                            <div key={i} className="bg-[#252136] rounded-2xl p-6 border border-white/5 hover:border-indigo-500/30 transition-all shadow-lg flex flex-col sm:flex-row justify-between items-center gap-6 group">
                                <div className="flex-1 w-full">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Briefcase className="w-4 h-4 text-slate-400" />
                                        <span className="text-slate-400 text-sm font-medium">{j.company}</span>
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-4 group-hover:text-indigo-300 transition-colors">{j.role}</h3>
                                    <div className="flex flex-wrap gap-4 text-xs font-medium">
                                        <span className="text-emerald-400 font-bold bg-emerald-500/10 px-3 py-1 rounded">{j.salary}</span>
                                        <span className="text-slate-400 flex items-center gap-1"><MapPin className="w-3 h-3"/> {j.location}</span>
                                        <span className="text-slate-400 flex items-center gap-1"><Briefcase className="w-3 h-3"/> {j.type}</span>
                                    </div>
                                </div>
                                
                                <div className="flex flex-col items-center sm:items-end border-t sm:border-t-0 sm:border-l border-white/5 w-full sm:w-auto pt-4 sm:pt-0 sm:pl-8">
                                    <div className="text-center mb-4">
                                        <span className="text-2xl font-black text-emerald-400">{j.match}%</span>
                                        <span className="block text-[10px] text-slate-400 tracking-wider font-bold uppercase mt-1">Match Score</span>
                                    </div>
                                    <button className="w-full sm:w-auto bg-[#5949d6] hover:bg-indigo-600 text-white px-8 py-2.5 rounded-xl text-sm font-semibold transition shadow-lg shadow-indigo-500/20 whitespace-nowrap">
                                        Apply Now >
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    )
}
"""

with open("src/app/student/layout.tsx", "w", encoding="utf-8") as f: f.write(layout)
os.makedirs("src/app/student/dashboard", exist_ok=True)
with open("src/app/student/dashboard/page.tsx", "w", encoding="utf-8") as f: f.write(dashboard)

os.makedirs("src/app/student/departments", exist_ok=True)
with open("src/app/student/departments/page.tsx", "w", encoding="utf-8") as f: f.write(departments)

os.makedirs("src/app/student/courses", exist_ok=True)
with open("src/app/student/courses/page.tsx", "w", encoding="utf-8") as f: f.write(courses)

os.makedirs("src/app/student/examinations", exist_ok=True)
with open("src/app/student/examinations/page.tsx", "w", encoding="utf-8") as f: f.write(examinations)

os.makedirs("src/app/student/placements", exist_ok=True)
with open("src/app/student/placements/page.tsx", "w", encoding="utf-8") as f: f.write(placements)

print("KSRMMS Student Portal fully built.")
