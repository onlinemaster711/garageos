// Check if a vehicle has been standing too long
export interface StandzeitCheck {
  vehicleId: string
  vehicleName: string
  lastDrivenDate: string | null
  maxStandzeitWeeks: number
  daysStanding: number
  isWarning: boolean
}

export function checkStandzeit(
  lastDrivenDate: string | null,
  maxStandzeitWeeks: number
): { daysStanding: number; isWarning: boolean } {
  if (!lastDrivenDate) {
    return { daysStanding: 0, isWarning: false }
  }

  const lastDriven = new Date(lastDrivenDate)
  lastDriven.setHours(0, 0, 0, 0)
  const now = new Date()
  now.setHours(0, 0, 0, 0)

  const daysStanding = Math.ceil((now.getTime() - lastDriven.getTime()) / (1000 * 60 * 60 * 24))
  const maxDays = maxStandzeitWeeks * 7
  const isWarning = daysStanding >= maxDays

  return { daysStanding, isWarning }
}

export function formatStandzeitWarning(daysStanding: number): string {
  if (daysStanding < 7) return `${daysStanding} Tage nicht bewegt`
  const weeks = Math.floor(daysStanding / 7)
  const remainingDays = daysStanding % 7
  if (remainingDays === 0) return `${weeks} Wochen nicht bewegt`
  return `${weeks} Wochen und ${remainingDays} Tage nicht bewegt`
}

// Risks of long standing time
export function getStandzeitRisks(daysStanding: number): string[] {
  const risks: string[] = []
  if (daysStanding >= 14) risks.push('Batterie kann sich entladen')
  if (daysStanding >= 21) risks.push('Bremsen können festrosten')
  if (daysStanding >= 28) risks.push('Reifenstandplatten möglich')
  if (daysStanding >= 42) risks.push('Dichtungen können austrocknen')
  if (daysStanding >= 56) risks.push('Kraftstoff kann altern')
  if (daysStanding >= 90) risks.push('Motor-Innenteile ohne Ölfilm')
  return risks
}
