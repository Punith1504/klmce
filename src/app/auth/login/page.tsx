"use client";

import { useState, useRef, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { fetchClient } from "@/lib/api-client";
import { useDemoStore } from "@/store/useDemoStore";

// ==========================================
// Zod Validation Schemas
// ==========================================
const credentialsSchema = z.object({
  email: z.string().email({ message: "Please enter a valid institutional email address." }),
  password: z.string().min(8, { message: "Password must be at least 8 characters long." }),
});

const totpSchema = z.object({
  totp_code: z.string().length(6, { message: "TOTP code must be exactly 6 digits." }).regex(/^\d+$/, "Must contain only numbers"),
});

type CredentialsForm = z.infer<typeof credentialsSchema>;
type TotpForm = z.infer<typeof totpSchema>;

export default function LoginPage() {
  const router = useRouter();
  
  // ==========================================
  // State Management
  // ==========================================
  const [step, setStep] = useState<"CREDENTIALS" | "TOTP">("CREDENTIALS");
  const [globalError, setGlobalError] = useState<{ title: string; detail: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [cachedCredentials, setCachedCredentials] = useState<CredentialsForm | null>(null);
  const [timeLeft, setTimeLeft] = useState(30);

  // ==========================================
  // Forms & Refs
  // ==========================================
  const credsForm = useForm<CredentialsForm>({ resolver: zodResolver(credentialsSchema) });
  const totpForm = useForm<TotpForm>({ resolver: zodResolver(totpSchema) });
  const totpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // ==========================================
  // Mock Auth Handlers
  // ==========================================
  const { login } = useDemoStore();

  const handleSuccess = (role: string, name: string, email: string) => {
    login({ name, role, email });
    const routes: Record<string, string> = {
      SUPER_ADMIN: "/admin/dashboard",
      INSTITUTION_ADMIN: "/admin/dashboard",
      FACULTY: "/faculty/dashboard",
      STUDENT: "/student/dashboard",
      PARENT: "/parent/dashboard",
      FINANCE: "/finance/dashboard",
      HR: "/hr/dashboard"
    };
    router.push(routes[role] || "/dashboard");
  };

  const onCredsSubmit = async (data: CredentialsForm) => {
    setIsLoading(true);
    setGlobalError(null);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));

    try {
      // MOCK AUTHENTICATION LOGIC
      const email = data.email.toLowerCase();
      
      if (email === 'admin@klmce.edu' || email === 'admin@klmce.ac.in') {
        handleSuccess('SUPER_ADMIN', 'Punith', email);
      } else if (email.startsWith('student')) {
        handleSuccess('STUDENT', 'Arjun Reddy', email);
      } else if (email.startsWith('faculty')) {
        handleSuccess('FACULTY', 'Dr. CV Raman', email);
      } else if (email.startsWith('parent')) {
        handleSuccess('PARENT', 'Rajesh Reddy', email);
      } else {
        // Fallback for any other email to go to student
        handleSuccess('STUDENT', 'Guest Student', email);
      }
    } catch (err: any) {
      setGlobalError({
        title: "Authentication Failed",
        detail: "Invalid credentials.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onTotpSubmit = async (data: TotpForm) => {
    // Totp is bypassed in this mock setup, but keeping the signature
    setIsLoading(false);
  };

  // ==========================================
  // TOTP Interactive Logic (Paste, Backspace, Auto-advance)
  // ==========================================
  const handleTotpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    
    const currentTotp = totpForm.getValues("totp_code") || "";
    const newTotp = currentTotp.substring(0, index) + value + currentTotp.substring(index + 1);
    totpForm.setValue("totp_code", newTotp.substring(0, 6), { shouldValidate: true });

    if (value && index < 5) {
      totpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleTotpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      const currentTotp = totpForm.getValues("totp_code") || "";
      if (!currentTotp[index] && index > 0) {
        totpInputRefs.current[index - 1]?.focus();
      } else {
        const newTotp = currentTotp.substring(0, index) + " " + currentTotp.substring(index + 1);
        totpForm.setValue("totp_code", newTotp.trim());
      }
    }
  };

  const handleTotpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pastedData) {
      totpForm.setValue("totp_code", pastedData, { shouldValidate: true });
      totpInputRefs.current[Math.min(pastedData.length, 5)]?.focus();
    }
  };

  useEffect(() => {
    if (step === "TOTP" && timeLeft > 0) {
      const timerId = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timerId);
    }
  }, [step, timeLeft]);

  // ==========================================
  // UI Render
  // ==========================================
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 p-4 font-sans text-gray-100 selection:bg-indigo-500/30">
      <div className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-3xl shadow-2xl overflow-hidden backdrop-blur-lg">
        <div className="p-8">
          <div className="flex justify-center mb-6">
            <div className="w-12 h-12 bg-gradient-to-tr from-indigo-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
               <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
               </svg>
            </div>
          </div>
          <h2 className="text-3xl font-bold mb-2 text-white text-center tracking-tight">KLMCE Gateway</h2>
          <p className="text-gray-400 text-center mb-8 text-sm">
            {step === "CREDENTIALS" ? "Sign in with your institutional credentials" : "Enter your Two-Factor Authentication Code"}
          </p>

          {globalError && (
            <div className="mb-6 p-4 rounded-xl bg-red-950/40 border border-red-900/50 flex items-start animate-in fade-in slide-in-from-top-2">
              <svg className="w-5 h-5 text-red-500 mt-0.5 mr-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h4 className="text-sm font-semibold text-red-400">{globalError.title}</h4>
                <p className="text-sm text-red-300 mt-1">{globalError.detail}</p>
              </div>
            </div>
          )}

          {/* Step 1: Credentials Form */}
          {step === "CREDENTIALS" && (
            <form onSubmit={credsForm.handleSubmit(onCredsSubmit)} className="space-y-5 animate-in fade-in zoom-in-95 duration-300">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5 ml-1">Email Address</label>
                <input
                  type="email"
                  {...credsForm.register("email")}
                  className="w-full px-4 py-3.5 bg-gray-950/50 border border-gray-800 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder-gray-600 text-gray-100"
                  placeholder="admin@klmce.edu"
                />
                {credsForm.formState.errors.email && (
                  <p className="text-red-400 text-xs mt-1.5 ml-1">{credsForm.formState.errors.email.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5 ml-1">Password</label>
                <input
                  type="password"
                  {...credsForm.register("password")}
                  className="w-full px-4 py-3.5 bg-gray-950/50 border border-gray-800 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder-gray-600 text-gray-100"
                  placeholder="••••••••"
                />
                {credsForm.formState.errors.password && (
                  <p className="text-red-400 text-xs mt-1.5 ml-1">{credsForm.formState.errors.password.message}</p>
                )}
              </div>
              
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium rounded-xl shadow-lg shadow-indigo-900/20 transform transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isLoading ? (
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  ) : (
                    "Sign In to Portal"
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Step 2: TOTP Form */}
          {step === "TOTP" && (
            <form onSubmit={totpForm.handleSubmit(onTotpSubmit)} className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              <div className="flex justify-between gap-2" onPaste={handleTotpPaste}>
                {Array.from({ length: 6 }).map((_, i) => (
                  <Controller
                    key={i}
                    control={totpForm.control}
                    name="totp_code"
                    render={({ field }) => (
                      <input
                        type="text"
                        maxLength={1}
                        className="w-12 h-14 text-center text-2xl font-bold bg-gray-950/80 border border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-white shadow-inner"
                        value={field.value?.[i] || ""}
                        onChange={(e) => handleTotpChange(i, e.target.value)}
                        onKeyDown={(e) => handleTotpKeyDown(i, e)}
                        ref={(el) => {
                           totpInputRefs.current[i] = el;
                           // Auto focus first empty input on render
                           if (i === 0 && !field.value) el?.focus(); 
                        }}
                      />
                    )}
                  />
                ))}
              </div>
              {totpForm.formState.errors.totp_code && (
                <p className="text-red-400 text-xs text-center">{totpForm.formState.errors.totp_code.message}</p>
              )}
              
              <button
                type="submit"
                disabled={isLoading || (totpForm.watch("totp_code")?.length !== 6)}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium rounded-xl shadow-lg shadow-purple-900/20 transform transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? "Verifying..." : "Verify Identity"}
              </button>

              <div className="text-center pt-2">
                 <p className="text-xs text-gray-500">
                    Code expires in <span className={`font-mono ${timeLeft < 10 ? 'text-red-400' : 'text-gray-300'}`}>00:{timeLeft.toString().padStart(2, '0')}</span>
                 </p>
                 <button type="button" onClick={() => setStep("CREDENTIALS")} className="mt-4 text-sm text-indigo-400 hover:text-indigo-300 transition-colors">
                    ← Back to Login
                 </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
