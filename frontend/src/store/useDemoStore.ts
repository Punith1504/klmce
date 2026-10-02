import { create } from 'zustand';

interface DemoState {
    // 1. Stealth Mode Toggle
    isPitchModeActive: boolean;
    togglePitchMode: () => void;
    
    // 2. High-Frequency WebSocket Simulation
    isAttendanceRushSimulating: boolean;
    triggerAttendanceRush: () => void;
    stopAttendanceRush: () => void;
    
    // 3. AI / pgvector Golden Path Injection
    perfectMatchKeywords: string;
    triggerPerfectMatch: () => void;
    resetPerfectMatch: () => void;
}

export const useDemoStore = create<DemoState>((set) => ({
    // Initialization
    isPitchModeActive: false,
    togglePitchMode: () => set((state) => ({ isPitchModeActive: !state.isPitchModeActive })),
    
    // Simulates 500+ students tapping RFID cards simultaneously across the campus
    isAttendanceRushSimulating: false,
    triggerAttendanceRush: () => set({ isAttendanceRushSimulating: true }),
    stopAttendanceRush: () => set({ isAttendanceRushSimulating: false }),
    
    // Injects highly specific keywords into the DOM to mathematically guarantee a 99% 
    // Cosine Distance match via the PostgreSQL HNSW index for the live demo
    perfectMatchKeywords: "",
    triggerPerfectMatch: () => set({ 
        perfectMatchKeywords: "Seeking a highly capable Full-Stack Software Engineer with deep expertise in Next.js 16 App Router, PostgreSQL pgvector HNSW indexing, WebSockets, and Distributed Systems micro-architecture." 
    }),
    resetPerfectMatch: () => set({ perfectMatchKeywords: "" })
}));
