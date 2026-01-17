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
      <head>
        {/* KaTeX CSS for Math Formulas */}
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css"
          integrity="sha384-n8MVd4RsNIU0tAv4ct0nTaAbDJwPJzDEaqSD1odI+WdtXRGWt2kTvGFasHpSy3SV"
          crossOrigin="anonymous"
        />
        <style dangerouslySetInnerHTML={{
          __html: `
            :root {
              color-scheme: dark;
            }
            body {
              margin: 0;
              padding: 0;
            }
          `
        }} />
      </head>
      <body className={inter.className}>
        <div className="min-h-screen bg-[#0a0a0f] retro-grid">
          <AuthProvider>{children}</AuthProvider>
        </div>
      </body>
    </html>
  );
}