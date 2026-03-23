"use client"

import Image from "next/image"
import Link from "next/link"
import { Car } from "lucide-react"
import { cn } from "@/lib/utils"

interface VehicleCardProps {
  id: string
  make: string
  model: string
  year: number | null
  mileage: number | null
  color: string
  category: "modern" | "oldtimer" | "youngtimer"
  coverPhotoUrl?: string
}

export function VehicleCard({
  id,
  make,
  model,
  year,
  mileage,
  color,
  category,
  coverPhotoUrl,
}: VehicleCardProps) {
  const categoryConfig = {
    modern: {
      label: "Modern",
      textColor: "text-on-surface-variant/60",
      borderColor: "border-outline-variant/10",
    },
    oldtimer: {
      label: "Oldtimer",
      textColor: "text-primary",
      borderColor: "border-primary/20",
    },
    youngtimer: {
      label: "Youngtimer",
      textColor: "text-tertiary",
      borderColor: "border-tertiary/20",
    },
  }

  const config = categoryConfig[category]

  return (
    <Link href={`/vehicles/${id}`}>
      <div className="group cursor-pointer">
        {/* Image Container - 4:5 Aspect Ratio */}
        <div className="relative mb-4 overflow-hidden rounded-lg bg-surface-container">
          <div className="aspect-[4/5] w-full overflow-hidden bg-gradient-to-br from-surface-container-high to-surface-container">
            {coverPhotoUrl ? (
              <Image
                src={coverPhotoUrl}
                alt={`${make} ${model}`}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-110"
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-gradient-to-br from-surface-container-high to-surface-container">
                <Car className="h-16 w-16 text-outline-variant/40" />
              </div>
            )}

            {/* Hover Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          </div>
        </div>

        {/* Metadaten */}
        <div className="space-y-2 px-1">
          {/* Headline - Italic */}
          <h3 className="font-serif text-lg italic text-foreground">
            {make} {model}
          </h3>

          {/* Category Badge */}
          <div className="inline-flex items-center">
            <span
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium",
                config.textColor,
                config.borderColor
              )}
            >
              {config.label}
            </span>
          </div>

          {/* Jahr / KM / Farbe */}
          <div className="space-y-1 text-xs text-on-surface-variant">
            <p>
              <span className="font-semibold">Jahr:</span> {year ?? "N/A"}
            </p>
            <p>
              <span className="font-semibold">KM:</span> {mileage?.toLocaleString("de-DE") ?? "N/A"}
            </p>
            <p>
              <span className="font-semibold">Farbe:</span> {color}
            </p>
          </div>
        </div>
      </div>
    </Link>
  )
}
