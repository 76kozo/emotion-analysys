import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RealTime Emotion Analyzer",
  description: "Real-time emotion analysis using webcam and Google Cloud Vision API",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
} 