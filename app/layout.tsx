import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
})

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
      <html lang="en" className={`h-full antialiased ${playfair.variable} ${inter.variable}`}>
        <body className="min-h-full flex flex-col" style={{ background: "var(--c-cream)", color: "var(--c-espresso)" }}>
          {children}
          <Toaster richColors position="top-right" />
        </body>
      </html>
    </ClerkProvider>
  );
}
