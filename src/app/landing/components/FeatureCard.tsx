'use client'

interface FeatureCardProps {
  subheadline: string
  body: string
  imagePath: string
  imageAlt: string
  reversed?: boolean
}

export function FeatureCard({
  subheadline,
  body,
  imagePath,
  imageAlt,
  reversed = false,
}: FeatureCardProps) {
  return (
    <div
      className={`grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center py-16 lg:py-20`}
    >
      {/* Text Content */}
      <div className={reversed ? 'lg:col-start-2' : ''}>
        <h3
          className="text-2xl sm:text-3xl font-bold mb-4"
          style={{ color: '#E5C97B' }}
        >
          {subheadline}
        </h3>
        <p
          className="text-base leading-relaxed text-lg"
          style={{ color: '#333333' }}
        >
          {body}
        </p>
      </div>

      {/* Image/Screenshot */}
      <div className={reversed ? 'lg:col-start-1 lg:row-start-1' : ''}>
        <div
          className="rounded-2xl overflow-hidden shadow-lg aspect-video w-full flex items-center justify-center"
          style={{
            backgroundColor: '#2A2D30',
            borderColor: '#E5C97B',
            border: '1px solid #E5C97B',
          }}
        >
          <div className="text-center">
            <div className="text-4xl mb-3">📸</div>
            <p
              className="text-sm"
              style={{ color: '#9B9B9B' }}
            >
              {imageAlt}
            </p>
            <p
              className="text-xs mt-2"
              style={{ color: '#9B9B9B' }}
            >
              {imagePath}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
