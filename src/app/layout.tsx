import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { EngineProvider } from "@/lib/engine-context";
import Providers from "@/shared/lib/providers";
import { UIProvider } from "@/lib/ui-context";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Nexx-Top | Personal Selling & Inventory",
  description: "Modern personal ERP — manage your inventory, services, logistics, and customers in one place.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <UIProvider>
          <Providers>
            <EngineProvider>
              {children}
            </EngineProvider>
          </Providers>
        </UIProvider>
      </body>
    </html>
  );
}
