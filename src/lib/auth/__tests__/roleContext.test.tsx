import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { RoleProvider, useRole, DEMO_PERSONAS, ROLE_ROUTE_MAP } from '../roleContext';

// Mock Next.js navigation
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => '/',
}));

// Mock Clerk Next.js SDK
vi.mock('@clerk/nextjs', () => ({
  useUser: () => ({
    user: null,
    isLoaded: true,
    isSignedIn: false,
  }),
  useClerk: () => ({
    signOut: vi.fn().mockResolvedValue(undefined),
  }),
}));

describe('Unified Role Abstraction & Context', () => {
  beforeEach(() => {
    mockPush.mockClear();
    if (typeof localStorage !== 'undefined') {
      localStorage.clear();
    }
  });

  it('defines all required institutional roles with Rayalaseema regional personas', () => {
    const roles = ['SUPER_ADMIN', 'INSTITUTION_ADMIN', 'FACULTY', 'STUDENT', 'PARENT'] as const;
    roles.forEach(role => {
      expect(DEMO_PERSONAS[role]).toBeDefined();
      expect(DEMO_PERSONAS[role].role).toBe(role);
      expect(ROLE_ROUTE_MAP[role]).toBeDefined();
    });

    // Verify regional authentic data is attached to default personas
    expect(DEMO_PERSONAS.SUPER_ADMIN.region).toContain('Kadapa');
    expect(DEMO_PERSONAS.STUDENT.name).toBe('C. Lakshmi Priya');
    expect(DEMO_PERSONAS.STUDENT.identifier).toBe('219Y1A0501');
    expect(DEMO_PERSONAS.FACULTY.name).toBe('Dr. P. Radha Krishna');
    expect(DEMO_PERSONAS.PARENT.name).toBe('C. Narayana Reddy');
    expect(DEMO_PERSONAS.PARENT.wardDetails?.rollNo).toBe('219Y1A0501');
  });

  it('routes correctly for each role in ROLE_ROUTE_MAP', () => {
    expect(ROLE_ROUTE_MAP.SUPER_ADMIN).toBe('/admin/dashboard');
    expect(ROLE_ROUTE_MAP.INSTITUTION_ADMIN).toBe('/admin/dashboard');
    expect(ROLE_ROUTE_MAP.FACULTY).toBe('/faculty/dashboard');
    expect(ROLE_ROUTE_MAP.STUDENT).toBe('/student/dashboard');
    expect(ROLE_ROUTE_MAP.PARENT).toBe('/parent/dashboard');
  });

  function TestConsumer() {
    const { role, user, switchRole, loginWithCredentials, logout } = useRole();
    return (
      <div>
        <div data-testid="active-role">{role}</div>
        <div data-testid="user-name">{user?.name}</div>
        <div data-testid="user-id">{user?.identifier}</div>
        <button onClick={() => switchRole('FACULTY')}>Switch To Faculty</button>
        <button onClick={() => switchRole('PARENT')}>Switch To Parent</button>
        <button onClick={() => loginWithCredentials('219Y1A0501')}>Login Student</button>
        <button onClick={() => loginWithCredentials('principal@klmce.ac.in')}>Login Admin</button>
        <button onClick={() => logout()}>Logout</button>
      </div>
    );
  }

  it('initializes with default persona and allows dynamic role switching', async () => {
    render(
      <RoleProvider>
        <TestConsumer />
      </RoleProvider>
    );

    // Initial default should be STUDENT
    expect(screen.getByTestId('active-role').textContent).toBe('STUDENT');
    expect(screen.getByTestId('user-name').textContent).toBe('C. Lakshmi Priya');

    // Switch to Faculty
    await act(async () => {
      screen.getByText('Switch To Faculty').click();
    });

    expect(screen.getByTestId('active-role').textContent).toBe('FACULTY');
    expect(screen.getByTestId('user-name').textContent).toBe('Dr. P. Radha Krishna');
    expect(mockPush).toHaveBeenCalledWith('/faculty/dashboard');

    // Switch to Parent
    await act(async () => {
      screen.getByText('Switch To Parent').click();
    });

    expect(screen.getByTestId('active-role').textContent).toBe('PARENT');
    expect(screen.getByTestId('user-name').textContent).toBe('C. Narayana Reddy');
    expect(mockPush).toHaveBeenCalledWith('/parent/dashboard');
  });

  it('authenticates credentials with roll numbers and administrative keywords', async () => {
    render(
      <RoleProvider>
        <TestConsumer />
      </RoleProvider>
    );

    // Login with Student roll number
    await act(async () => {
      screen.getByText('Login Student').click();
    });

    expect(screen.getByTestId('active-role').textContent).toBe('STUDENT');
    expect(screen.getByTestId('user-id').textContent).toBe('219Y1A0501');

    // Login with Principal / Admin keyword
    await act(async () => {
      screen.getByText('Login Admin').click();
    });

    expect(screen.getByTestId('active-role').textContent).toBe('SUPER_ADMIN');
    expect(mockPush).toHaveBeenCalledWith('/admin/dashboard');
  });
});
