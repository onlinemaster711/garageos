'use client'

import Link from 'next/link'

interface PricingCardProps {
  title: string
  price: string
  description?: string
  features: Array<{ label: string; included: boolean }>
  buttonLabel: string
  isPopular?: boolean
}

export function PricingCard({
  title,
  price,
  description,
  features,
  buttonLabel,
  isPopular = false,
}: PricingCardProps) {
  return (
    <div
      className={`rounded-lg p-8 relative transition-all duration-300 ${
        isPopular ? 'lg:scale-105 shadow-2xl' : 'shadow-lg'
      }`}
      style={{
        backgroundColor: isPopular ? '#E5C97B' : '#2A2D30',
        color: isPopular ? '#0A1A2F' : '#E6E6E6',
        border: isPopular ? 'none' : '1px solid #E5C97B',
      }}
    >
      {/* Popular Badge */}
      {isPopular && (
        <div
          className="absolute -top-4 right-6 px-4 py-1 rounded-full text-xs font-bold"
          style={{
            backgroundColor: '#0A1A2F',
            color: '#E5C97B',
          }}
        >
          Beliebt
        </div>
      )}

      {/* Title */}
      <h3 className="text-2xl font-bold mb-2">{title}</h3>

      {/* Price */}
      <div className="mb-6">
        <span
          className="text-4xl font-bold"
          style={{ color: isPopular ? '#0A1A2F' : '#E5C97B' }}
        >
          {price}
        </span>
        {description && (
          <p
            className="text-sm mt-2"
            style={{ color: isPopular ? '#333333' : '#9B9B9B' }}
          >
            {description}
          </p>
        )}
      </div>

      {/* Features */}
      <ul className="space-y-3 mb-8">
        {features.map((feature, idx) => (
          <li key={idx} className="flex items-start gap-3 text-sm">
            <span
              className="mt-1 font-bold text-lg flex-shrink-0"
              style={{ color: feature.included ? (isPopular ? '#0A1A2F' : '#4CAF50') : '#9B9B9B' }}
            >
              {feature.included ? '✓' : '✗'}
            </span>
            <span
              style={{ color: isPopular ? '#0A1A2F' : feature.included ? '#E6E6E6' : '#9B9B9B' }}
            >
              {feature.label}
            </span>
          </li>
        ))}
      </ul>

      {/* Button */}
      <Link
        href="/auth/login"
        className="w-full py-3 rounded-lg font-semibold text-center transition-all duration-200"
        style={{
          backgroundColor: isPopular ? '#0A1A2F' : '#E5C97B',
          color: isPopular ? '#E5C97B' : '#0A1A2F',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.opacity = '0.9'
          e.currentTarget.style.transform = 'scale(1.02)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.opacity = '1'
          e.currentTarget.style.transform = 'scale(1)'
        }}
      >
        {buttonLabel}
      </Link>
    </div>
  )
}
