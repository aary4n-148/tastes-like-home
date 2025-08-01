import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/sonner"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Tastes Like Home - Find Indian Home Chefs in West London",
  description:
    "Discover authentic Indian home-cooked meals from verified chefs in West London. Book directly with local home chefs for an authentic dining experience.",
  keywords: "Indian food, home chef, West London, authentic cuisine, home cooking",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <script 
          src="https://challenges.cloudflare.com/turnstile/v0/api.js" 
          defer
        ></script>
      </head>
      <body className={inter.className}>
        {children}
        <Toaster />
      </body>
    </html>
  )
}
