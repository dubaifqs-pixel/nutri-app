'use client'

import { GRADE_TILE } from './types'
import type { HeroProduct } from './types'

export function ThumbChip({
  product,
  lang = 'en',
  size = 64,
  onClick,
}: {
  product: HeroProduct
  lang?: 'en' | 'ar'
  size?: number
  onClick?: () => void
}) {
  const tile = GRADE_TILE[product.grade]
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: size,
        flexShrink: 0,
        display: 'flex', flexDirection: 'column', gap: 6,
        background: 'transparent', border: 'none', padding: 0,
        textAlign: lang === 'ar' ? 'right' : 'left',
        cursor: onClick ? 'pointer' : 'default',
      }}
    >
      <div style={{
        width: size, height: size,
        borderRadius: 18,
        background: '#FFFFFF',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 0 0 0.5px rgba(40,28,18,0.06), 0 4px 12px -8px rgba(40,28,18,0.12)',
      }}>
        <div style={{
          position: 'absolute', top: 5, left: 5, zIndex: 2,
          width: size * 0.34, height: size * 0.34,
          borderRadius: size * 0.10,
          background: tile.bg, color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'var(--ff-display)', fontWeight: 800,
          fontSize: size * 0.22, lineHeight: 1, letterSpacing: '-0.03em',
          boxShadow: '0 4px 10px -3px rgba(40,28,18,0.20)',
        }}>{product.grade}</div>
        <div style={{
          position: 'absolute', inset: '18% 14% 12%',
          filter: 'drop-shadow(0 6px 10px rgba(40,28,18,0.14))',
        }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={product.image}
            alt={product.product_name}
            loading="lazy"
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          />
        </div>
      </div>
      <div style={{
        fontFamily: lang === 'ar' ? 'var(--ff-ar)' : 'var(--ff-sans)',
        fontSize: 11, fontWeight: 600,
        color: 'var(--ink-2)',
        lineHeight: 1.2,
        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
      }}>{product.brand}</div>
    </button>
  )
}
