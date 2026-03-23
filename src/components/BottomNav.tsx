"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Car, Calendar, Settings, Home } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  {
    href: "/dashboard",
    icon: Car,
    label: "Sammlung",
    exact: true,
  },
  {
    href: "/termine",
    icon: Calendar,
    label: "Termine",
    exact: true,
  },
  {
    href: "/settings",
    icon: Settings,
    label: "Einstellungen",
    exact: true,
  },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex h-20 border-t border-outline-variant/20 bg-surface-container/80 backdrop-blur-md lg:hidden">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-around px-6">
        {navItems.map(({ href, icon: Icon, label, exact }) => {
          const isActive = exact ? pathname === href : pathname.startsWith(href)

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center gap-1 rounded-lg px-4 py-2 transition-colors duration-200",
                isActive
                  ? "text-primary"
                  : "text-on-surface-variant hover:text-on-surface"
              )}
            >
              <Icon className="h-6 w-6" />
              <span className="text-xs font-medium">{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
