"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Code2, Key, CreditCard, Activity, BookOpen, Terminal } from "lucide-react";

export default function DeveloperLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navItems = [
    { name: "My Applications", href: "/developer/apps", icon: Terminal },
    { name: "API Keys", href: "#", icon: Key },
    { name: "Usage & Analytics", href: "#", icon: Activity },
    { name: "Billing (Stripe)", href: "#", icon: CreditCard },
    { name: "Documentation", href: "#", icon: BookOpen },
  ];

  return (
    <div className="min-h-screen bg-[#0b0f19] text-white flex">
      {/* Dev Portal Sidebar */}
      <aside className="w-[260px] bg-[#111827] border-r border-[#1f2937] flex flex-col flex-shrink-0">
        <div className="h-20 flex items-center px-6 border-b border-[#1f2937]">
          <div className="w-8 h-8 rounded bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center mr-3 shadow-[0_0_15px_rgba(59,130,246,0.4)]">
            <Code2 className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-lg tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
            KLMCE Dev Portal
          </span>
        </div>
        
        <nav className="flex-1 py-6 px-4">
          <ul className="space-y-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href || (pathname === '/developer' && item.name === 'My Applications');
              const Icon = item.icon;
              return (
                <li key={item.name}>
                  <Link 
                    href={item.href}
                    className={\`flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all \${
                      isActive 
                        ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" 
                        : "text-gray-400 hover:text-gray-200 hover:bg-[#1f2937]/50 border border-transparent"
                    }\`}
                  >
                    <Icon className={\`w-4 h-4 mr-3 shrink-0 \${isActive ? "text-blue-400" : "text-gray-500"}\`} />
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-900/10 via-[#0b0f19] to-[#0b0f19]">
        <div className="flex-1 overflow-auto p-10">
          {children}
        </div>
      </main>
    </div>
  );
}
