'use client'

import { useState, useEffect } from 'react'
import { useSpeechRecognition, parseVoiceCommand, ParsedCommand } from '@/lib/speech'
import { VoiceCommandDialog } from './voice-command-dialog'
import { toast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

export function VoiceInputButton() {
  const { isListening, transcript, startListening, stopListening, isSupported } = useSpeechRecognition()
  const [showDialog, setShowDialog] = useState(false)
  const [parsedCommand, setParsedCommand] = useState<ParsedCommand | null>(null)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Show warning if Web Speech API is not supported
  useEffect(() => {
    if (isMounted && !isSupported) {
      // Only log, don't show toast on every mount
      console.info('Web Speech API nicht unterstützt')
    }
  }, [isMounted, isSupported])

  const handleMicClick = () => {
    if (!isSupported) {
      toast({
        title: 'Spracheingabe nicht verfügbar',
        description: 'Ihr Browser unterstützt die Web Speech API nicht.',
        variant: 'destructive',
      })
      return
    }

    if (isListening) {
      stopListening()
      // Parse the transcript after stopping
      if (transcript.trim()) {
        const command = parseVoiceCommand(transcript)
        setParsedCommand(command)
        setShowDialog(true)
      }
    } else {
      startListening()
    }
  }

  if (!isMounted) return null

  return (
    <>
      {/* Floating Microphone Button */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3">
        {/* Transcript Overlay */}
        {isListening && transcript && (
          <div className="max-w-xs rounded-lg border border-[#333333] bg-[#1E1E1E] px-4 py-2 text-[#F0F0F0] shadow-lg animate-in fade-in slide-in-from-bottom-2 duration-200">
            <p className="text-sm">{transcript}</p>
          </div>
        )}

        {/* Microphone Button */}
        <button
          onClick={handleMicClick}
          disabled={!isSupported}
          className={cn(
            'relative flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#C9A84C] focus:ring-offset-2 focus:ring-offset-[#0A0A0A]',
            isSupported ? 'cursor-pointer' : 'cursor-not-allowed opacity-50',
            isListening
              ? 'bg-[#C9A84C] hover:bg-[#B8963D] active:bg-[#A78632]'
              : 'bg-[#C9A84C] hover:bg-[#B8963D] active:bg-[#A78632]'
          )}
          title={isSupported ? 'Sprachbefehl aufnehmen' : 'Web Speech API nicht unterstützt'}
        >
          {/* Pulsing Ring Animation (when listening) */}
          {isListening && (
            <div className="absolute inset-0 rounded-full border-2 border-[#C9A84C] animate-pulse" />
          )}

          {/* Microphone Icon */}
          <svg
            className="relative z-10 h-6 w-6 text-[#0A0A0A]"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
            <path d="M17 16.91c-1.48 1.46-3.51 2.36-5.77 2.36s-4.29-.9-5.77-2.36M19 12h2c0 .82-.15 1.61-.41 2.34m-2.41 6c-.82.82-1.92 1.43-3.18 1.62v-2.02M5 12H3c0-.82.15-1.61.41-2.34m2.41-6c.82-.82 1.92-1.43 3.18-1.62V4.02" />
          </svg>

          {/* Recording Indicator */}
          {isListening && (
            <div className="absolute right-1 bottom-1 h-2 w-2 rounded-full bg-red-500 animate-pulse" />
          )}
        </button>
      </div>

      {/* Voice Command Dialog */}
      <VoiceCommandDialog
        open={showDialog}
        command={parsedCommand}
        onOpenChange={setShowDialog}
        onSave={() => {
          setParsedCommand(null)
          setShowDialog(false)
        }}
      />

      {/* Info message for unsupported browsers */}
      {!isSupported && (
        <div className="fixed bottom-28 right-6 rounded-lg border border-[#333333] bg-[#1E1E1E] px-4 py-2 text-xs text-[#888888] shadow-lg max-w-xs">
          Web Speech API wird von Ihrem Browser nicht unterstützt.
        </div>
      )}
    </>
  )
}
