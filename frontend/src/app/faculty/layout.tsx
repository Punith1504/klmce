"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Users, BookOpen, FileText, MessageSquare, Search, Bell, User, CalendarCheck } from "lucide-react";

export default function FacultyLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navItems = [
    { name: "Dashboard", href: "/faculty/dashboard", icon: Home },
    { name: "My Classes", href: "#", icon: BookOpen },
    { name: "Attendance", href: "/faculty/attendance", icon: CalendarCheck },
    { name: "Grading", href: "#", icon: FileText },
    { name: "Students", href: "#", icon: Users },
    { name: "Messages", href: "#", icon: MessageSquare },
  ];

  return (
    <div className="min-h-screen bg-[#141526] text-white flex">
      {/* Sidebar */}
      <aside className="w-[240px] bg-[#1a1b2e] border-r border-[#2a2b3d] flex flex-col flex-shrink-0">
        <div className="h-20 flex items-center px-6">
          <div className="w-8 h-8 rounded bg-[#00c6a9] flex items-center justify-center font-bold text-white mr-3 shadow-[0_0_15px_rgba(0,198,169,0.4)]">
            K
          </div>
          <span className="font-serif font-bold text-xl tracking-wide">Faculty Portal</span>
        </div>
        
        <nav className="flex-1 py-4">
          <ul className="space-y-1 px-3">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <li key={item.name}>
                  <Link 
                    href={item.href}
                    className={\`flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors \${
                      isActive 
                        ? "bg-[#2a2b3d]/50 text-white border-l-2 border-[#00c6a9]" 
                        : "text-gray-400 hover:text-white hover:bg-[#2a2b3d]/30 border-l-2 border-transparent"
                    }\`}
                  >
                    <Icon className={\`w-4 h-4 mr-3 \${isActive ? "text-[#00c6a9]" : "text-gray-500"}\`} />
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-20 bg-[#1a1b2e] border-b border-[#2a2b3d] flex items-center justify-between px-8 sticky top-0 z-10">
          <nav className="flex space-x-6 text-sm font-medium text-gray-300">
            <Link href="#" className="hover:text-white">Academic Calendar</Link>
            <Link href="#" className="hover:text-white">Resources</Link>
            <Link href="#" className="hover:text-white">Help Desk</Link>
          </nav>

          <div className="flex items-center space-x-6">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input 
                type="text" 
                placeholder="Search students, classes..." 
                className="bg-[#242538] border border-[#34354a] rounded-full pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-[#00c6a9] w-64 transition-colors"
              />
            </div>
            
            <button className="relative text-gray-400 hover:text-white transition-colors">
              <Bell className="w-5 h-5" />
            </button>
            
            <button className="w-8 h-8 rounded-full bg-gradient-to-br from-[#00c6a9] to-[#00a896] flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
