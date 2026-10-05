import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface DemoState {
    // 1. Auth State
    currentUser: { name: string; role: string; email: string; avatar?: string } | null;
    login: (user: { name: string; role: string; email: string; avatar?: string }) => void;
    logout: () => void;

    // 2. Stealth Mode Toggle
    isPitchModeActive: boolean;
    togglePitchMode: () => void;
    
    // 3. High-Frequency WebSocket Simulation
    isAttendanceRushSimulating: boolean;
    triggerAttendanceRush: () => void;
    stopAttendanceRush: () => void;
    
    // 4. AI / pgvector Golden Path Injection
    perfectMatchKeywords: string;
    triggerPerfectMatch: () => void;
    resetPerfectMatch: () => void;
}

export const useDemoStore = create<DemoState>()(
  persist(
    (set) => ({
      currentUser: null,
      login: (user) => set({ currentUser: user }),
      logout: () => set({ currentUser: null }),
      
      // Initialization
      isPitchModeActive: false,
      togglePitchMode: () => set((state) => ({ isPitchModeActive: !state.isPitchModeActive })),
      
      isAttendanceRushSimulating: false,
      triggerAttendanceRush: () => set({ isAttendanceRushSimulating: true }),
      stopAttendanceRush: () => set({ isAttendanceRushSimulating: false }),
      
      perfectMatchKeywords: "",
      triggerPerfectMatch: () => set({ 
          perfectMatchKeywords: "Seeking a highly capable Full-Stack Software Engineer with deep expertise in Next.js 16 App Router, PostgreSQL pgvector HNSW indexing, WebSockets, and Distributed Systems micro-architecture." 
      }),
      resetPerfectMatch: () => set({ perfectMatchKeywords: "" })
    }),
    {
      name: 'klmce-demo-auth', // name of the item in the storage (must be unique)
    }
  )
);
