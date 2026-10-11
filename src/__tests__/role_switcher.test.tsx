import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { RoleSwitcher } from '@/components/layout/RoleSwitcher';
import { RoleProvider, DEMO_PERSONAS } from '@/lib/auth/roleContext';

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => '/student/dashboard',
}));

vi.mock('@clerk/nextjs', () => ({
  useUser: () => ({ user: null, isLoaded: true, isSignedIn: false }),
  useClerk: () => ({ signOut: vi.fn() }),
}));

describe('RoleSwitcher Component', () => {
  beforeEach(() => {
    mockPush.mockClear();
    if (typeof localStorage !== 'undefined') {
      localStorage.clear();
    }
  });

  it('renders role trigger pill with default role', () => {
    render(
      <RoleProvider>
        <RoleSwitcher />
      </RoleProvider>
    );

    const trigger = screen.getByTitle('Switch institutional role & test personas');
    expect(trigger).toBeDefined();
  });

  it('opens modal and lists all 4 primary institutional portals with regional personas', async () => {
    render(
      <RoleProvider>
        <RoleSwitcher />
      </RoleProvider>
    );

    const trigger = screen.getByTitle('Switch institutional role & test personas');
    fireEvent.click(trigger);

    expect(screen.getByText('Unified Role Switcher')).toBeDefined();
    expect(screen.getByText('KLMCE Rayalaseema')).toBeDefined();
    expect(screen.getByText('Admin Portal')).toBeDefined();
    expect(screen.getByText('Faculty Portal')).toBeDefined();
    expect(screen.getByText('Student Portal')).toBeDefined();
    expect(screen.getByText('Parent Portal')).toBeDefined();

    // Check regional persona names appear
    expect(screen.getByText(DEMO_PERSONAS.FACULTY.name)).toBeDefined();
    expect(screen.getByText(DEMO_PERSONAS.SUPER_ADMIN.name)).toBeDefined();
    expect(screen.getByText(DEMO_PERSONAS.PARENT.name)).toBeDefined();
  });

  it('switches role and redirects when clicking a portal option', async () => {
    render(
      <RoleProvider>
        <RoleSwitcher />
      </RoleProvider>
    );

    const trigger = screen.getByTitle('Switch institutional role & test personas');
    fireEvent.click(trigger);

    const facultyOption = screen.getByText('Faculty Portal');
    await act(async () => {
      fireEvent.click(facultyOption);
    });

    expect(mockPush).toHaveBeenCalledWith('/faculty/dashboard');
  });
});
