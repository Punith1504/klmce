import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Enterprise ERP",
  description: "Global ERP Layout Shell",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-background text-foreground`}>
        <ClerkProvider 
          appearance={{
            baseTheme: dark,
            variables: { colorPrimary: '#6366f1' },
            elements: { card: 'bg-[#221F32]/90 backdrop-blur-md border border-white/10 shadow-2xl' }
          }}
        >
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}