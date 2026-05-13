import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import { EngineProvider } from "@/lib/engine-context";
import NotificationCenter from "@/components/ui/NotificationCenter";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NEXUS ERP | Universal Inventory",
  description: "High-end universal inventory and business management",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <EngineProvider>
          <Header />
          <main className="min-h-screen pb-20">
            {children}
          </main>
          <NotificationCenter />
        </EngineProvider>
      </body>
    </html>
  );
}
