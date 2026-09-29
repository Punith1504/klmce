"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";
import { fetchClient } from "@/lib/api-client";
import { useRouter } from "next/navigation";

// ==========================================
// Types
// ==========================================
type ScanState = "IDLE" | "SCANNING" | "LOCATING" | "SUBMITTING" | "SUCCESS" | "ERROR";

interface RFC7807Error {
  status: number;
  type: string;
  title: string;
  detail: string;
}

export default function StudentScannerPWA() {
  const router = useRouter();

  // ==========================================
  // State Management
  // ==========================================
  const [scanState, setScanState] = useState<ScanState>("IDLE");
  const [errorDetails, setErrorDetails] = useState<RFC7807Error | null>(null);
  const [cameraPermissionError, setCameraPermissionError] = useState(false);
  
  // Ref for the QR Code mount point
  const scannerRef = useRef<HTMLDivElement>(null);
  // Ref to hold the active scanner instance to ensure clean unmounting
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  // Guard flag to prevent double-scanning during async handshakes
  const isProcessingRef = useRef(false);

  // ==========================================
  // API Submission Engine
  // ==========================================
  const processAttendanceScan = useCallback(async (qrPayload: string) => {
    if (isProcessingRef.current) return;
    isProcessingRef.current = true;
    
    try {
      // 1. Immediately pause the camera to conserve battery and provide visual feedback
      if (html5QrCodeRef.current?.isScanning) {
         await html5QrCodeRef.current.pause();
      }

      setScanState("LOCATING");

      // 2. Extract Device Geolocation via Browser API
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        if (!navigator.geolocation) {
          reject(new Error("Geolocation is not supported by your browser"));
        } else {
          navigator.geolocation.getCurrentPosition(resolve, reject, { 
             enableHighAccuracy: true, 
             timeout: 10000, 
             maximumAge: 0 
          });
        }
      });

      setScanState("SUBMITTING");

      // 3. Dispatch Cryptographic Handshake
      await fetchClient("/attendance/scan", {
        method: "POST",
        body: JSON.stringify({
          qr_payload: qrPayload,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        }),
      });

      // 4. Success Pipeline
      setScanState("SUCCESS");

    } catch (err: any) {
      setScanState("ERROR");
      
      if (err instanceof GeolocationPositionError) {
        setErrorDetails({
          status: 403,
          type: "probs/geolocation-denied",
          title: "Location Access Denied",
          detail: "You must allow location access to prove you are physically inside the classroom."
        });
      } else {
        // Standard RFC 7807 Extraction
        setErrorDetails({
          status: err.status || 500,
          type: err.type || "probs/internal-error",
          title: err.title || "Scan Failed",
          detail: err.detail || "An unexpected error occurred while validating the QR code.",
        });
      }
    } finally {
      // Ensure the scanner is physically stopped to release hardware locks
      if (html5QrCodeRef.current?.isScanning) {
        await html5QrCodeRef.current.stop().catch(() => {});
      }
      isProcessingRef.current = false;
    }
  }, []);

  // ==========================================
  // Hardware Lifecycle Management
  // ==========================================
  const startScanner = async () => {
    setScanState("SCANNING");
    setErrorDetails(null);
    setCameraPermissionError(false);
    isProcessingRef.current = false;

    if (!scannerRef.current) return;

    try {
      // Initialize if null
      if (!html5QrCodeRef.current) {
         html5QrCodeRef.current = new Html5Qrcode(scannerRef.current.id, {
            formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE]
         });
      }

      // Prioritize the rear-facing environment camera
      await html5QrCodeRef.current.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        (decodedText) => {
          // On valid QR string capture
          processAttendanceScan(decodedText);
        },
        (errorMessage) => {
          // Background parse failures - safely ignore
        }
      );
    } catch (err) {
      console.error("Camera Init Error:", err);
      setScanState("ERROR");
      setCameraPermissionError(true);
      setErrorDetails({
        status: 403,
        type: "probs/camera-denied",
        title: "Camera Access Required",
        detail: "Please grant camera permissions in your browser settings to scan attendance."
      });
    }
  };

  useEffect(() => {
    const handleVisibilityChange = () => {
      // Hardware Lifecycle: Only engage the camera if the PWA is physically in focus
      if (document.visibilityState === "visible") {
        if (!html5QrCodeRef.current?.isScanning && (scanState === "IDLE" || scanState === "ERROR")) {
          startScanner();
        }
      } else {
        // Immediately drop the hardware lock if the user minimizes the app or swaps tabs
        if (html5QrCodeRef.current?.isScanning) {
          html5QrCodeRef.current.stop().catch(console.error);
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Auto-start on mount if the document is actively visible
    if (document.visibilityState === "visible") {
      startScanner();
    }

    // Aggressive cleanup on unmount to release webcam light
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (html5QrCodeRef.current?.isScanning) {
         html5QrCodeRef.current.stop().catch(console.error);
      }
    };
  }, [scanState]); // eslint-disable-line react-hooks/exhaustive-deps

  // ==========================================
  // UI Renderer
  // ==========================================
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col font-sans selection:bg-indigo-500/30">
      
      {/* PWA Header */}
      <div className="bg-gray-900 border-b border-gray-800 p-4 sticky top-0 z-50 flex items-center justify-between shadow-lg">
         <button onClick={() => router.push("/student/dashboard")} className="p-2 text-gray-400 hover:text-white transition-colors bg-gray-800 rounded-full">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
         </button>
         <h1 className="text-lg font-bold text-white tracking-tight">Attendance Scanner</h1>
         <div className="w-9"></div> {/* Balancer */}
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 relative">
        
        {/* Dynamic State Overlays */}
        {scanState === "SUCCESS" ? (
           <div className="flex flex-col items-center text-center animate-in zoom-in duration-300">
             <div className="w-24 h-24 bg-emerald-500/20 rounded-full flex items-center justify-center mb-6 shadow-[0_0_50px_rgba(16,185,129,0.3)]">
                <svg className="w-12 h-12 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
             </div>
             <h2 className="text-3xl font-black text-white mb-2">Verified!</h2>
             <p className="text-gray-400 font-medium">Your attendance has been successfully recorded securely.</p>
             <button onClick={() => router.push("/student/dashboard")} className="mt-8 px-8 py-3 bg-gray-800 hover:bg-gray-700 text-white font-bold rounded-xl shadow-lg transition-all active:scale-[0.98]">
                Return to Dashboard
             </button>
           </div>
        ) : scanState === "ERROR" && errorDetails ? (
           <div className="flex flex-col items-center text-center w-full max-w-sm animate-in slide-in-from-bottom-4 duration-300">
             <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(239,68,68,0.3)]">
                <svg className="w-10 h-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
             </div>
             <h2 className="text-2xl font-bold text-white mb-2">{errorDetails.title}</h2>
             <p className="text-gray-400 text-sm leading-relaxed mb-8">{errorDetails.detail}</p>
             
             <button onClick={startScanner} className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-900/20 transition-all active:scale-[0.98]">
                Try Scanning Again
             </button>
           </div>
        ) : (
           <div className="w-full max-w-sm flex flex-col items-center animate-in fade-in duration-500">
              
              {/* Hardware Scanner Mount Point */}
              <div className="relative w-full aspect-square bg-black rounded-3xl overflow-hidden shadow-2xl border-2 border-gray-800">
                <div id="student-qr-scanner-mount" ref={scannerRef} className="w-full h-full object-cover"></div>
                
                {/* Visual Target Reticle */}
                {scanState === "SCANNING" && (
                   <div className="absolute inset-0 pointer-events-none">
                     <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[70%] h-[70%] border-2 border-indigo-500/50 rounded-2xl flex items-center justify-center">
                        <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-indigo-500 rounded-tl-2xl"></div>
                        <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-indigo-500 rounded-tr-2xl"></div>
                        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-indigo-500 rounded-bl-2xl"></div>
                        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-indigo-500 rounded-br-2xl"></div>
                     </div>
                   </div>
                )}
              </div>

              {/* Status Indicators */}
              <div className="mt-8 text-center h-16">
                 {scanState === "SCANNING" && (
                    <>
                       <h3 className="text-white font-bold text-lg animate-pulse">Point at the board</h3>
                       <p className="text-gray-400 text-sm mt-1">Align the QR code within the frame.</p>
                    </>
                 )}
                 {scanState === "LOCATING" && (
                    <div className="flex flex-col items-center">
                       <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500 mb-2"></div>
                       <p className="text-indigo-400 font-bold text-sm">Verifying physical location...</p>
                    </div>
                 )}
                 {scanState === "SUBMITTING" && (
                    <div className="flex flex-col items-center">
                       <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-500 mb-2"></div>
                       <p className="text-emerald-400 font-bold text-sm">Executing Cryptographic Handshake...</p>
                    </div>
                 )}
              </div>

           </div>
        )}
      </div>

    </div>
  );
}
