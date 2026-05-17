// HeroCard — Swipe-Drinks-style product card (Claude Design).
// White on cream, brand top-left, BigScorePill top-left,
// floating photo top-right, 2 rotated floating chips, footer with name+take+arrow.
import BigScorePill from './BigScorePill'
import Chip from './Chip'
import type { Grade } from '@/lib/types'

export type HeroProduct = {
  brand: string
  product_name: string
  take: string // 1-line opinionated caption
  size_label: string // e.g. "330ML CAN" or "1L BOTTLE"
  grade: Grade
  image: string
  chips: { kind: 'pos' | 'warn' | 'bad' | 'neutral'; text: string }[]
}

export default function HeroCard({
  product,
  width = 302,
  height = 510,
  onTap,
  onSave,
  lang = 'en',
}: {
  product: HeroProduct
  width?: number
  height?: number
  onTap?: () => void
  onSave?: () => void
  lang?: 'en' | 'ar'
}) {
  const isRTL = lang === 'ar'
  return (
    <div
      style={{
        width,
        height,
        borderRadius: 32,
        position: 'relative',
        overflow: 'hidden',
        background: '#FFFFFF',
        flexShrink: 0,
        direction: isRTL ? 'rtl' : 'ltr',
        boxShadow:
          '0 1px 0 rgba(255,255,255,0.5) inset, 0 18px 40px -22px rgba(40,28,18,0.18), 0 0 0 0.5px rgba(40,28,18,0.04)',
      }}
    >
      {/* TOP CHROME — brand uppercase + save */}
      <div
        style={{
          position: 'absolute',
          top: 20,
          left: 22,
          right: 22,
          zIndex: 4,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <span className="n-mono" style={{ color: '#7A7166' }}>
          {product.brand.toUpperCase()}
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onSave?.()
          }}
          style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            background: 'rgba(24,20,16,0.06)',
            border: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
          aria-label="Save"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 21s-7-4.5-7-10a4 4 0 017-2.6A4 4 0 0119 11c0 5.5-7 10-7 10z"
              stroke="#181410"
              strokeWidth="2"
              strokeLinejoin="round"
              fill="none"
            />
          </svg>
        </button>
      </div>

      {/* BigScorePill — anchored top-left below chrome */}
      <div
        style={{
          position: 'absolute',
          top: 58,
          [isRTL ? 'right' : 'left']: 18,
          zIndex: 4,
        }}
      >
        <BigScorePill grade={product.grade} lang={lang} />
      </div>

      {/* HERO PHOTO — floating, shadowed, opposite the score pill */}
      <div
        style={{
          position: 'absolute',
          top: '22%',
          [isRTL ? 'left' : 'right']: '6%',
          width: width * 0.58,
          height: width * 0.74,
          zIndex: 2,
          filter:
            'drop-shadow(0 22px 30px rgba(40,28,18,0.18)) drop-shadow(0 8px 12px rgba(40,28,18,0.12))',
        }}
      >
        <img
          src={product.image}
          alt={product.product_name}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
          }}
        />
      </div>

      {/* Floating chips — overlap bottom of photo area, rotated slightly */}
      {product.chips[0] && (
        <div
          style={{
            position: 'absolute',
            top: width * 0.78,
            [isRTL ? 'right' : 'left']: 18,
            zIndex: 5,
            transform: isRTL ? 'rotate(2deg)' : 'rotate(-2deg)',
          }}
        >
          <Chip kind={product.chips[0].kind}>{product.chips[0].text}</Chip>
        </div>
      )}
      {product.chips[1] && (
        <div
          style={{
            position: 'absolute',
            top: width * 0.92,
            [isRTL ? 'left' : 'right']: 18,
            zIndex: 5,
            transform: isRTL ? 'rotate(-2deg)' : 'rotate(2deg)',
          }}
        >
          <Chip kind={product.chips[1].kind}>{product.chips[1].text}</Chip>
        </div>
      )}

      {/* FOOTER — product name + take + size + arrow */}
      <div
        style={{
          position: 'absolute',
          left: 26,
          right: 26,
          bottom: 26,
          zIndex: 3,
          textAlign: isRTL ? 'right' : 'left',
        }}
      >
        <div
          style={{
            fontFamily: "'Cabinet Grotesk', system-ui, sans-serif",
            fontWeight: 800,
            fontSize: 30,
            lineHeight: 0.95,
            letterSpacing: '-0.02em',
            color: '#181410',
            marginBottom: 8,
          }}
        >
          {product.product_name}
        </div>
        <div
          style={{
            fontFamily: "'Cabinet Grotesk', system-ui, sans-serif",
            fontSize: 13.5,
            fontWeight: 500,
            lineHeight: 1.3,
            color: '#3A342A',
            marginBottom: 14,
          }}
        >
          {product.take}
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
          }}
        >
          <span
            style={{
              fontFamily: "'Cabinet Grotesk', system-ui, sans-serif",
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '0.14em',
              color: '#7A7166',
              textTransform: 'uppercase',
            }}
          >
            {product.size_label}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onTap?.()
            }}
            style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              background: '#181410',
              border: 'none',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 6px 14px -4px rgba(40,28,18,0.22)',
            }}
            aria-label="Details"
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              style={{ transform: isRTL ? 'rotate(180deg)' : 'rotate(-45deg)' }}
            >
              <path
                d="M5 12h14M13 6l6 6-6 6"
                stroke="#FFFFFF"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Click area — invisible button covering the card */}
      {onTap && (
        <button
          onClick={onTap}
          aria-label={product.product_name}
          style={{
            position: 'absolute',
            inset: 0,
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            zIndex: 1,
          }}
        />
      )}
    </div>
  )
}
