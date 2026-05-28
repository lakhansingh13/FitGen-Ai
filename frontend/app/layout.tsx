import type { Metadata } from "next";
import { Sora, Inter } from "next/font/google";
import "./globals.css";

const sora = Sora({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-sora",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "FitGen AI - Futuristic AI Fitness Trainer & Workout Generator",
  description: "Transform your body with FitGen AI. Personalized AI workout plans, custom diet recommendations, interactive chatbot support, and real-time webcam posture tracking.",
  keywords: ["AI fitness coach", "posture correction", "exercise analyzer", "workout generator", "AI diet", "MediaPipe pose tracker"],
  authors: [{ name: "FitGen AI Team" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body
        className={`${sora.variable} ${inter.variable} antialiased bg-[#0a0f14] text-[#a7b0b8] min-h-screen selection:bg-neon-green selection:text-black font-sans`}
      >
        {children}
      </body>
    </html>
  );
}
