import type { Metadata } from "next"
import localFont from "next/font/local"
import { Newsreader, Manrope, Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"

const geist = localFont({
  src: [
    {
      path: "../fonts/GeistVF.woff2",
      style: "normal",
    },
  ],
  variable: "--font-geist-sans",
  display: "swap",
  fallback: ["system-ui", "arial"],
})

const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-newsreader",
  display: "swap",
  style: ["normal", "italic"],
})

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
  weight: ["200", "300", "400", "500", "600", "700", "800"],
})

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  weight: ["400", "500", "600", "700"],
})

export const metadata: Metadata = {
  title: "GarageOS — Deine Sammlung auf Autopilot",
  description: "Die Verwaltungs-App für private Fahrzeugsammler. Wartung, Dokumente, Erinnerungen — alles an einem Ort.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="de"
      className={`${geist.variable} ${newsreader.variable} ${manrope.variable} ${inter.variable} h-full`}
    >
      <head>
        {/* Material Symbols Outlined Icons */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0"
        />
      </head>
      <body className="min-h-full bg-background text-foreground antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  )
}
