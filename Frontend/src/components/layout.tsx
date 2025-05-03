import type React from "react"
import "./globals.css"
import "./fonts.css" 
// import { ThemeProvider } from "@/components/theme-provider"

export const metadata = {
  title: "Serene Mind - Mental Health Platform",
  description: "A serene platform for mental health and wellness",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="inter-font"> {/* Replace dynamic className with a static class */}
        {/* <ThemeProvider attribute="class" defaultTheme="light"> */}
          {children}
        {/* </ThemeProvider> */}
      </body>
    </html>
  )
}
