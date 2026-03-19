export interface CountryRule {
  code: string
  name: string
  inspectionName: string // e.g. "HU/AU" for DE, "Pickerl §57a" for AT
  inspectionIntervalMonths: number // e.g. 24 for DE
  inspectionFirstAfterMonths?: number // first inspection after registration (if different)
  insuranceRenewalMonth?: number // month when insurance typically renews (1-12)
  taxReminderMonths?: number // months before tax is due
  hKennzeichenRules?: string // special rules for H-plates (DE only)
}

export const COUNTRY_RULES: Record<string, CountryRule> = {
  DE: {
    code: 'DE',
    name: 'Deutschland',
    inspectionName: 'HU/AU (TÜV)',
    inspectionIntervalMonths: 24,
    insuranceRenewalMonth: 11, // November
    hKennzeichenRules:
      'H-Kennzeichen: Fahrzeug muss mindestens 30 Jahre alt sein, weitgehend im Originalzustand',
  },
  AT: {
    code: 'AT',
    name: 'Österreich',
    inspectionName: 'Pickerl (§57a)',
    inspectionIntervalMonths: 24, // after first 3 years: every 2 years, then yearly after 5
    insuranceRenewalMonth: 1,
  },
  CH: {
    code: 'CH',
    name: 'Schweiz',
    inspectionName: 'MFK (Motorfahrzeugkontrolle)',
    inspectionIntervalMonths: 24,
    insuranceRenewalMonth: 1,
  },
  ES: {
    code: 'ES',
    name: 'Spanien',
    inspectionName: 'ITV (Inspección Técnica de Vehículos)',
    inspectionIntervalMonths: 24, // every 2 years until 10 years, then yearly
    insuranceRenewalMonth: 1,
  },
}

// Helper: get the next inspection due date based on country and last inspection date
export function getNextInspectionDate(countryCode: string, lastInspectionDate: Date): Date {
  const rule = COUNTRY_RULES[countryCode] || COUNTRY_RULES['DE']
  const next = new Date(lastInspectionDate)
  next.setMonth(next.getMonth() + rule.inspectionIntervalMonths)
  return next
}

// Helper: generate automatic reminders for a vehicle based on its country
export function getAutoReminders(
  countryCode: string,
  category: string
): Array<{ type: string; title: string; repeatMonths: number }> {
  const rule = COUNTRY_RULES[countryCode] || COUNTRY_RULES['DE']
  const reminders = [
    {
      type: 'inspection',
      title: `${rule.inspectionName} fällig`,
      repeatMonths: rule.inspectionIntervalMonths,
    },
    {
      type: 'insurance',
      title: 'Versicherung verlängern',
      repeatMonths: 12,
    },
    {
      type: 'tax',
      title: 'KFZ-Steuer fällig',
      repeatMonths: 12,
    },
    {
      type: 'tire_change_spring',
      title: 'Reifenwechsel Frühjahr (Sommerreifen)',
      repeatMonths: 12,
    },
    {
      type: 'tire_change_fall',
      title: 'Reifenwechsel Herbst (Winterreifen)',
      repeatMonths: 12,
    },
  ]
  return reminders
}

// Helper: get reminder type options for the UI
export function getReminderTypes(): Array<{ value: string; label: string }> {
  return [
    { value: 'inspection', label: 'HU/AU / TÜV / Pickerl' },
    { value: 'insurance', label: 'Versicherung' },
    { value: 'tax', label: 'KFZ-Steuer' },
    { value: 'tire_change_spring', label: 'Reifenwechsel Frühjahr' },
    { value: 'tire_change_fall', label: 'Reifenwechsel Herbst' },
    { value: 'maintenance', label: 'Wartung / Service' },
    { value: 'registration', label: 'Zulassung' },
    { value: 'custom', label: 'Eigene Erinnerung' },
  ]
}
