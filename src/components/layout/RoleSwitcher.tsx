"use client";

import React, { useState } from "react";
import { useRole, RoleType, DEMO_PERSONAS } from "@/lib/auth/roleContext";
import { ShieldCheck, GraduationCap, Briefcase, Users, ChevronDown, Check, Sparkles } from "lucide-react";

export function RoleSwitcher() {
  const { role, user, switchRole } = useRole();
  const [isOpen, setIsOpen] = useState(false);

  const roleConfigs: { type: RoleType; label: string; icon: React.ElementType; color: string; desc: string }[] = [
    {
      type: "SUPER_ADMIN",
      label: "Admin Portal",
      icon: ShieldCheck,
      color: "text-amber-400 bg-amber-500/10 border-amber-500/20",
      desc: "Principal & Institutional Oversight"
    },
    {
      type: "FACULTY",
      label: "Faculty Portal",
      icon: Briefcase,
      color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
      desc: "Lectures, Attendance, Marks & Mentees"
    },
    {
      type: "STUDENT",
      label: "Student Portal",
      icon: GraduationCap,
      color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
      desc: "CBCS Academics, SGPA/CGPA, Fees"
    },
    {
      type: "PARENT",
      label: "Parent Portal",
      icon: Users,
      color: "text-rose-400 bg-rose-500/10 border-rose-500/20",
      desc: "Ward Monitoring, Fees, SMS Alerts"
    }
  ];

  const currentConfig = roleConfigs.find(r => r.type === role) || roleConfigs[2];
  const CurrentIcon = currentConfig.icon;

  return (
    <div className="relative z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 sm:gap-2.5 px-2.5 sm:px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-xs font-medium text-slate-200 shadow-sm min-h-[36px]"
        title="Switch institutional role & test personas"
      >
        <span className={`w-2 h-2 rounded-full ${role === 'SUPER_ADMIN' ? 'bg-amber-400' : role === 'FACULTY' ? 'bg-indigo-400' : role === 'STUDENT' ? 'bg-emerald-400' : 'bg-rose-400'} animate-pulse shrink-0`} />
        <CurrentIcon className="w-3.5 h-3.5 text-slate-300 shrink-0" />
        <span className="font-semibold tracking-wide uppercase text-[10px] sm:text-[11px] hidden xs:inline">{currentConfig.label.replace(' Portal', '')}</span>
        <ChevronDown className={`w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-72 max-w-[calc(100vw-1.5rem)] bg-[#171424] border border-white/15 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 backdrop-blur-xl">
            <div className="px-3 py-2 border-b border-white/10 mb-1 flex items-center justify-between">
              <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-indigo-400" /> Unified Role Switcher
              </span>
              <span className="text-[10px] text-indigo-300 font-mono">KLMCE Rayalaseema</span>
            </div>

            <div className="space-y-1">
              {roleConfigs.map((item) => {
                const Icon = item.icon;
                const isSelected = role === item.type;
                const persona = DEMO_PERSONAS[item.type];

                return (
                  <button
                    key={item.type}
                    onClick={() => {
                      switchRole(item.type);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-start gap-3 p-2.5 rounded-xl text-left transition-all ${
                      isSelected 
                        ? "bg-indigo-600/20 border border-indigo-500/30 text-white" 
                        : "hover:bg-white/5 text-slate-300 hover:text-white border border-transparent"
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${item.color} shrink-0 mt-0.5`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-100">{item.label}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-indigo-400 shrink-0" />}
                      </div>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">{persona.name}</p>
                      <p className="text-[10px] text-slate-500 truncate">{item.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
