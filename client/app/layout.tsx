import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-outfit",
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
        className={`${outfit.variable} antialiased bg-[#030408] text-gray-100 min-h-screen selection:bg-neon-green selection:text-black`}
      >
        {children}
      </body>
    </html>
  );
}
