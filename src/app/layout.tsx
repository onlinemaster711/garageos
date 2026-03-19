import type { Metadata } from "next"
import localFont from "next/font/local"
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

export const metadata: Metadata = {
  title: "GarageOS — Deine Sammlung auf Autopilot",
  description: "Die Verwaltungs-App für private Fahrzeugsammler. Wartung, Dokumente, Erinnerungen — alles an einem Ort.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" className={`${geist.variable} h-full`}>
      <body className="min-h-full bg-background text-foreground antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  )
}
