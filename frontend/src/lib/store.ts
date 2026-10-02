import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  role: 'SUPER_ADMIN' | 'INSTITUTION_ADMIN' | 'FACULTY' | 'STUDENT' | 'PARENT' | null;
  email: string | null;
  name: string | null;
  setAuthContext: (role: AuthState['role'], email: string, name: string) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      role: null,
      email: null,
      name: null,
      setAuthContext: (role, email, name) => set({ role, email, name }),
      clearAuth: () => set({ role: null, email: null, name: null }),
    }),
    {
      name: 'klmce-auth-storage', // Saves to localStorage for client-side hydration
    }
  )
);
