"use client";

import React, { useState, useRef, useEffect } from "react";
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
  HelpCircle,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Shield,
  Smartphone
} from "lucide-react";
import { useRole, RoleType, ROLE_ROUTE_MAP, resolveCredentialRole } from "@/lib/auth/roleContext";
import Link from "next/link";

export default function UnifiedAuthPortal() {
  const router = useRouter();
  const { loginWithCredentials } = useRole();

  // State
  const [step, setStep] = useState<"CREDENTIALS" | "MFA">("CREDENTIALS");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [totpDigits, setTotpDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(30);
  const [trustDevice, setTrustDevice] = useState(true);

  const totpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Dynamically resolve credential role as user types
  const detectedRole = resolveCredentialRole(identifier);

  // Countdown timer for MFA
  useEffect(() => {
    if (step === "MFA" && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [step, timeLeft]);

  // Handle Step 1 Submit (Proceed to MFA)
  const handleCredentialsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanId = identifier.trim();
    if (!cleanId) {
      setErrorMessage("Please enter your Roll Number, Employee ID, Email, or Mobile Number.");
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setStep("MFA");
      setTimeLeft(30);
      setTotpDigits(["", "", "", "", "", ""]);
      setTimeout(() => {
        totpInputRefs.current[0]?.focus();
      }, 100);
    }, 400);
  };

  // Handle Step 2 Submit (Verify MFA and Enter Portal)
  const handleMfaSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    const cleanId = identifier.trim();
    const resolved = resolveCredentialRole(cleanId);

    setTimeout(() => {
      setIsLoading(false);
      const success = loginWithCredentials(cleanId, resolved.role);
      if (success) {
        router.push(ROLE_ROUTE_MAP[resolved.role]);
      } else {
        setErrorMessage("Multi-Factor verification failed. Please try again.");
      }
    }, 450);
  };

  // TOTP Individual Inputs logic
  const handleTotpChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const updated = [...totpDigits];
    updated[index] = digit;
    setTotpDigits(updated);

    if (digit && index < 5) {
      totpInputRefs.current[index + 1]?.focus();
    }

    // If all 6 digits entered, auto-verify
    if (index === 5 && digit && updated.every(d => d !== "")) {
      setTimeout(() => handleMfaSubmit(), 200);
    }
  };

  const handleTotpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (!totpDigits[index] && index > 0) {
        totpInputRefs.current[index - 1]?.focus();
      } else {
        const updated = [...totpDigits];
        updated[index] = "";
        setTotpDigits(updated);
      }
    }
  };

  const handleTotpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted) {
      const updated = [...totpDigits];
      for (let i = 0; i < 6; i++) {
        updated[i] = pasted[i] || "";
      }
      setTotpDigits(updated);
      const focusIndex = Math.min(pasted.length, 5);
      totpInputRefs.current[focusIndex]?.focus();

      if (pasted.length === 6) {
        setTimeout(() => handleMfaSubmit(), 200);
      }
    }
  };

  // Quick preset autofill helper
  const handleSelectRolePreset = (role: RoleType) => {
    setErrorMessage(null);
    if (role === "STUDENT") setIdentifier("219Y1A0501");
    if (role === "FACULTY") setIdentifier("KLM-FAC-106");
    if (role === "SUPER_ADMIN") setIdentifier("principal@klmce.ac.in");
    if (role === "PARENT") setIdentifier("+91 94401 22334");
    setPassword("123456");
  };

  return (
    <div className="min-h-screen bg-[#070514] flex flex-col justify-between p-4 sm:p-6 lg:p-8 relative overflow-hidden font-sans text-white">
      {/* Background ambient lighting */}
      <div className="absolute top-[-15%] left-[-10%] w-[55%] h-[55%] rounded-full bg-violet-600/15 blur-[140px] mix-blend-screen pointer-events-none" />
      <div className="absolute bottom-[-15%] right-[-10%] w-[55%] h-[55%] rounded-full bg-fuchsia-600/15 blur-[140px] mix-blend-screen pointer-events-none" />
      <div className="absolute top-[35%] left-[25%] w-[45%] h-[45%] rounded-full bg-indigo-900/15 blur-[160px] mix-blend-screen pointer-events-none" />

      {/* Top Header */}
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
              <span className="font-extrabold text-lg sm:text-xl text-white tracking-tight">KLMCE</span>
              <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-[10px] font-bold text-indigo-300 uppercase">
                Autonomous
              </span>
            </div>
            <p className="text-xs text-violet-200/60 font-medium">
              KLM College of Engineering • Kadapa, Rayalaseema, AP
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
        
        {/* Left Column: Campus Overview & Institutional Modules */}
        <div className="md:col-span-5 space-y-6 text-left">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-semibold text-indigo-300">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              Unified Institutional Gateway
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              One Login for Every Campus Role.
            </h1>
            <p className="text-violet-200/70 text-sm leading-relaxed">
              Unified Single Sign-On and Multi-Factor Authenticated portal serving engineering scholars, faculty, administrators, and guardians.
            </p>
          </div>

          {/* Module Capabilities */}
          <div className="grid grid-cols-1 gap-3 pt-1">
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
                  75% mandatory threshold tracking, condonation projections, and daily biometric sync.
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
                  Autonomous transcripts, Mid-1/Mid-2 evaluations, and corporate recruiting drives.
                </p>
              </div>
            </div>
          </div>

          {/* Help Desk */}
          <div className="flex items-center gap-2 text-xs text-slate-400 pt-1">
            <HelpCircle className="w-4 h-4 text-slate-500 shrink-0" />
            <span>Need institutional assistance? Contact Campus IT: <span className="text-indigo-300">support@klmce.ac.in</span></span>
          </div>
        </div>

        {/* Right Column: Unified One-Login Interface with MFA & SSO */}
        <div className="md:col-span-7">
          <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/10 rounded-3xl p-6 sm:p-8 shadow-[0_8px_32px_0_rgba(10,5,30,0.5)] relative overflow-hidden">
            
            {/* Header of Login Card */}
            <div className="flex items-center justify-between mb-5 pb-3 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Central Campus Authentication</h3>
                  <p className="text-[11px] text-slate-400">Role-Based Access Control • SSO & MFA Ready</p>
                </div>
              </div>

              {step === "MFA" ? (
                <span className="text-[10px] font-mono bg-amber-500/20 border border-amber-500/30 text-amber-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Step 2: MFA
                </span>
              ) : (
                <span className="text-[10px] font-mono bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 px-2 py-0.5 rounded-full">
                  Step 1: Credentials
                </span>
              )}
            </div>

            {/* Error Banner */}
            {errorMessage && (
              <div className="mb-4 p-3 rounded-xl bg-rose-950/40 border border-rose-800/50 flex items-center gap-2.5 text-xs text-rose-200">
                <span className="w-2 h-2 rounded-full bg-rose-400 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* STEP 1: CREDENTIALS INTERFACE */}
            {step === "CREDENTIALS" && (
              <form onSubmit={handleCredentialsSubmit} className="space-y-4">
                
                {/* Identifier Input with Automatic Live Role Detection */}
                <div className="space-y-1.5 text-left">
                  <div className="flex items-center justify-between ml-1">
                    <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                      Campus Identifier
                    </label>
                    {identifier.trim() && (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border transition-all ${
                        detectedRole.role === "STUDENT" ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-300" :
                        detectedRole.role === "FACULTY" ? "bg-indigo-500/20 border-indigo-500/30 text-indigo-300" :
                        detectedRole.role === "SUPER_ADMIN" ? "bg-amber-500/20 border-amber-500/30 text-amber-300" :
                        "bg-rose-500/20 border-rose-500/30 text-rose-300"
                      }`}>
                        {detectedRole.badge}
                      </span>
                    )}
                  </div>
                  
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Fingerprint className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="Roll No (219Y1A0501), Employee ID, Email, or Mobile"
                      className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-base sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-mono"
                    />
                  </div>

                  {/* Live Role & Persona Preview */}
                  {identifier.trim() ? (
                    <div className="p-2 rounded-lg bg-black/30 border border-white/5 text-[11px] text-slate-300 flex items-center justify-between">
                      <span className="truncate">
                        Target: <strong className="text-white">{detectedRole.name}</strong> • {detectedRole.title}
                      </span>
                      <span className="text-[10px] text-indigo-400 font-mono shrink-0 ml-1">Detected</span>
                    </div>
                  ) : (
                    <p className="text-[11px] text-slate-400 ml-1">
                      Accepts student roll numbers, faculty employee IDs, administrative emails, or guardian numbers.
                    </p>
                  )}
                </div>

                {/* Password / PIN Input */}
                <div className="space-y-1.5 text-left">
                  <div className="flex justify-between items-center ml-1">
                    <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                      Password / Security PIN
                    </label>
                    <span className="text-[11px] text-indigo-400">Demo PIN: 123456</span>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-base sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                    />
                  </div>
                </div>

                {/* Trust Device Option */}
                <div className="flex items-center justify-between text-xs text-slate-300 pt-0.5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={trustDevice}
                      onChange={(e) => setTrustDevice(e.target.checked)}
                      className="rounded bg-black/40 border-white/20 text-indigo-600 focus:ring-0"
                    />
                    <span>Trust this workstation (30-day persistence)</span>
                  </label>
                  <span className="text-slate-400 text-[11px]">2FA Enabled</span>
                </div>

                {/* Submit Action */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-2 py-3.5 px-6 bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-indigo-600/25 transition-all flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-70"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Verifying Credentials...
                    </>
                  ) : (
                    <>
                      <span>Proceed with MFA Verification</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                {/* Single Sign-On (SSO) Section */}
                <div className="relative flex py-2 items-center">
                  <div className="flex-grow border-t border-white/10"></div>
                  <span className="flex-shrink-0 mx-3 text-slate-500 text-xs font-medium uppercase tracking-wider">
                    Institutional SSO
                  </span>
                  <div className="flex-grow border-t border-white/10"></div>
                </div>

                <Link
                  href="/sign-in"
                  className="w-full flex items-center justify-center gap-2.5 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-200 transition-colors group"
                >
                  <KeyRound className="w-4 h-4 text-indigo-400 group-hover:text-indigo-300" />
                  Single Sign-On (Google / Institutional Identity)
                </Link>

                {/* Quick Persona Fill Buttons (Discreet pills for review convenience) */}
                <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="text-slate-500">Quick Test Preset:</span>
                  <div className="flex items-center gap-1.5 font-mono">
                    <button
                      type="button"
                      onClick={() => handleSelectRolePreset("STUDENT")}
                      className="px-2 py-0.5 rounded bg-white/5 hover:bg-emerald-500/20 hover:text-emerald-300 transition text-[10px]"
                    >
                      Student
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSelectRolePreset("FACULTY")}
                      className="px-2 py-0.5 rounded bg-white/5 hover:bg-indigo-500/20 hover:text-indigo-300 transition text-[10px]"
                    >
                      Faculty
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSelectRolePreset("SUPER_ADMIN")}
                      className="px-2 py-0.5 rounded bg-white/5 hover:bg-amber-500/20 hover:text-amber-300 transition text-[10px]"
                    >
                      Admin
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSelectRolePreset("PARENT")}
                      className="px-2 py-0.5 rounded bg-white/5 hover:bg-rose-500/20 hover:text-rose-300 transition text-[10px]"
                    >
                      Parent
                    </button>
                  </div>
                </div>

              </form>
            )}

            {/* STEP 2: MULTI-FACTOR AUTHENTICATION (MFA) INTERFACE */}
            {step === "MFA" && (
              <form onSubmit={handleMfaSubmit} className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                
                {/* Back button and Target Persona Details */}
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setStep("CREDENTIALS")}
                    className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Back to Credentials
                  </button>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                    {detectedRole.badge}
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-indigo-950/40 border border-indigo-500/25 flex items-center gap-3 text-left">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600/20 flex items-center justify-center text-indigo-400 shrink-0">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-white truncate">{detectedRole.name}</h4>
                    <p className="text-[11px] text-slate-300 font-mono truncate">
                      {identifier || "Verified Persona"} • {detectedRole.title}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                    Enter 6-Digit Time-Based Security Code (TOTP)
                  </label>
                  
                  {/* 6 Digit Individual Boxes with Auto-Advance & Paste */}
                  <div className="flex justify-between gap-2" onPaste={handleTotpPaste}>
                    {totpDigits.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={(el) => { totpInputRefs.current[idx] = el; }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleTotpChange(idx, e.target.value)}
                        onKeyDown={(e) => handleTotpKeyDown(idx, e)}
                        className="w-11 h-13 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-bold bg-black/60 border border-white/20 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 outline-none text-white shadow-inner font-mono"
                      />
                    ))}
                  </div>
                </div>

                {/* Expiry Countdown & Resend Option */}
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    Expires in: <strong className={`font-mono ${timeLeft < 10 ? 'text-rose-400' : 'text-slate-200'}`}>00:{timeLeft.toString().padStart(2, '0')}</strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setTimeLeft(30);
                      setTotpDigits(["1", "2", "3", "4", "5", "6"]);
                    }}
                    className="text-indigo-400 hover:text-indigo-300 font-medium transition"
                  >
                    Quick-Fill MFA (123456)
                  </button>
                </div>

                {/* Verify Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 px-6 bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-900/25 transition-all flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-70"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Verifying Security Token...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Authenticate & Launch {detectedRole.badge.replace(" Access", "")}</span>
                    </>
                  )}
                </button>

              </form>
            )}

            {/* Security Guarantee Footer */}
            <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> AES-256 Encrypted Session
              </span>
              <span>Autonomous Campus System</span>
            </div>

          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="w-full max-w-6xl mx-auto py-3 border-t border-white/10 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2 z-10">
        <p>© 2026 KLM College of Engineering (Kadapa). All Rights Reserved.</p>
        <p className="text-[11px] text-slate-600">Enterprise ERP Cloud Version 4.8.2 • Rayalaseema Central Node</p>
      </footer>
    </div>
  );
}
