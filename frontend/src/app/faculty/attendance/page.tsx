"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { fetchClient } from "@/lib/api-client";
import { useRouter } from "next/navigation";

// ==========================================
// Type Definitions
// ==========================================
interface TimetableSlot {
  slot_id: string;
  course_id: string;
  section_id: string;
  room_number: string;
  start_time: string;
  end_time: string;
}

interface StudentRecord {
  student_id: string;
  first_name: string;
  last_name: string;
  enrollment_number: string;
  status: "PRESENT" | "ABSENT" | "LATE";
  scanned_at?: string;
}

// ==========================================
// SVG Radial Timer Component
// ==========================================
const RadialTimer = ({ timeLeft }: { timeLeft: number }) => {
  const radius = 46;
  const circumference = 2 * Math.PI * radius;
  // Progress goes from 15 to 0
  const strokeDashoffset = circumference - (timeLeft / 15) * circumference;

  return (
    <div className="relative flex items-center justify-center">
      <svg className="w-32 h-32 transform -rotate-90">
        <circle
          className="text-gray-800"
          strokeWidth="8"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx="64"
          cy="64"
        />
        <circle
          className="text-indigo-500 transition-all duration-1000 ease-linear"
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx="64"
          cy="64"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-2xl font-bold font-mono text-white leading-none tracking-tighter">
          {Math.max(0, Math.ceil(timeLeft))}
        </span>
        <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest mt-1">
          Secs
        </span>
      </div>
    </div>
  );
};

export default function LiveAttendanceBroadcast() {
  const router = useRouter();

  // ==========================================
  // State Management
  // ==========================================
  const [activeSlot, setActiveSlot] = useState<TimetableSlot | null>(null);
  const [qrPayload, setQrPayload] = useState<string>("");
  const [timeLeft, setTimeLeft] = useState(15);
  const [roster, setRoster] = useState<StudentRecord[]>([]);
  const [isLocked, setIsLocked] = useState(false);
  
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const qrIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // ==========================================
  // 1. Initial Mount: Verify Active Lecture
  // ==========================================
  useEffect(() => {
    const initializeSession = async () => {
      try {
        const slot = await fetchClient<TimetableSlot>("/timetable/faculty/active-slot");
        setActiveSlot(slot);
        
        // Fetch Initial Roster Baseline
        const rosterData = await fetchClient<StudentRecord[]>(`/attendance/${slot.slot_id}/roster`);
        setRoster(rosterData || []);
        
        // Generate first QR Payload immediately
        generateNewQrPayload(slot.slot_id);
      } catch (err: any) {
        if (err.status === 404) {
          setError("You do not have an active lecture authorized at this time.");
        } else {
          setError(err.detail || "Failed to initialize broadcast session.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    initializeSession();

    return () => {
      if (qrIntervalRef.current) clearInterval(qrIntervalRef.current);
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, []);

  // ==========================================
  // 2. Cryptographic QR Generation Cycle
  // ==========================================
  const generateNewQrPayload = useCallback(async (slotId: string) => {
    if (isLocked) return;
    try {
      const payload = await fetchClient<{ payload: string }>("/attendance/qr/generate", {
        method: "POST",
        body: JSON.stringify({ slot_id: slotId }),
      });
      setQrPayload(payload.payload);
      setTimeLeft(15); // Reset Countdown
    } catch (err) {
      console.error("Failed to cycle QR Payload:", err);
    }
  }, [isLocked]);

  // Master Timer Loop
  useEffect(() => {
    if (!activeSlot || isLocked) return;

    qrIntervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          generateNewQrPayload(activeSlot.slot_id);
          return 15;
        }
        return prev - 1;
      });
    }, 1000);

    // Simulated Polling for Live Ledger updates (fallback if SSE/WebSocket fails)
    pollIntervalRef.current = setInterval(async () => {
      try {
         const liveData = await fetchClient<StudentRecord[]>(`/attendance/${activeSlot.slot_id}/live-ledger`);
         if (liveData) setRoster(liveData);
      } catch(e) {}
    }, 3000);

    return () => {
      if (qrIntervalRef.current) clearInterval(qrIntervalRef.current);
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [activeSlot, isLocked, generateNewQrPayload]);

  // ==========================================
  // 3. Finalize & Lock Register
  // ==========================================
  const handleLockRegister = async () => {
    if (!activeSlot) return;
    try {
      await fetchClient(`/attendance/${activeSlot.slot_id}/lock`, { method: "POST" });
      setIsLocked(true);
      setQrPayload(""); // Kill QR
    } catch (err: any) {
      alert("Failed to lock register: " + err.detail);
    }
  };

  // ==========================================
  // Render
  // ==========================================
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-4">
        <div className="bg-gray-900 border border-gray-800 p-8 rounded-2xl max-w-md w-full text-center shadow-2xl">
           <svg className="w-16 h-16 text-yellow-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
           </svg>
           <h2 className="text-xl font-bold text-white mb-2">No Active Session</h2>
           <p className="text-gray-400 mb-6">{error}</p>
           <button onClick={() => router.push("/faculty/dashboard")} className="px-6 py-2.5 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors">
              Return to Dashboard
           </button>
        </div>
      </div>
    );
  }

  const presentCount = roster.filter(s => s.status === "PRESENT").length;
  const totalRoster = roster.length;
  const absentCount = totalRoster - presentCount;

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex overflow-hidden font-sans">
      
      {/* LEFT: Broadcast Engine */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 relative">
        <div className="absolute top-8 left-8">
           <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
             <div className={`w-3 h-3 rounded-full ${isLocked ? 'bg-red-500' : 'bg-emerald-500 animate-pulse'}`}></div>
             Room {activeSlot?.room_number}
           </h1>
           <p className="text-gray-400 mt-1 font-mono text-sm">Session: {activeSlot?.slot_id.split("-")[0]}</p>
        </div>

        {!isLocked ? (
          <div className="flex flex-col items-center animate-in zoom-in-95 duration-500">
            <div className="bg-white p-6 rounded-[2rem] shadow-[0_0_50px_rgba(99,102,241,0.2)]">
              {qrPayload ? (
                <QRCodeSVG
                  value={qrPayload}
                  size={400}
                  level="H"
                  includeMargin={true}
                  className="rounded-xl"
                />
              ) : (
                <div className="w-[400px] h-[400px] flex items-center justify-center bg-gray-100 rounded-xl">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
                </div>
              )}
            </div>
            
            <div className="mt-12 flex items-center gap-8 bg-gray-900/50 backdrop-blur-sm border border-gray-800 p-4 rounded-3xl pr-8 shadow-xl">
              <RadialTimer timeLeft={timeLeft} />
              <div>
                <h3 className="text-xl font-bold text-white mb-1">Zero-Trust Broadcast Active</h3>
                <p className="text-gray-400 text-sm max-w-[250px]">Instruct students to scan using their mobile application. Code invalidates every 15 seconds.</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center text-center animate-in fade-in duration-500">
             <div className="w-24 h-24 bg-red-900/30 rounded-full flex items-center justify-center mb-6">
                <svg className="w-12 h-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
             </div>
             <h2 className="text-4xl font-bold text-white mb-2">Register Locked</h2>
             <p className="text-gray-400 text-lg">No further attendance scans accepted for this session.</p>
          </div>
        )}
      </div>

      {/* RIGHT: Live Ledger */}
      <div className="w-[450px] bg-gray-900 border-l border-gray-800 flex flex-col shadow-2xl z-10">
        
        {/* Ledger Header */}
        <div className="p-6 border-b border-gray-800 bg-gray-900/80 backdrop-blur-md sticky top-0">
          <h2 className="text-xl font-bold text-white mb-4">Live Ledger</h2>
          <div className="grid grid-cols-3 gap-3">
             <div className="bg-gray-950 border border-gray-800 rounded-xl p-3 text-center">
                <div className="text-2xl font-bold text-white">{totalRoster}</div>
                <div className="text-[10px] text-gray-400 uppercase font-bold tracking-widest mt-1">Roster</div>
             </div>
             <div className="bg-emerald-950/30 border border-emerald-900/50 rounded-xl p-3 text-center">
                <div className="text-2xl font-bold text-emerald-400">{presentCount}</div>
                <div className="text-[10px] text-emerald-600 uppercase font-bold tracking-widest mt-1">Present</div>
             </div>
             <div className="bg-red-950/30 border border-red-900/50 rounded-xl p-3 text-center">
                <div className="text-2xl font-bold text-red-400">{absentCount}</div>
                <div className="text-[10px] text-red-600 uppercase font-bold tracking-widest mt-1">Absent</div>
             </div>
          </div>
        </div>

        {/* Ledger List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {roster.map((student) => (
            <div key={student.student_id} className="bg-gray-950/50 border border-gray-800 p-4 rounded-xl flex items-center justify-between group hover:border-gray-700 transition-colors">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center font-bold text-sm text-gray-300">
                    {student.first_name[0]}{student.last_name[0]}
                 </div>
                 <div>
                    <h4 className="text-sm font-semibold text-gray-200">{student.first_name} {student.last_name}</h4>
                    <p className="text-xs text-gray-500 font-mono">{student.enrollment_number}</p>
                 </div>
              </div>
              
              {student.status === "PRESENT" ? (
                 <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase tracking-wider rounded-md border border-emerald-500/20">Present</span>
              ) : (
                 <span className="px-2.5 py-1 bg-gray-800 text-gray-500 text-[10px] font-bold uppercase tracking-wider rounded-md">Pending</span>
              )}
            </div>
          ))}
          {roster.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-sm">No students assigned to this section.</p>
            </div>
          )}
        </div>

        {/* Ledger Footer */}
        <div className="p-6 border-t border-gray-800 bg-gray-900/80 backdrop-blur-md">
          <button
            onClick={handleLockRegister}
            disabled={isLocked}
            className="w-full py-3.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold rounded-xl shadow-lg shadow-red-900/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
          >
            {isLocked ? "Register Locked" : "Finalize & Lock Register"}
          </button>
          {!isLocked && (
             <p className="text-center text-xs text-gray-500 mt-3">
               Register auto-locks 15 minutes after session end.
             </p>
          )}
        </div>

      </div>
    </div>
  );
}
