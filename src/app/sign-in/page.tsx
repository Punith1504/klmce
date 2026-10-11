import { SignIn } from "@clerk/nextjs";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-[#070514] flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans text-white">
      {/* Background gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-600/20 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-fuchsia-600/20 blur-[130px] pointer-events-none" />

      <div className="w-full max-w-md mb-4 flex items-center justify-between z-10">
        <Link 
          href="/" 
          className="flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-white transition-colors bg-white/5 border border-white/10 px-3.5 py-2 rounded-xl backdrop-blur-md"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Unified Institutional Portal
        </Link>
      </div>

      <div className="relative z-10">
        <SignIn 
          routing="hash"
          fallbackRedirectUrl="/student/dashboard"
        />
      </div>
    </div>
  );
}
