"use client";

import React, { createContext, useContext, useEffect, useState, useMemo } from "react";
import { useUser, useClerk } from "@clerk/nextjs";
import { useRouter, usePathname } from "next/navigation";
import { STUDENTS, FACULTY, ADMINS, StudentRecord, FacultyRecord, AdminRecord } from "@/lib/syntheticData";

export type RoleType = "SUPER_ADMIN" | "INSTITUTION_ADMIN" | "FACULTY" | "STUDENT" | "PARENT";

export interface UnifiedUser {
  id: string;
  name: string;
  email: string;
  role: RoleType;
  roleTitle: string;
  identifier: string; // Roll No / Emp ID / Phone / Admin ID
  department?: string;
  region?: string;
  avatar?: string;
  wardDetails?: {
    rollNo: string;
    name: string;
    department: string;
    cgpa: number;
    attendance: number;
  };
}

// Default Presets representing authentic KLMCE Rayalaseema campus personas
export const DEMO_PERSONAS: Record<RoleType, UnifiedUser> = {
  SUPER_ADMIN: {
    id: ADMINS[1].id,
    name: ADMINS[1].name, // Dr. V. Lokeswara Reddy (Principal)
    email: ADMINS[1].email,
    role: "SUPER_ADMIN",
    roleTitle: "Principal & Institutional Head",
    identifier: "ADM-PRIN-001",
    department: "Institutional Administration",
    region: "Kadapa, Andhra Pradesh",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"
  },
  INSTITUTION_ADMIN: {
    id: ADMINS[2].id,
    name: ADMINS[2].name, // Sri B. Chenna Kesava
    email: ADMINS[2].email,
    role: "INSTITUTION_ADMIN",
    roleTitle: "Dean of Admissions & Student Affairs",
    identifier: "ADM-DEAN-002",
    department: "Academic Operations",
    region: "Kadapa, Andhra Pradesh",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150"
  },
  FACULTY: {
    id: FACULTY[5].id,
    name: FACULTY[5].name, // Dr. P. Radha Krishna
    email: FACULTY[5].email,
    role: "FACULTY",
    roleTitle: "Associate Professor & Senior Mentor (CSE)",
    identifier: FACULTY[5].empId,
    department: FACULTY[5].department,
    region: "Kadapa, Andhra Pradesh",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150"
  },
  STUDENT: {
    id: STUDENTS[0].id,
    name: STUDENTS[0].name, // C. Lakshmi Priya
    email: STUDENTS[0].email,
    role: "STUDENT",
    roleTitle: "B.Tech CSE - 4th Year (R20 Regulation)",
    identifier: STUDENTS[0].rollNo,
    department: STUDENTS[0].department,
    region: STUDENTS[0].region,
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150"
  },
  PARENT: {
    id: "PAR001",
    name: "C. Narayana Reddy",
    email: "narayanareddy.c@klmce-parents.in",
    role: "PARENT",
    roleTitle: "Parent / Guardian",
    identifier: "+91 94401 22334",
    region: "Kadapa, Andhra Pradesh",
    wardDetails: {
      rollNo: STUDENTS[0].rollNo,
      name: STUDENTS[0].name,
      department: STUDENTS[0].department,
      cgpa: STUDENTS[0].cgpa,
      attendance: STUDENTS[0].attendance_pct
    },
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150"
  }
};

export const ROLE_ROUTE_MAP: Record<RoleType, string> = {
  SUPER_ADMIN: "/admin/dashboard",
  INSTITUTION_ADMIN: "/admin/dashboard",
  FACULTY: "/faculty/dashboard",
  STUDENT: "/student/dashboard",
  PARENT: "/parent/dashboard"
};

interface RoleContextValue {
  user: UnifiedUser | null;
  role: RoleType | null;
  isLoading: boolean;
  isClerkAuthenticated: boolean;
  switchRole: (newRole: RoleType, customUser?: Partial<UnifiedUser>) => void;
  loginWithCredentials: (identifier: string, role?: RoleType) => boolean;
  logout: () => Promise<void>;
  navigateToRoleHome: (targetRole?: RoleType) => void;
}

const RoleContext = createContext<RoleContextValue | undefined>(undefined);

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user: clerkUser, isLoaded: isClerkLoaded, isSignedIn: isClerkSignedIn } = useUser();
  const { signOut } = useClerk();

  const [activeUser, setActiveUser] = useState<UnifiedUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Sync cookie with client state so edge middleware honors it
  const setSessionCookie = (role: RoleType, id: string) => {
    if (typeof document !== "undefined") {
      document.cookie = `klmce_role=${role}; path=/; max-age=604800; SameSite=Lax`;
      document.cookie = `klmce_session=${id}; path=/; max-age=604800; SameSite=Lax`;
      document.cookie = `klmce-demo-auth=${role}; path=/; max-age=604800; SameSite=Lax`;
    }
  };

  const clearSessionCookie = () => {
    if (typeof document !== "undefined") {
      document.cookie = "klmce_role=; path=/; max-age=0";
      document.cookie = "klmce_session=; path=/; max-age=0";
      document.cookie = "klmce-demo-auth=; path=/; max-age=0";
    }
  };

  // Initial Hydration from LocalStorage or Clerk User
  useEffect(() => {
    try {
      const stored = localStorage.getItem("klmce_unified_user");
      if (stored) {
        const parsed: UnifiedUser = JSON.parse(stored);
        setActiveUser(parsed);
        setSessionCookie(parsed.role, parsed.id);
        setIsLoading(false);
        return;
      }
    } catch {
      // Ignore localstorage errors
    }

    // Fallback: If Clerk is signed in, synthesize role from Clerk metadata or email
    if (isClerkLoaded && isClerkSignedIn && clerkUser) {
      const email = clerkUser.primaryEmailAddress?.emailAddress || "";
      let inferredRole: RoleType = "STUDENT";
      if (email.includes("admin") || email.includes("principal")) {
        inferredRole = "SUPER_ADMIN";
      } else if (email.includes("faculty") || email.includes("prof")) {
        inferredRole = "FACULTY";
      } else if (email.includes("parent")) {
        inferredRole = "PARENT";
      }

      const preset = DEMO_PERSONAS[inferredRole];
      const unified: UnifiedUser = {
        ...preset,
        id: clerkUser.id,
        name: clerkUser.fullName || preset.name,
        email: email || preset.email,
        role: inferredRole,
        avatar: clerkUser.imageUrl || preset.avatar
      };

      setActiveUser(unified);
      localStorage.setItem("klmce_unified_user", JSON.stringify(unified));
      setSessionCookie(inferredRole, unified.id);
    } else {
      // Default initial demo state is Student for interactive immersion
      const defaultUser = DEMO_PERSONAS.STUDENT;
      setActiveUser(defaultUser);
      setSessionCookie(defaultUser.role, defaultUser.id);
    }

    setIsLoading(false);
  }, [isClerkLoaded, isClerkSignedIn, clerkUser]);

  const switchRole = (newRole: RoleType, customUser?: Partial<UnifiedUser>) => {
    const base = DEMO_PERSONAS[newRole];
    const updated: UnifiedUser = {
      ...base,
      ...(customUser || {})
    };

    setActiveUser(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("klmce_unified_user", JSON.stringify(updated));
      setSessionCookie(newRole, updated.id);
    }

    const destination = ROLE_ROUTE_MAP[newRole];
    router.push(destination);
  };

  const loginWithCredentials = (identifier: string, preferredRole?: RoleType): boolean => {
    const cleanId = identifier.trim().toLowerCase();
    const digitsOnly = cleanId.replace(/\D/g, "");

    // 1. Admin Authentication
    if (cleanId.includes("admin") || cleanId.includes("principal") || cleanId.includes("dean") || preferredRole === "SUPER_ADMIN") {
      switchRole("SUPER_ADMIN", {
        name: "Dr. V. Lokeswara Reddy",
        identifier: "principal@klmce.ac.in",
        email: "principal@klmce.ac.in",
        roleTitle: "Principal & Institutional Head"
      });
      return true;
    }

    // 2. Faculty Authentication (Matches any empId or email in FACULTY, or KLM-FAC pattern)
    if (cleanId.includes("fac") || cleanId.includes("prof") || cleanId.startsWith("klm-") || preferredRole === "FACULTY") {
      const matchFaculty = FACULTY.find(f => 
        f.empId.toLowerCase() === cleanId || f.email.toLowerCase() === cleanId
      );
      if (matchFaculty) {
        switchRole("FACULTY", {
          id: matchFaculty.id,
          name: matchFaculty.name,
          email: matchFaculty.email,
          identifier: matchFaculty.empId,
          department: matchFaculty.department,
          roleTitle: matchFaculty.designation
        });
      } else {
        switchRole("FACULTY", {
          name: "Dr. P. Radha Krishna",
          identifier: cleanId.toUpperCase() || "KLM-FAC-106",
          email: "radhakrishna.p@klmce.ac.in",
          roleTitle: "Associate Professor (CSE)"
        });
      }
      return true;
    }

    // 3. Parent Authentication (Matches any parent mobile or linked student parentPhone)
    if (cleanId.includes("parent") || preferredRole === "PARENT" || cleanId.startsWith("+91") || (digitsOnly.length === 10 && !cleanId.includes("1a"))) {
      const matchStudent = STUDENTS.find(s => 
        s.parentPhone.replace(/\D/g, "") === digitsOnly ||
        s.phone.replace(/\D/g, "") === digitsOnly
      );
      if (matchStudent) {
        switchRole("PARENT", {
          id: `PAR-${matchStudent.id}`,
          name: matchStudent.parentName,
          identifier: matchStudent.parentPhone,
          wardDetails: {
            rollNo: matchStudent.rollNo,
            name: matchStudent.name,
            department: matchStudent.department,
            cgpa: matchStudent.cgpa,
            attendance: matchStudent.attendance_pct
          }
        });
      } else {
        switchRole("PARENT", {
          name: "C. Narayana Reddy",
          identifier: identifier || "+91 94401 22334"
        });
      }
      return true;
    }

    // 4. Student Authentication (Matches any roll number or email across all students)
    const matchStudent = STUDENTS.find(s => 
      s.rollNo.toLowerCase() === cleanId || s.email.toLowerCase() === cleanId
    );

    if (matchStudent) {
      switchRole("STUDENT", {
        id: matchStudent.id,
        name: matchStudent.name,
        email: matchStudent.email,
        identifier: matchStudent.rollNo,
        department: matchStudent.department,
        region: matchStudent.region
      });
      return true;
    }

    // 5. Dynamic Student Access for any custom roll number entered
    switchRole("STUDENT", {
      identifier: identifier.toUpperCase() || "219Y1A0501",
      name: identifier ? `Scholar (${identifier.toUpperCase()})` : "C. Lakshmi Priya"
    });
    return true;
  };

  const logout = async () => {
    clearSessionCookie();
    if (typeof window !== "undefined") {
      localStorage.removeItem("klmce_unified_user");
    }
    setActiveUser(null);
    if (isClerkSignedIn) {
      await signOut();
    }
    router.push("/");
  };

  const navigateToRoleHome = (targetRole?: RoleType) => {
    const r = targetRole || activeUser?.role || "STUDENT";
    router.push(ROLE_ROUTE_MAP[r]);
  };

  const value = useMemo<RoleContextValue>(() => ({
    user: activeUser,
    role: activeUser?.role || null,
    isLoading,
    isClerkAuthenticated: Boolean(isClerkSignedIn),
    switchRole,
    loginWithCredentials,
    logout,
    navigateToRoleHome
  }), [activeUser, isLoading, isClerkSignedIn]);

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
}

export function useRole() {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error("useRole must be used within a RoleProvider");
  }
  return context;
}

export function resolveCredentialRole(identifier: string, fallbackRole?: RoleType): {
  role: RoleType;
  title: string;
  name: string;
  department?: string;
  badge: string;
} {
  const cleanId = (identifier || "").trim().toLowerCase();
  const digitsOnly = cleanId.replace(/\D/g, "");

  // 1. Admin detection
  if (cleanId.includes("admin") || cleanId.includes("principal") || cleanId.includes("dean") || fallbackRole === "SUPER_ADMIN") {
    return {
      role: "SUPER_ADMIN",
      title: "Principal & Institutional Head",
      name: "Dr. V. Lokeswara Reddy",
      department: "Institutional Administration",
      badge: "Admin Access"
    };
  }

  // 2. Faculty detection
  if (cleanId.includes("fac") || cleanId.includes("prof") || cleanId.startsWith("klm-") || fallbackRole === "FACULTY") {
    const matchFaculty = FACULTY.find(f => 
      f.empId.toLowerCase() === cleanId || f.email.toLowerCase() === cleanId
    );
    return {
      role: "FACULTY",
      title: matchFaculty?.designation || "Faculty Member & Mentor",
      name: matchFaculty?.name || "Dr. P. Radha Krishna",
      department: matchFaculty?.department || "Computer Science & Engineering",
      badge: "Faculty Access"
    };
  }

  // 3. Parent detection (phone number or parent keyword)
  if (cleanId.includes("parent") || (digitsOnly.length === 10 && !cleanId.includes("1a")) || cleanId.startsWith("+91") || fallbackRole === "PARENT") {
    const matchStudent = STUDENTS.find(s => 
      s.parentPhone.replace(/\D/g, "") === digitsOnly ||
      s.phone.replace(/\D/g, "") === digitsOnly
    );
    return {
      role: "PARENT",
      title: "Registered Parent / Guardian",
      name: matchStudent?.parentName || "C. Narayana Reddy",
      department: matchStudent ? `Ward: ${matchStudent.name} (${matchStudent.rollNo})` : "Guardian Oversight",
      badge: "Parent Access"
    };
  }

  // 4. Student detection (roll number or student email)
  const matchStudent = STUDENTS.find(s => 
    s.rollNo.toLowerCase() === cleanId || s.email.toLowerCase() === cleanId
  );
  if (matchStudent) {
    return {
      role: "STUDENT",
      title: `B.Tech ${matchStudent.department} (Year ${matchStudent.year})`,
      name: matchStudent.name,
      department: matchStudent.department,
      badge: "Student Access"
    };
  }

  // 5. Fallback student for arbitrary roll numbers
  const isInstitutionAdmin = fallbackRole === "INSTITUTION_ADMIN";
  return {
    role: fallbackRole || "STUDENT",
    title: isInstitutionAdmin ? "Administrator" : "B.Tech Engineering Scholar",
    name: cleanId ? (cleanId.toUpperCase().startsWith("2") ? `Scholar (${cleanId.toUpperCase()})` : "Authenticated Scholar") : "C. Lakshmi Priya",
    department: "Computer Science & Engineering",
    badge: isInstitutionAdmin ? "Admin Access" : "Student Access"
  };
}
