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
  Copy,
  Check,
  Zap
} from "lucide-react";
import { useRole, RoleType, ROLE_ROUTE_MAP } from "@/lib/auth/roleContext";
import Link from "next/link";

type TabRole = "STUDENT" | "FACULTY" | "SUPER_ADMIN" | "PARENT";

export default function UnifiedAuthPortal() {
  const router = useRouter();
  const { loginWithCredentials, switchRole } = useRole();

  const [activeTab, setActiveTab] = useState<TabRole>("STUDENT");
  const [identifier, setIdentifier] = useState("219Y1A0501");
  const [password, setPassword] = useState("123456");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Tab configurations with authentic KLMCE Rayalaseema campus credentials
  const roleTabs: { 
    id: TabRole; 
    label: string; 
    icon: React.ElementType; 
    placeholder: string; 
    helper: string; 
    defaultId: string;
    defaultPassword: string;
    personaName: string;
    personaDetail: string;
    badgeColor: string;
  }[] = [
    {
      id: "STUDENT",
      label: "Student",
      icon: GraduationCap,
      placeholder: "e.g. 219Y1A0501 or roll no",
      helper: "JNTUA Roll Number or institutional student email",
      defaultId: "219Y1A0501",
      defaultPassword: "123456",
      personaName: "C. Lakshmi Priya",
      personaDetail: "B.Tech CSE - 4th Year (9.4 CGPA)",
      badgeColor: "emerald"
    },
    {
      id: "FACULTY",
      label: "Faculty",
      icon: Briefcase,
      placeholder: "e.g. KLM-FAC-106 or email",
      helper: "Faculty Employee ID or departmental email",
      defaultId: "KLM-FAC-106",
      defaultPassword: "123456",
      personaName: "Dr. P. Radha Krishna",
      personaDetail: "Associate Professor, Dept. of CSE",
      badgeColor: "indigo"
    },
    {
      id: "SUPER_ADMIN",
      label: "Admin",
      icon: ShieldCheck,
      placeholder: "e.g. principal@klmce.ac.in",
      helper: "Institutional Administrator or Principal ID",
      defaultId: "principal@klmce.ac.in",
      defaultPassword: "123456",
      personaName: "Dr. V. Lokeswara Reddy",
      personaDetail: "Principal & Head of Institution",
      badgeColor: "amber"
    },
    {
      id: "PARENT",
      label: "Parent",
      icon: Users,
      placeholder: "+91 94401 22334 or mobile",
      helper: "Registered guardian mobile number",
      defaultId: "+91 94401 22334",
      defaultPassword: "123456",
      personaName: "C. Narayana Reddy",
      personaDetail: "Guardian of C. Lakshmi Priya (CSE)",
      badgeColor: "rose"
    }
  ];

  const currentTabConfig = roleTabs.find(t => t.id === activeTab)!;

  const handleTabChange = (newTab: TabRole) => {
    setActiveTab(newTab);
    setErrorMessage(null);
    const conf = roleTabs.find(t => t.id === newTab);
    if (conf) {
      setIdentifier(conf.defaultId);
      setPassword(conf.defaultPassword);
    }
  };

  const handleCopy = (text: string, fieldId: string) => {
    try {
      navigator.clipboard.writeText(text);
      setCopiedField(fieldId);
      setTimeout(() => setCopiedField(null), 1500);
    } catch {
      // Fallback
    }
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
        setErrorMessage("Invalid credentials provided. Please verify roll number or ID.");
      }
    }, 400);
  };

  const handleQuickLogin = (role: RoleType) => {
    setIsLoading(true);
    setTimeout(() => {
      switchRole(role);
    }, 250);
  };

  return (
    <div className="min-h-screen bg-[#070514] flex flex-col justify-between p-4 sm:p-6 lg:p-8 relative overflow-hidden font-sans text-white">
      {/* Dynamic Background Effects */}
      <div className="absolute top-[-15%] left-[-10%] w-[55%] h-[55%] rounded-full bg-violet-600/20 blur-[140px] mix-blend-screen pointer-events-none" />
      <div className="absolute bottom-[-15%] right-[-10%] w-[55%] h-[55%] rounded-full bg-fuchsia-600/20 blur-[140px] mix-blend-screen pointer-events-none" />
      <div className="absolute top-[35%] left-[25%] w-[45%] h-[45%] rounded-full bg-indigo-900/15 blur-[160px] mix-blend-screen pointer-events-none" />

      {/* Top Header: Campus Identity */}
      <header className="w-full max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 z-10 py-2">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-fuchsia-600 p-0.5 shadow-[0_0_20px_rgba(99,102,241,0.4)] flex items-center justify-center shrink-0">
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
      <main className="w-full max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8 items-start my-4 z-10">
        
        {/* Left Column: Quick Personas & Campus Highlights */}
        <div className="md:col-span-5 space-y-5 text-left">
          <div className="space-y-2.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-semibold text-indigo-300">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              Unified Institutional Gateway
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight">
              One Login for Every Campus Role.
            </h1>
            <p className="text-violet-200/70 text-xs sm:text-sm leading-relaxed">
              Access examinations, Choice-Based Credit System (CBCS), attendance tracking, tuition fee ledgers, and academic dashboards tailored for Kadapa region engineering scholars and faculty.
            </p>
          </div>

          {/* Quick Demo Personas with Explicit Credentials */}
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 sm:p-5 backdrop-blur-xl shadow-xl space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
              <span>Verified Campus Test Accounts</span>
              <span className="text-emerald-400 font-mono text-[11px] flex items-center gap-1">
                <Zap className="w-3 h-3 fill-emerald-400" /> 1-Click Access
              </span>
            </div>

            <div className="space-y-2">
              {/* Student Card */}
              <button
                type="button"
                onClick={() => handleQuickLogin("STUDENT")}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-left transition-all group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-100 group-hover:text-emerald-300 truncate">
                      Student: C. Lakshmi Priya
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono">
                      Roll No: <span className="text-emerald-300 font-bold">219Y1A0501</span> • PIN: 123456
                    </p>
                  </div>
                </div>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-1 rounded-md font-semibold shrink-0 ml-2">
                  Launch →
                </span>
              </button>

              {/* Faculty Card */}
              <button
                type="button"
                onClick={() => handleQuickLogin("FACULTY")}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 text-left transition-all group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-100 group-hover:text-indigo-300 truncate">
                      Faculty: Dr. P. Radha Krishna
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono">
                      Emp ID: <span className="text-indigo-300 font-bold">KLM-FAC-106</span> • PIN: 123456
                    </p>
                  </div>
                </div>
                <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-1 rounded-md font-semibold shrink-0 ml-2">
                  Launch →
                </span>
              </button>

              {/* Admin Card */}
              <button
                type="button"
                onClick={() => handleQuickLogin("SUPER_ADMIN")}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-left transition-all group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-100 group-hover:text-amber-300 truncate">
                      Principal: Dr. V. Lokeswara Reddy
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono truncate">
                      Email: <span className="text-amber-300 font-bold">principal@klmce.ac.in</span> • PIN: 123456
                    </p>
                  </div>
                </div>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-1 rounded-md font-semibold shrink-0 ml-2">
                  Launch →
                </span>
              </button>

              {/* Parent Card */}
              <button
                type="button"
                onClick={() => handleQuickLogin("PARENT")}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-left transition-all group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-rose-500/20 flex items-center justify-center text-rose-400 shrink-0">
                    <Users className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-100 group-hover:text-rose-300 truncate">
                      Parent: C. Narayana Reddy
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono">
                      Mobile: <span className="text-rose-300 font-bold">+91 94401 22334</span> • PIN: 123456
                    </p>
                  </div>
                </div>
                <span className="text-[10px] bg-rose-500/20 text-rose-300 px-2 py-1 rounded-md font-semibold shrink-0 ml-2">
                  Launch →
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Unified Login Box */}
        <div className="md:col-span-7">
          <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/10 rounded-3xl p-5 sm:p-7 shadow-[0_8px_32px_0_rgba(10,5,30,0.5)] relative overflow-hidden">
            
            {/* Top Role Selector Tabs */}
            <div className="flex bg-black/40 border border-white/10 p-1.5 rounded-2xl mb-5">
              {roleTabs.map((tab) => {
                const Icon = tab.icon;
                const isSelected = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => handleTabChange(tab.id)}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
                      isSelected 
                        ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-600/30" 
                        : "text-slate-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Error Banner */}
            {errorMessage && (
              <div className="mb-4 p-3.5 rounded-xl bg-rose-950/40 border border-rose-800/50 flex items-center gap-3 text-xs text-rose-200">
                <span className="w-2 h-2 rounded-full bg-rose-400 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Live Demo Credentials Card */}
            <div className="mb-5 p-3.5 rounded-2xl bg-indigo-950/30 border border-indigo-500/20 space-y-2.5 text-left">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  Active Demo Credentials ({currentTabConfig.label})
                </span>
                <button
                  type="button"
                  onClick={() => handleQuickLogin(activeTab)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 text-[11px] font-bold text-emerald-300 transition-colors"
                >
                  <Zap className="w-3 h-3 fill-emerald-400 text-emerald-400" /> 1-Click Fast-Track
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="bg-black/40 p-2 rounded-xl border border-white/5 flex items-center justify-between">
                  <div className="min-w-0">
                    <span className="text-[10px] text-slate-400 block font-sans">Identifier / ID:</span>
                    <span className="text-white font-bold truncate block">{currentTabConfig.defaultId}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(currentTabConfig.defaultId, 'id')}
                    className="p-1 hover:bg-white/10 rounded text-slate-400 hover:text-white shrink-0 ml-1"
                    title="Copy ID"
                  >
                    {copiedField === 'id' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>

                <div className="bg-black/40 p-2 rounded-xl border border-white/5 flex items-center justify-between">
                  <div className="min-w-0">
                    <span className="text-[10px] text-slate-400 block font-sans">Password / PIN:</span>
                    <span className="text-white font-bold truncate block">{currentTabConfig.defaultPassword}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(currentTabConfig.defaultPassword, 'pin')}
                    className="p-1 hover:bg-white/10 rounded text-slate-400 hover:text-white shrink-0 ml-1"
                    title="Copy PIN"
                  >
                    {copiedField === 'pin' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
              </div>

              <div className="text-[11px] text-slate-400 flex items-center justify-between pt-0.5">
                <span className="truncate">
                  Persona: <strong className="text-slate-200">{currentTabConfig.personaName}</strong> ({currentTabConfig.personaDetail})
                </span>
                <span className="text-indigo-400 font-medium shrink-0 ml-2">Pre-populated</span>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="space-y-1.5 text-left">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider ml-1">
                  {activeTab === "STUDENT" && "Enrollment / Roll Number"}
                  {activeTab === "FACULTY" && "Faculty Employee ID / Email"}
                  {activeTab === "SUPER_ADMIN" && "Administrator Institutional Email"}
                  {activeTab === "PARENT" && "Registered Mobile Number"}
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
                <div className="flex justify-between items-center px-1">
                  <p className="text-[11px] text-slate-400">{currentTabConfig.helper}</p>
                  <button
                    type="button"
                    onClick={() => {
                      setIdentifier(currentTabConfig.defaultId);
                      setPassword(currentTabConfig.defaultPassword);
                    }}
                    className="text-[11px] text-indigo-400 hover:text-indigo-300 underline font-medium"
                  >
                    Reset to Demo ID
                  </button>
                </div>
              </div>

              <div className="space-y-1.5 text-left">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Password / PIN</label>
                  <span className="text-[11px] text-indigo-400">Default PIN: 123456 (or any)</span>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="123456"
                    className="w-full bg-black/30 border border-white/10 rounded-xl py-3.5 pl-11 pr-4 text-base sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-4 px-6 bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-indigo-600/25 transition-all flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-70"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Verifying Security Profile...
                  </>
                ) : (
                  <>
                    <span>Enter {currentTabConfig.label} Portal</span>
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
                Sign in with Clerk Single Sign-On (Google / Institutional Email)
              </Link>
            </form>

            {/* Bottom Security Footer */}
            <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> AES-256 Encrypted Session
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
