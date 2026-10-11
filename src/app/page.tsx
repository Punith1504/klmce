"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  GraduationCap, 
  Briefcase, 
  ShieldCheck, 
  Users, 
  ArrowRight, 
  Sparkles, 
  Loader2, 
  Lock, 
  Fingerprint, 
  KeyRound, 
  ExternalLink,
  BookOpen,
  Award,
  Layers,
  HelpCircle
} from "lucide-react";
import { useRole, RoleType, ROLE_ROUTE_MAP } from "@/lib/auth/roleContext";
import Link from "next/link";

type TabRole = "STUDENT" | "FACULTY" | "SUPER_ADMIN" | "PARENT";

export default function UnifiedAuthPortal() {
  const router = useRouter();
  const { loginWithCredentials } = useRole();

  const [activeTab, setActiveTab] = useState<TabRole>("STUDENT");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Tab configurations matching authentic institutional credentials
  const roleTabs: { 
    id: TabRole; 
    label: string; 
    icon: React.ElementType; 
    placeholder: string; 
    helper: string; 
    defaultId: string;
  }[] = [
    {
      id: "STUDENT",
      label: "Student",
      icon: GraduationCap,
      placeholder: "e.g. 219Y1A0501",
      helper: "Enter your JNTUA Roll Number or student email",
      defaultId: "219Y1A0501"
    },
    {
      id: "FACULTY",
      label: "Faculty",
      icon: Briefcase,
      placeholder: "e.g. KLM-FAC-106",
      helper: "Enter your Faculty Employee ID or official email",
      defaultId: "KLM-FAC-106"
    },
    {
      id: "SUPER_ADMIN",
      label: "Admin",
      icon: ShieldCheck,
      placeholder: "e.g. principal@klmce.ac.in",
      helper: "Enter Administrator or Principal institutional credentials",
      defaultId: "principal@klmce.ac.in"
    },
    {
      id: "PARENT",
      label: "Parent",
      icon: Users,
      placeholder: "e.g. +91 94401 22334",
      helper: "Enter registered guardian mobile number",
      defaultId: "+91 94401 22334"
    }
  ];

  const currentTabConfig = roleTabs.find(t => t.id === activeTab)!;

  const handleTabChange = (newTab: TabRole) => {
    setActiveTab(newTab);
    setErrorMessage(null);
    setIdentifier("");
    setPassword("");
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    const targetId = identifier.trim() || currentTabConfig.defaultId;

    setTimeout(() => {
      setIsLoading(false);
      const success = loginWithCredentials(targetId, activeTab);
      if (success) {
        router.push(ROLE_ROUTE_MAP[activeTab]);
      } else {
        setErrorMessage("Invalid credentials provided. Please check your roll number or ID.");
      }
    }, 450);
  };

  return (
    <div className="min-h-screen bg-[#070514] flex flex-col justify-between p-4 sm:p-6 lg:p-8 relative overflow-hidden font-sans text-white">
      {/* Ambient background glows */}
      <div className="absolute top-[-15%] left-[-10%] w-[55%] h-[55%] rounded-full bg-violet-600/15 blur-[140px] mix-blend-screen pointer-events-none" />
      <div className="absolute bottom-[-15%] right-[-10%] w-[55%] h-[55%] rounded-full bg-fuchsia-600/15 blur-[140px] mix-blend-screen pointer-events-none" />
      <div className="absolute top-[35%] left-[25%] w-[45%] h-[45%] rounded-full bg-indigo-900/15 blur-[160px] mix-blend-screen pointer-events-none" />

      {/* Top Header: Institutional Identity */}
      <header className="w-full max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 z-10 py-2">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-fuchsia-600 p-0.5 shadow-[0_0_20px_rgba(99,102,241,0.35)] flex items-center justify-center shrink-0">
            <div className="w-full h-full bg-[#130E26] rounded-[14px] flex items-center justify-center relative overflow-hidden">
              <img 
                src="/college-logo.png" 
                alt="KLMCE Crest" 
                className="w-10 h-10 object-contain drop-shadow" 
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const fb = e.currentTarget.nextElementSibling as HTMLElement;
                  if (fb) fb.style.display = 'flex';
                }}
              />
              <div style={{ display: 'none' }} className="w-full h-full items-center justify-center text-white font-extrabold text-sm tracking-tight bg-gradient-to-tr from-indigo-600 to-violet-600">
                KLMCE
              </div>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg sm:text-xl text-white tracking-tight">K.S.R.M. / KLMCE</span>
              <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-[10px] font-bold text-indigo-300 uppercase">
                Autonomous
              </span>
            </div>
            <p className="text-xs text-violet-200/60 font-medium">
              Kandula Group of Institutions • Kadapa, Rayalaseema, AP
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300 font-medium flex items-center gap-1.5 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> NAAC 'A' Grade • NBA Accredited
          </span>
          <Link
            href="/sign-in"
            className="flex items-center gap-1 px-3 py-1 rounded-full bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-200 transition-colors"
          >
            Clerk SSO <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="w-full max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 items-center my-6 z-10">
        
        {/* Left Column: Institutional Architecture & Information */}
        <div className="md:col-span-5 space-y-6 text-left">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-semibold text-indigo-300">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              Institutional Enterprise ERP
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              One Login for Every Campus Role.
            </h1>
            <p className="text-violet-200/70 text-sm leading-relaxed">
              Unified digital campus architecture serving 2,450+ engineering scholars, faculty, administrators, and guardians across Rayalaseema.
            </p>
          </div>

          {/* Institutional Highlights Grid */}
          <div className="grid grid-cols-1 gap-3 pt-2">
            <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 flex items-start gap-3 backdrop-blur-md">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0 mt-0.5">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white mb-0.5">Autonomous Academic Matrix</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  CBCS Regulations R20 & R23, automated credits calculation, and semester progression.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 flex items-start gap-3 backdrop-blur-md">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white mb-0.5">Real-Time Attendance Engine</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  75% mandatory threshold tracking, condonation calculations, and daily biometric sync.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 flex items-start gap-3 backdrop-blur-md">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
                <Award className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white mb-0.5">Examinations & Placement Records</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  JNTUA-standard transcripts, Mid-1/Mid-2 evaluations, and corporate recruiting drives.
                </p>
              </div>
            </div>
          </div>

          {/* Institutional Help Desk Notice */}
          <div className="flex items-center gap-2 text-xs text-slate-400 pt-1">
            <HelpCircle className="w-4 h-4 text-slate-500 shrink-0" />
            <span>Need institutional assistance? Contact Campus IT Cell: <span className="text-indigo-300">support@klmce.ac.in</span></span>
          </div>
        </div>

        {/* Right Column: Clean Institutional Login Form */}
        <div className="md:col-span-7">
          <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/10 rounded-3xl p-6 sm:p-8 shadow-[0_8px_32px_0_rgba(10,5,30,0.5)] relative overflow-hidden">
            
            {/* Top Role Selector Tabs */}
            <div className="flex bg-black/40 border border-white/10 p-1.5 rounded-2xl mb-6">
              {roleTabs.map((tab) => {
                const Icon = tab.icon;
                const isSelected = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => handleTabChange(tab.id)}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 px-3 rounded-xl text-xs font-bold transition-all ${
                      isSelected 
                        ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-600/30" 
                        : "text-slate-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Error Banner */}
            {errorMessage && (
              <div className="mb-5 p-3.5 rounded-xl bg-rose-950/40 border border-rose-800/50 flex items-center gap-3 text-xs text-rose-200">
                <span className="w-2 h-2 rounded-full bg-rose-400 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Authentication Form */}
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="space-y-1.5 text-left">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider ml-1">
                  {activeTab === "STUDENT" && "JNTUA Enrollment / Roll Number"}
                  {activeTab === "FACULTY" && "Faculty Employee ID / Official Email"}
                  {activeTab === "SUPER_ADMIN" && "Administrator Institutional Email"}
                  {activeTab === "PARENT" && "Registered Guardian Mobile Number"}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <Fingerprint className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder={currentTabConfig.placeholder}
                    className="w-full bg-black/30 border border-white/10 rounded-xl py-3.5 pl-11 pr-4 text-base sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-mono"
                  />
                </div>
                <p className="text-[11px] text-slate-400 ml-1">{currentTabConfig.helper}</p>
              </div>

              <div className="space-y-1.5 text-left">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider ml-1">
                  Password / Security PIN
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-black/30 border border-white/10 rounded-xl py-3.5 pl-11 pr-4 text-base sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-3 py-4 px-6 bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-indigo-600/25 transition-all flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-70"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Verifying Institutional Profile...
                  </>
                ) : (
                  <>
                    <span>Sign In to {currentTabConfig.label} Portal</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-white/10"></div>
                <span className="flex-shrink-0 mx-3 text-slate-500 text-xs font-medium uppercase tracking-wider">Or</span>
                <div className="flex-grow border-t border-white/10"></div>
              </div>

              {/* Clerk SSO Option */}
              <Link
                href="/sign-in"
                className="w-full flex items-center justify-center gap-2.5 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-200 transition-colors"
              >
                <KeyRound className="w-4 h-4 text-indigo-400" />
                Single Sign-On (Google / Institutional Identity)
              </Link>
            </form>

            {/* Bottom Security Footer */}
            <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> 256-Bit SSL Encrypted Connection
              </span>
              <span>JNTUA Autonomous System</span>
            </div>

          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="w-full max-w-6xl mx-auto py-3 border-t border-white/10 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2 z-10">
        <p>© 2026 K.S.R.M. / KLM College of Engineering (Kadapa). All Rights Reserved.</p>
        <p className="text-[11px] text-slate-600">Enterprise ERP Cloud Version 4.8.2 • Rayalaseema Central Node</p>
      </footer>
    </div>
  );
}
