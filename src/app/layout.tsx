import type { Metadata } from "next";
import {
  Architects_Daughter,
  Courier_Prime,
  Newsreader,
} from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { TRPCProvider } from "@/components/providers/trpc-provider";
import { Toaster } from "@/components/ui/sonner";

const fontSans = Architects_Daughter({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-sans",
});

const fontSerif = Newsreader({
  subsets: ["latin"],
  variable: "--font-serif",
});

const fontMono = Courier_Prime({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Yatra - Personal Finance Tracker",
  description: "Track your money across multiple wallets",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${fontSans.variable} ${fontSerif.variable} ${fontMono.variable} antialiased`}
      >
        <TRPCProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
          <Toaster />
        </TRPCProvider>
      </body>
    </html>
  );
}
