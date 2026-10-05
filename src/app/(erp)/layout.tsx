import { AppShell } from "@/components/layout/app-shell";

export default function ERPLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
