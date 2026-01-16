import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AuthProvider } from "@/components/providers/AuthProvider";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "StudyTrack.AI - Your AI-Powered Study Mission Control",
  description:
    "Transform your study experience with AI-powered planning, focus modes, and intelligent analytics. Study smarter, level up your learning.",
  keywords: ["study", "AI", "learning", "productivity", "students", "education"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        <div className="min-h-screen bg-[#0a0a0f] retro-grid">
          <AuthProvider>
            {children}
          </AuthProvider>
        </div>
      </body>
    </html>
  );
}