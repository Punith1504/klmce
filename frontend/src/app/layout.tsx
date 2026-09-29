import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  themeColor: "#4f46e5",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: "KLMCE Education ERP",
  description: "Enterprise Resource Planning for Higher Education",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "KLMCE ERP",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Placeholder for real backend CSRF tag injection */}
        <meta name="csrf-token" content="{{ CSRF_TOKEN_PLACEHOLDER }}" />
      </head>
      <body className={`${inter.className} bg-slate-50 text-slate-900 antialiased selection:bg-indigo-200 selection:text-indigo-900`}>
        <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200/50 sticky top-0 z-50 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-20 items-center">
              <div className="flex-shrink-0 flex items-center font-black text-3xl text-indigo-600 tracking-tighter cursor-pointer hover:opacity-80 transition-opacity">
                KLMCE<span className="text-slate-800">ERP</span>
              </div>
              <div className="flex items-center space-x-6">
                <button className="text-slate-500 hover:text-slate-900 font-semibold transition-colors">
                  Help Center
                </button>
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-black border border-indigo-200 cursor-pointer shadow-sm">
                  JD
                </div>
              </div>
            </div>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}
