"use client"

import Link from "next/link"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
interface TopAppBarProps {
  userInitials?: string
  userName?: string
}

export function TopAppBar({ userInitials = "GB", userName = "User" }: TopAppBarProps) {
  return (
    <div className="fixed left-0 right-0 top-0 z-50 border-b border-outline-variant/20 bg-surface-container/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-12">
        {/* Hamburger Menu - Links */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="text-on-surface hover:bg-surface-container-high"
            >
              <Menu className="h-6 w-6" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem asChild>
              <Link href="/dashboard">Meine Sammlung</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/termine">Termine</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/settings">Einstellungen</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Logo - Mitte */}
        <Link href="/dashboard" className="flex-1 text-center">
          <h1 className="font-serif text-2xl italic text-primary">GarageOS</h1>
        </Link>

        {/* User Avatar - Rechts */}
        <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-primary champagne-gradient font-semibold text-surface-container">
          {userInitials}
        </div>
      </div>
    </div>
  )
}
