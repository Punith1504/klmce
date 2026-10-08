"use client";

import { useEffect, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { fetchClient } from "@/lib/api-client";

export default function QRScanner() {
  const [status, setStatus] = useState<"IDLE" | "SCANNING" | "SUCCESS" | "ERROR">("IDLE");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (status !== "SCANNING") return;

    // Initialize scanner
    const scanner = new Html5QrcodeScanner(
      "qr-reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      /* verbose= */ false
    );

    scanner.render(async (decodedText) => {
      // 1. Pause immediately upon capture to prevent spam scanning
      scanner.pause();
      setStatus("IDLE");
      setMessage("Verifying attendance code...");
      try {
        await fetchClient.post("/attendance/scan", {qr_payload: decodedText});

        setStatus("SUCCESS");
        setMessage("Attendance recorded.");
      } catch (err: any) {
        setStatus("ERROR");
        setMessage(err.message || "Failed to verify QR code constraints.");
      } finally {
        scanner.clear();
      }
    }, (error) => {
      // Background scanning errors can be safely ignored
    });

    return () => {
      scanner.clear().catch(console.error);
    };
  }, [status]);

  return (
    <div className="flex flex-col items-center p-8 bg-white rounded-2xl shadow-xl border border-slate-100 max-w-lg mx-auto">
      <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
        <svg className="w-8 h-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </div>
      <h2 className="text-2xl font-black text-slate-800 mb-2">Classroom Attendance</h2>
      <p className="text-slate-500 mb-6 text-center">Scan the dynamic QR code displayed by your professor.</p>
      
      {status === "SCANNING" && (
        <div id="qr-reader" className="w-full overflow-hidden rounded-xl border-4 border-indigo-500 shadow-inner" />
      )}
      
      {status !== "SCANNING" && (
        <button
          onClick={() => setStatus("SCANNING")}
          className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-lg transition-transform transform active:scale-95"
        >
          Initialize Optical Scanner
        </button>
      )}

      {message && (
        <div className={`mt-6 p-4 rounded-xl w-full text-center font-medium ${status === "SUCCESS" ? 'bg-green-50 text-green-700 border border-green-200 shadow-sm' : 'bg-red-50 text-red-700 border border-red-200 shadow-sm'}`}>
          {message}
        </div>
      )}
    </div>
  );
}
