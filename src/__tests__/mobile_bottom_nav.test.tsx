import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';
import { RoleProvider } from '@/lib/auth/roleContext';

const mockPush = vi.fn();
let currentPathname = '/student/dashboard';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => currentPathname,
}));

vi.mock('@clerk/nextjs', () => ({
  useUser: () => ({ user: null, isLoaded: true, isSignedIn: false }),
  useClerk: () => ({ signOut: vi.fn() }),
}));

describe('MobileBottomNav Component', () => {
  beforeEach(() => {
    mockPush.mockClear();
    currentPathname = '/student/dashboard';
  });

  it('renders student navigation tabs on student routes', () => {
    render(
      <RoleProvider>
        <MobileBottomNav />
      </RoleProvider>
    );

    expect(screen.getByText('Home')).toBeDefined();
    expect(screen.getByText('Attendance')).toBeDefined();
    expect(screen.getByText('Grades')).toBeDefined();
    expect(screen.getByText('Fees')).toBeDefined();
    expect(screen.getByText('All Pages')).toBeDefined();
  });

  it('renders faculty navigation tabs on faculty routes', () => {
    currentPathname = '/faculty/dashboard';

    render(
      <RoleProvider>
        <MobileBottomNav />
      </RoleProvider>
    );

    expect(screen.getByText('Home')).toBeDefined();
    expect(screen.getByText('Attendance')).toBeDefined();
    expect(screen.getByText('Marks')).toBeDefined();
    expect(screen.getByText('Mentoring')).toBeDefined();
  });

  it('renders parent navigation tabs on parent routes', () => {
    currentPathname = '/parent/dashboard';

    render(
      <RoleProvider>
        <MobileBottomNav />
      </RoleProvider>
    );

    expect(screen.getByText('Ward')).toBeDefined();
    expect(screen.getByText('Attendance')).toBeDefined();
    expect(screen.getByText('Fee Pay')).toBeDefined();
    expect(screen.getByText('Mentor')).toBeDefined();
  });

  it('opens complete full menu drawer when tapping All Pages', () => {
    currentPathname = '/student/dashboard';

    render(
      <RoleProvider>
        <MobileBottomNav />
      </RoleProvider>
    );

    const allPagesButton = screen.getByText('All Pages');
    fireEvent.click(allPagesButton);

    expect(screen.getByText('Complete Portal Navigation')).toBeDefined();
    expect(screen.getByText('KLMCE ERP • All Available Features')).toBeDefined();
    expect(screen.getByText('My Classes')).toBeDefined();
    expect(screen.getByText('Examinations & Results')).toBeDefined();
    expect(screen.getByText('Campus (Library/Hostel)')).toBeDefined();
  });
});
