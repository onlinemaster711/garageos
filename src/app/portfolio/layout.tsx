import { TopAppBar } from "@/components/TopAppBar"
import { BottomNav } from "@/components/BottomNav"

export const metadata = {
  title: "Portfolio | GarageOS",
  description: "Deine Fahrzeugsammlung und -portfolio",
}

export default function PortfolioLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-surface">
      <TopAppBar />
      <main className="mx-auto max-w-7xl px-6 pt-32 pb-32 lg:px-12 lg:pb-12">
        {children}
      </main>
      <BottomNav />
    </div>
  )
}
