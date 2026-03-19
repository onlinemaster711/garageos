import { useState, useCallback, useRef, useEffect } from 'react'

export interface UseSpeechRecognitionReturn {
  isListening: boolean
  transcript: string
  startListening: () => void
  stopListening: () => void
  isSupported: boolean
}

export interface ParsedCommand {
  type: 'maintenance' | 'drive' | 'reminder' | 'mileage' | 'unknown'
  vehicleHint?: string
  title?: string
  cost?: number
  km?: number
  mileage?: number
  date?: string
  notes?: string
  raw: string
}

/**
 * Custom React hook for Web Speech API integration (German)
 * Handles browser compatibility and auto-stop on silence
 */
export function useSpeechRecognition(): UseSpeechRecognitionReturn {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const recognitionRef = useRef<any>(null)
  const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Check if Web Speech API is supported
  const isSupported = typeof window !== 'undefined' &&
    ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)

  useEffect(() => {
    if (!isSupported) return

    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
    recognitionRef.current = new SpeechRecognition()

    const recognition = recognitionRef.current
    recognition.lang = 'de-DE'
    recognition.continuous = true
    recognition.interimResults = true

    recognition.onstart = () => {
      setIsListening(true)
      setTranscript('')
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current)
      }
    }

    recognition.onresult = (event: any) => {
      let interimTranscript = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcriptSegment = event.results[i][0].transcript

        if (event.results[i].isFinal) {
          setTranscript(prev => prev + transcriptSegment)
        } else {
          interimTranscript += transcriptSegment
        }
      }

      // Reset silence timeout on each result
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current)
      }

      // Auto-stop after 2 seconds of silence
      silenceTimeoutRef.current = setTimeout(() => {
        recognition.stop()
      }, 2000)
    }

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error)
      setIsListening(false)
    }

    recognition.onend = () => {
      setIsListening(false)
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current)
      }
    }

    return () => {
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current)
      }
    }
  }, [isSupported])

  const startListening = useCallback(() => {
    if (!isSupported || !recognitionRef.current) return
    setTranscript('')
    recognitionRef.current.start()
  }, [isSupported])

  const stopListening = useCallback(() => {
    if (!isSupported || !recognitionRef.current) return
    recognitionRef.current.stop()
    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current)
    }
  }, [isSupported])

  return {
    isListening,
    transcript,
    startListening,
    stopListening,
    isSupported,
  }
}

/**
 * Parse German voice commands into structured data
 * Supports: Maintenance, Drive, Reminder, Mileage
 */
export function parseVoiceCommand(rawTranscript: string): ParsedCommand {
  const text = rawTranscript.toLowerCase().trim()

  // Maintenance: "Ölwechsel beim [Marke] [Modell], [Betrag] Euro"
  const maintenanceMatch = text.match(
    /(?:ölwechsel|öl[\s-]?wechsel|wartung|inspektion|reparatur|ersatzteil|reparation)\s+(?:beim|bei|bei\s+der)\s+([a-zäöü]+)\s+([a-zäöü\s]+?)(?:,|für)?\s*(?:(\d+(?:[.,]\d{1,2})?)\s*euro)?/i
  )
  if (maintenanceMatch) {
    const [, make, model, costStr] = maintenanceMatch
    const cost = costStr ? parseFloat(costStr.replace(',', '.')) : undefined

    return {
      type: 'maintenance',
      vehicleHint: `${make} ${model}`.trim(),
      title: 'Wartung',
      cost,
      raw: rawTranscript,
    }
  }

  // Drive: "Heute [X] km mit dem [Marke] gefahren" or "[X] km mit [Marke] [Modell] gefahren"
  const driveMatch = text.match(
    /(?:heute|gestern)?\s*(?:(\d+)(?:\s*km)?(?:\s+(?:kilometer|km)?)?)\s+(?:mit|mit\s+dem|mit\s+der)\s+([a-zäöü]+)\s*(?:([a-zäöü\s]+?))?\s+(?:gefahren|gefahrt|fahrt|km\s+gefahren)?/i
  )
  if (driveMatch) {
    const [, kmStr, make, model] = driveMatch
    const km = kmStr ? parseInt(kmStr, 10) : undefined
    const vehicleHint = model ? `${make} ${model}`.trim() : make

    return {
      type: 'drive',
      vehicleHint,
      km,
      date: new Date().toISOString().split('T')[0],
      raw: rawTranscript,
    }
  }

  // Mileage: "Kilometerstand [Marke] [Zahl]" or "[Marke] [Modell] [Zahl] km"
  const mileageMatch = text.match(
    /(?:kilometerstand|km[\s-]?stand|stand|meilage)\s+([a-zäöü]+)\s*(?:([a-zäöü\s]+?))?\s*(?:(\d+)(?:\s*(?:kilometer|km))?)/i
  ) || text.match(
    /([a-zäöü]+)\s+(?:([a-zäöü\s]+?)\s+)?(\d+)\s*(?:kilometer|km|km\s+stand|kilometerstand)/i
  )
  if (mileageMatch) {
    const [, make, model, mileageStr] = mileageMatch
    const mileage = mileageStr ? parseInt(mileageStr, 10) : undefined
    const vehicleHint = model && model.trim() ? `${make} ${model}`.trim() : make

    return {
      type: 'mileage',
      vehicleHint,
      mileage,
      raw: rawTranscript,
    }
  }

  // Reminder: "Erinnerung [Titel] am [Datum]" or "Erinnere mich an [Titel] [Datum]"
  const reminderMatch = text.match(
    /(?:erinnerung|erinnere mich an|remind)\s+([a-zäöü\s]+?)\s+(?:am|an|um|bis|till)?\s+(\d{1,2})[.\s/\-](\d{1,2})[.\s/\-](\d{2,4})/i
  ) || text.match(
    /(?:erinnerung|erinnere mich an|remind)\s+([a-zäöü\s]+?)(?:\s+am|\s+an|\s+um|\s+bis)?(?:\s+(\w+\s+\w+))?/i
  )
  if (reminderMatch && reminderMatch[1]) {
    let date: string | undefined
    if (reminderMatch[2] && reminderMatch[3] && reminderMatch[4]) {
      const day = parseInt(reminderMatch[2], 10)
      const month = parseInt(reminderMatch[3], 10)
      const year = parseInt(reminderMatch[4], 10) < 100
        ? 2000 + parseInt(reminderMatch[4], 10)
        : parseInt(reminderMatch[4], 10)
      date = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    }

    return {
      type: 'reminder',
      title: reminderMatch[1].trim(),
      date,
      raw: rawTranscript,
    }
  }

  return {
    type: 'unknown',
    raw: rawTranscript,
  }
}
