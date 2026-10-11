import { describe, it, expect } from 'vitest';
import { ROLE_ROUTE_MAP, RoleType } from '@/lib/auth/roleContext';

describe('Role-based Route Guards & Access Control', () => {
  const ROUTE_PERMISSIONS: Record<string, RoleType[]> = {
    '/faculty': ['FACULTY', 'SUPER_ADMIN', 'INSTITUTION_ADMIN'],
    '/admin': ['SUPER_ADMIN', 'INSTITUTION_ADMIN'],
    '/student': ['STUDENT', 'SUPER_ADMIN', 'INSTITUTION_ADMIN'],
    '/parent': ['PARENT', 'SUPER_ADMIN', 'INSTITUTION_ADMIN'],
  };

  function canAccessRoute(userRole: RoleType, pathname: string): { allowed: boolean; redirectTo?: string } {
    for (const [prefix, allowedRoles] of Object.entries(ROUTE_PERMISSIONS)) {
      if (pathname.startsWith(prefix)) {
        if (allowedRoles.includes(userRole)) {
          return { allowed: true };
        }
        return { allowed: false, redirectTo: ROLE_ROUTE_MAP[userRole] };
      }
    }
    return { allowed: true };
  }

  it('prohibits students from accessing faculty or administrative routes', () => {
    const facultyAccess = canAccessRoute('STUDENT', '/faculty/marks');
    expect(facultyAccess.allowed).toBe(false);
    expect(facultyAccess.redirectTo).toBe('/student/dashboard');

    const adminAccess = canAccessRoute('STUDENT', '/admin/examinations');
    expect(adminAccess.allowed).toBe(false);
    expect(adminAccess.redirectTo).toBe('/student/dashboard');
  });

  it('prohibits faculty from accessing administrative-only finance or admissions routes', () => {
    const adminFinance = canAccessRoute('FACULTY', '/admin/finance');
    expect(adminFinance.allowed).toBe(false);
    expect(adminFinance.redirectTo).toBe('/faculty/dashboard');
  });

  it('permits authorized roles to access their designated routes', () => {
    expect(canAccessRoute('STUDENT', '/student/results').allowed).toBe(true);
    expect(canAccessRoute('FACULTY', '/faculty/attendance').allowed).toBe(true);
    expect(canAccessRoute('PARENT', '/parent/fees').allowed).toBe(true);
    expect(canAccessRoute('SUPER_ADMIN', '/admin/dashboard').allowed).toBe(true);
  });
});
