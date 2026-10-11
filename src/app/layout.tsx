import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { RoleProvider } from "@/lib/auth/roleContext";

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#070514",
};

export const metadata: Metadata = {
  title: "KLMCE Enterprise ERP | K.S.R.M. & KLM Campus Kadapa",
  description: "Comprehensive Cloud ERP for Engineering Education, Academics, Examination & Administration",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "KLMCE ERP",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
                navigator.serviceWorker.getRegistrations().then(function(registrations) {
                  for (var registration of registrations) {
                    registration.unregister();
                  }
                });
                if ('caches' in window) {
                  caches.keys().then(function(names) {
                    for (var name of names) caches.delete(name);
                  });
                }
              }
            `,
          }}
        />
      </head>
      <body className={`${inter.className} bg-[#070514] text-slate-100 antialiased min-h-screen selection:bg-indigo-500/30`}>
        <ClerkProvider 
          appearance={{
            baseTheme: dark,
            variables: { colorPrimary: '#6366f1' },
            elements: { card: 'bg-[#221F32]/90 backdrop-blur-md border border-white/10 shadow-2xl' }
          } as any}
        >
          <RoleProvider>
            {children}
          </RoleProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}