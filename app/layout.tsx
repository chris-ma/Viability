import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Viability First — Know before you build.",
  description:
    "Assess your business idea across 8 viability dimensions and get a clear, evidence-based verdict in under 30 minutes. Every mistake is a data point.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className={`h-full antialiased ${inter.variable}`}>
        <body className="min-h-full flex flex-col bg-white text-[#1D1D1F]">
          {children}
          <Toaster richColors position="top-right" />
        </body>
      </html>
    </ClerkProvider>
  );
}
