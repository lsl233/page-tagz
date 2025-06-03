import type { Metadata } from "next";
// import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "next-auth/react";
import { TagProvider } from "@/contexts/tag-context"
import { UIProvider } from "@/contexts/ui-context"
// import { ThemeProvider } from "@/contexts/theme-context"
import { cn } from "@/lib/utils"

import { Toaster } from "sonner";
import { AuthProvider } from "@/contexts/auth-context";

// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

export const metadata: Metadata = {
  title: "Page Tagz",
  description: "Organize your web pages",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        {/* <ThemeProvider attribute="class" defaultTheme="system" enableSystem> */}
          <UIProvider>
            <TagProvider>
              <SessionProvider>
                <AuthProvider>
                  {children}
                </AuthProvider>
                <Toaster position="top-center" />
              </SessionProvider>
            </TagProvider>
          </UIProvider>
        {/* </ThemeProvider> */}
      </body>
    </html>
  );
}
