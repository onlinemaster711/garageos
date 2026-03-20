'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

interface AccordionItemProps {
  question: string
  answer: string
  isOpen?: boolean
  onToggle?: () => void
}

export function AccordionItem({ question, answer, isOpen = false, onToggle }: AccordionItemProps) {
  const [open, setOpen] = useState(isOpen)

  const handleToggle = () => {
    setOpen(!open)
    onToggle?.()
  }

  return (
    <div
      className="mb-4 rounded-lg border overflow-hidden transition-all duration-200"
      style={{
        backgroundColor: '#FFFFFF',
        borderColor: '#E0DDD4',
      }}
    >
      {/* Header */}
      <button
        onClick={handleToggle}
        className="w-full px-6 py-4 flex items-center justify-between hover:opacity-90 transition-opacity"
        style={{ backgroundColor: '#FFFFFF' }}
      >
        <h4
          className="text-base font-bold text-left"
          style={{ color: '#0A1A2F' }}
        >
          {question}
        </h4>
        <ChevronDown
          className={`w-5 h-5 transition-transform duration-300 flex-shrink-0 ${
            open ? 'rotate-180' : ''
          }`}
          style={{ color: '#E5C97B' }}
        />
      </button>

      {/* Body */}
      {open && (
        <div
          className="px-6 py-4 border-t"
          style={{
            backgroundColor: '#FFFFFF',
            borderColor: '#E0DDD4',
            color: '#666666',
          }}
        >
          <p className="text-sm leading-relaxed">{answer}</p>
        </div>
      )}
    </div>
  )
}
