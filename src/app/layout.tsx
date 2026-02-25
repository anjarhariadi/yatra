import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { TRPCProvider } from "@/components/providers/trpc-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Yatra - Personal Finance Tracker",
  description: "Track your money across multiple wallets",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <TRPCProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </TRPCProvider>
      </body>
    </html>
  )
}
