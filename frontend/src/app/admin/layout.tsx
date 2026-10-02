"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Shield, BarChart2, Calendar, Users, Settings, Search, Bell, User, 
  GraduationCap, BookOpen, Banknote, Building, Briefcase, Coffee, FileSpreadsheet, Map
} from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navItems = [
    { name: "Super Admin", href: "/admin/dashboard", icon: Shield },
    { name: "Admissions", href: "/admin/admissions", icon: GraduationCap },
    { name: "Academics & LMS", href: "/admin/academics", icon: BookOpen },
    { name: "Student Finance", href: "/admin/finance", icon: Banknote },
    { name: "HR & Members", href: "/admin/hr", icon: Users },
    { name: "Examinations", href: "/admin/examinations", icon: FileSpreadsheet },
    { name: "Placements", href: "/admin/placements", icon: Briefcase },
    { name: "Hostel & Facilities", href: "/admin/hostels", icon: Building },
    { name: "Canteen", href: "/admin/canteen", icon: Coffee },
    { name: "Transport", href: "/admin/transport", icon: Map },
    { name: "Settings", href: "/admin/settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#141526] text-white flex">
      {/* Sidebar */}
      <aside className="w-[240px] bg-[#1a1b2e] border-r border-[#2a2b3d] flex flex-col flex-shrink-0">
        <div className="h-20 flex items-center px-6">
          <div className="w-8 h-8 rounded bg-[#ff8c00] flex items-center justify-center font-bold text-white mr-3 shadow-[0_0_15px_rgba(255,140,0,0.4)]">
            A
          </div>
          <span className="font-serif font-bold text-xl tracking-wide">Admin Portal</span>
        </div>
        
        <nav className="flex-1 py-4 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-[#34354a]">
          <ul className="space-y-1 px-3">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <li key={item.name}>
                  <Link 
                    href={item.href}
                    className={`flex items-center px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive 
                        ? "bg-[#2a2b3d]/50 text-white border-l-2 border-[#ff8c00]" 
                        : "text-gray-400 hover:text-white hover:bg-[#2a2b3d]/30 border-l-2 border-transparent"
                    }`}
                  >
                    <Icon className={`w-4 h-4 mr-3 shrink-0 ${isActive ? "text-[#ff8c00]" : "text-gray-500"}`} />
                    <span className="truncate">{item.name}</span>
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
            <Link href="#" className="hover:text-white">System Status</Link>
            <Link href="#" className="hover:text-white">Audit Logs</Link>
          </nav>

          <div className="flex items-center space-x-6">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input 
                type="text" 
                placeholder="Search anything..." 
                className="bg-[#242538] border border-[#34354a] rounded-full pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-[#ff8c00] w-64 transition-colors"
              />
            </div>
            
            <button className="relative text-gray-400 hover:text-white transition-colors">
              <Bell className="w-5 h-5" />
            </button>
            
            <button className="w-8 h-8 rounded-full bg-gradient-to-br from-[#ff8c00] to-[#ff6600] flex items-center justify-center">
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
