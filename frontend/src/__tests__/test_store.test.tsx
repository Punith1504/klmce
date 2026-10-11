import { describe, it, expect } from 'vitest';

describe('State Management & Optimistic Updates', () => {
  interface AttendanceStore {
    records: Record<string, 'PRESENT' | 'ABSENT'>;
    markAttendance: (studentId: string, status: 'PRESENT' | 'ABSENT') => void;
    rollback: (previousState: Record<string, 'PRESENT' | 'ABSENT'>) => void;
  }

  function createAttendanceStore(initial: Record<string, 'PRESENT' | 'ABSENT'> = {}): AttendanceStore {
    let state = { ...initial };
    return {
      get records() {
        return state;
      },
      markAttendance(studentId, status) {
        state = { ...state, [studentId]: status };
      },
      rollback(previous) {
        state = { ...previous };
      },
    };
  }

  it('optimistically updates attendance and rolls back when server network request fails', async () => {
    const store = createAttendanceStore({ '219Y1A0501': 'PRESENT' });
    const backupState = { ...store.records };

    // 1. Optimistic update
    store.markAttendance('219Y1A0501', 'ABSENT');
    expect(store.records['219Y1A0501']).toBe('ABSENT');

    // 2. Simulated network failure
    const mockServerSync = async (): Promise<{ success: boolean }> => {
      return { success: false };
    };

    const result = await mockServerSync();
    if (!result.success) {
      store.rollback(backupState);
    }

    // 3. Rollback assertion
    expect(store.records['219Y1A0501']).toBe('PRESENT');
  });

  it('preserves successful optimistic updates when server confirms sync', async () => {
    const store = createAttendanceStore({ '219Y1A0501': 'PRESENT', '219Y1A0502': 'PRESENT' });

    // Mark student as absent
    store.markAttendance('219Y1A0502', 'ABSENT');
    expect(store.records['219Y1A0502']).toBe('ABSENT');

    // Confirm server success
    const mockServerSync = async () => ({ success: true });
    const result = await mockServerSync();
    expect(result.success).toBe(true);
    expect(store.records['219Y1A0502']).toBe('ABSENT');
  });
});
