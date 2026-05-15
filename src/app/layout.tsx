import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import BottomNav from "@/components/layout/BottomNav";
import { EngineProvider } from "@/lib/engine-context";
import NotificationCenter from "@/components/ui/NotificationCenter";
import Providers from "@/shared/lib/providers";
import DynamicBackground from "@/components/ui/DynamicBackground";
import { UIProvider, useUI } from "@/lib/ui-context";

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

function RootLayoutInner({ children }: { children: React.ReactNode }) {
  const { viewMode } = useUI();
  
  return (
    <body className={`${geistSans.variable} ${geistMono.variable} antialiased ${viewMode === 'mobile' ? 'mobile-mode' : ''}`} suppressHydrationWarning>
      <Providers>
        <EngineProvider>
          <DynamicBackground />
          <Header />
          <main className="relative z-10 min-h-screen pt-20 pb-32 md:pb-20">
            <div className="layout-container mx-auto transition-all duration-500 ease-in-out">
              {children}
            </div>
          </main>
          <BottomNav />
          <NotificationCenter />
        </EngineProvider>
      </Providers>
    </body>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <UIProvider>
        <RootLayoutInner>
          {children}
        </RootLayoutInner>
      </UIProvider>
    </html>
  );
}
