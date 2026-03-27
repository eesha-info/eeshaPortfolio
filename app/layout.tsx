import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Geist_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mohammad Eesha | NodeJS Backend Developer",
  description:
    "AWS-Node.js developer with 4 years of experience creating scalable, efficient web applications, REST APIs, and cloud-native solutions using Node.js, Express.js, and AWS.",
  keywords: [
    "NodeJS Developer",
    "Node.js",
    "AWS",
    "Express.js",
    "Backend Developer",
    "REST APIs",
    "Portfolio",
    "MD Eesha",
  ],
  openGraph: {
    title: "Mohammad Eesha | NodeJS Backend Developer",
    description:
      "AWS-Node.js developer specializing in scalable backend systems and cloud-native architectures.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body
        className="min-h-full flex flex-col"
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
