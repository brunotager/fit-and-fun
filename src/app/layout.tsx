import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Fit & Fun",
  description: "Gamified fitness with Coach Gabi",
};

import { Navigation } from "@/components/Navigation";
import { ViewportFix } from "@/components/ViewportFix";
import { StatusBar } from "@/components/StatusBar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Placeholder for isActive and item.label to make the snippet syntactically valid
  // if it were to be placed here. This is not how it would be used in a real app.
  const isActive = false; // This would be determined by the current route in Navigation
  const item = { label: "Home" }; // This would be an item from a navigation array

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#FFFDF7] flex justify-center fixed inset-0 overflow-hidden`}
      >
        <ViewportFix />
        <div 
          className="w-full max-w-md bg-[#FFFDF7] shadow-xl relative overflow-hidden flex flex-col"
          style={{ height: 'var(--vv-height, 100dvh)', top: 'var(--vv-offset-top, 0px)' }}
        >
          <StatusBar />
          <Providers>
            <main className="flex-1 flex flex-col relative overflow-y-auto custom-scrollbar min-h-0">
              {children}
            </main>
            <Navigation />
          </Providers>
        </div>
      </body>
    </html>
  );
}
