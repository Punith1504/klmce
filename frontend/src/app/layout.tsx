import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import GlobalProvidersAndLayout from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "KLMCE Education ERP",
  description: "Zero-Trust Enterprise Education Architecture",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <GlobalProvidersAndLayout>
          {children}
        </GlobalProvidersAndLayout>
      </body>
    </html>
  );
}
