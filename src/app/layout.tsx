import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import BottomNav from "@/components/layout/BottomNav";
import { EngineProvider } from "@/lib/engine-context";
import NotificationCenter from "@/components/ui/NotificationCenter";
import Providers from "@/shared/lib/providers";
import DynamicBackground from "@/components/ui/DynamicBackground";

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
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`} suppressHydrationWarning>
        <Providers>
          <EngineProvider>
            <DynamicBackground />
            <Header />
            <main className="relative z-10 min-h-screen pt-20 pb-32 md:pb-20">
              {children}
            </main>
            <BottomNav />
            <NotificationCenter />
          </EngineProvider>
        </Providers>
      </body>
    </html>
  );
}
