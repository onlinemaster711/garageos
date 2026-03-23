import { TopAppBar } from "@/components/TopAppBar"
import { BottomNav } from "@/components/BottomNav"

export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-background">
      <TopAppBar />

      <main className="mx-auto max-w-7xl px-6 py-8 pt-32 lg:px-12 lg:pb-32">
        {/* Header Skeleton */}
        <div className="mb-12 flex items-center justify-between">
          <div className="flex-1">
            <div className="h-10 w-64 animate-pulse rounded bg-surface-container" />
            <div className="mt-2 h-4 w-40 animate-pulse rounded bg-surface-container" />
          </div>
          <div className="h-10 w-40 animate-pulse rounded bg-surface-container" />
        </div>

        {/* Grid Skeleton */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-4">
              {/* Image Skeleton */}
              <div className="aspect-[4/5] animate-pulse rounded-lg bg-surface-container" />
              {/* Text Skeleton */}
              <div className="space-y-2 px-1">
                <div className="h-6 w-48 animate-pulse rounded bg-surface-container" />
                <div className="h-6 w-20 animate-pulse rounded bg-surface-container" />
                <div className="space-y-1">
                  <div className="h-4 w-32 animate-pulse rounded bg-surface-container" />
                  <div className="h-4 w-32 animate-pulse rounded bg-surface-container" />
                  <div className="h-4 w-32 animate-pulse rounded bg-surface-container" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      <BottomNav />
    </div>
  )
}
