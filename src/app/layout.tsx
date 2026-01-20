import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { BottomNav } from "@/components/layout/BottomNav";
import { ToastProvider } from "@/components/ui/Toast";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { SessionProvider } from "@/components/auth/SessionProvider";
import { UserMenu } from "@/components/auth/UserMenu";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Gym Tracker",
  description: "Track your workouts and progress",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white dark:bg-[#0a0a0a] min-h-screen pb-20`}
      >
        <SessionProvider>
          <ToastProvider>
            <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
              <ThemeToggle />
              <UserMenu />
            </div>
            {children}
            <BottomNav />
          </ToastProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
