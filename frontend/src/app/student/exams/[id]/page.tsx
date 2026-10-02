"use client";

import { useEffect, useState, useRef } from 'react';
import { ShieldAlert, CheckCircle, WifiOff, Lock, Video } from 'lucide-react';

export default function SecureExamProctoring({ params }: { params: { id: string } }) {
  const [warnings, setWarnings] = useState(0);
  const [examLocked, setExamLocked] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  // =======================================================
  // 1. Real-Time Telemetry & Environmental Handshake
  // =======================================================
  useEffect(() => {
    // Establish Secure Telemetry WebSocket with Backend
    wsRef.current = new WebSocket(`ws://localhost:8000/api/v1/exams/ws/${params.id}/proctoring?student_id=student123`);
    
    wsRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.action === "ISSUE_WARNING") {
        setWarnings(prev => prev + 1);
        alert(`SECURITY WARNING: ${data.reason}. You have ${data.warnings_remaining} warnings left before the exam is locked.`);
      } else if (data.action === "LOCK_EXAM") {
        setExamLocked(true);
      }
    };

    // Client-side Browser API Hardening (Blur, Tab Switch, Clipboard, Fullscreen)
    const handleVisibilityChange = () => {
      if (document.hidden && wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ event: "TAB_SWITCH", timestamp: Date.now(), confidence: 1.0 }));
      }
    };
    
    const handleBlur = () => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ event: "WINDOW_BLUR", timestamp: Date.now(), confidence: 1.0 }));
      }
    };

    const handleCopyPaste = (e: ClipboardEvent) => {
      e.preventDefault();
      wsRef.current?.send(JSON.stringify({ event: "CLIPBOARD_VIOLATION", timestamp: Date.now(), confidence: 1.0 }));
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleBlur);
    document.addEventListener("copy", handleCopyPaste);
    document.addEventListener("paste", handleCopyPaste);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleBlur);
      document.removeEventListener("copy", handleCopyPaste);
      document.removeEventListener("paste", handleCopyPaste);
      wsRef.current?.close();
    };
  }, [params.id]);

  // =======================================================
  // 2. Resilient Auto-Saving & Offline Buffering
  // =======================================================
  useEffect(() => {
    // 10-second heartbeat to flush the encrypted IndexedDB buffer to the Write-Through API
    const heartbeat = setInterval(async () => {
      if (!navigator.onLine) {
        setIsOffline(true);
        // Student is experiencing a blackout. State remains secured in local IndexedDB.
        return; 
      }
      setIsOffline(false);
      
      try {
        // Fetch pending deltas from IndexedDB (Simulated)
        const deltas = [{ 
            question_id: "q_429", 
            answer_payload: "Dijkstra's Algorithm", 
            client_timestamp: Date.now(), 
            cryptographic_signature: "hash_xyz" 
        }];
        
        await fetch(`http://localhost:8000/api/v1/exams/${params.id}/heartbeat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ student_id: "student123", deltas })
        });
      } catch (err) {
        // Fallback to offline mode seamlessly
        setIsOffline(true);
      }
    }, 10000);

    return () => clearInterval(heartbeat);
  }, [params.id]);

  // =======================================================
  // UI Rendering
  // =======================================================
  if (examLocked) {
    return (
      <div className="min-h-screen bg-red-950 flex flex-col items-center justify-center text-white p-4">
        <Lock className="w-20 h-20 text-red-500 mb-6" />
        <h1 className="text-4xl font-bold mb-4 tracking-tight">EXAM LOCKED</h1>
        <p className="text-xl text-red-200 text-center max-w-lg">
          Your exam has been mathematically locked due to critical security violations. 
          Please contact the chief proctor immediately to review the telemetry logs.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0f19] text-white p-8 font-sans">
      <div className="max-w-6xl mx-auto relative">
        
        {/* Telemetry Status Bar */}
        <div className="bg-[#111827] border border-[#1f2937] rounded-2xl p-5 flex justify-between items-center mb-8 shadow-xl">
          <div className="flex items-center space-x-4">
            <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
            <span className="font-mono text-emerald-400 font-bold tracking-wide">SECURE PROCTOR ENGINE ACTIVE</span>
          </div>
          
          <div className="flex space-x-8">
            {isOffline ? (
              <div className="flex items-center text-amber-500 text-sm font-bold bg-amber-500/10 px-4 py-2 rounded-lg border border-amber-500/20">
                <WifiOff className="w-4 h-4 mr-2" /> OFFLINE (Saving to Local Encrypted Buffer)
              </div>
            ) : (
              <div className="flex items-center text-blue-400 text-sm font-bold">
                <CheckCircle className="w-4 h-4 mr-2" /> DELTA SYNCED
              </div>
            )}
            
            <div className="flex items-center text-red-400 text-sm font-bold bg-red-500/10 px-4 py-2 rounded-lg border border-red-500/20">
              <ShieldAlert className="w-4 h-4 mr-2" /> {warnings}/3 WARNINGS
            </div>
          </div>
        </div>

        {/* Mock Exam Content */}
        <div className="bg-[#111827] border border-[#1f2937] rounded-2xl p-10 min-h-[65vh] shadow-xl">
          <h2 className="text-3xl font-bold mb-4 tracking-tight">Final Examination: Advanced Data Structures</h2>
          <p className="text-gray-400 mb-10 pb-6 border-b border-gray-800">
            This window is actively monitored. Switching tabs, losing focus, attempting to copy/paste, or looking away from the screen will result in a hard warning.
          </p>
          <div className="space-y-4">
            <div className="h-6 w-3/4 bg-gray-800 rounded animate-pulse"></div>
            <div className="h-6 w-full bg-gray-800 rounded animate-pulse"></div>
            <div className="h-6 w-5/6 bg-gray-800 rounded animate-pulse"></div>
          </div>
        </div>

        {/* Floating Webcam Feed (TensorFlow.js / MediaPipe Target) */}
        <div className="absolute bottom-8 right-8 w-64 h-48 bg-black border-2 border-[#1f2937] rounded-xl overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.5)] flex flex-col items-center justify-center group">
           <Video className="w-8 h-8 text-gray-600 mb-2 group-hover:text-blue-500 transition-colors" />
           <span className="text-xs text-gray-500 font-mono text-center px-4">
             TensorFlow.js Face Mesh<br/>Real-Time Feed
           </span>
           <div className="absolute top-2 right-2 flex space-x-1">
             <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
           </div>
        </div>
        
      </div>
    </div>
  );
}
