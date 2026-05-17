'use client'

import { Chip } from './Chip'
import { BigScorePill } from './BigScorePill'
import type { HeroProduct } from './types'

export function HeroCard({
  product,
  lang = 'en',
  width = 278,
  height = 440,
  onClick,
}: {
  product: HeroProduct
  lang?: 'en' | 'ar'
  width?: number
  height?: number
  onClick?: () => void
}) {
  const chips = product.chips
  const arrow = lang === 'ar' ? 'rotate(180deg)' : 'rotate(-45deg)'

  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width, height,
        borderRadius: 32,
        position: 'relative',
        overflow: 'hidden',
        background: '#FFFFFF',
        direction: lang === 'ar' ? 'rtl' : 'ltr',
        flexShrink: 0,
        boxShadow: '0 1px 0 rgba(255,255,255,0.5) inset, 0 18px 40px -22px rgba(40,28,18,0.18), 0 0 0 0.5px rgba(40,28,18,0.04)',
        border: 'none',
        padding: 0,
        textAlign: 'inherit',
        cursor: onClick ? 'pointer' : 'default',
      }}
    >
      <div className="n-grain" style={{
        position: 'absolute', inset: 0, background: '#FFFFFF', borderRadius: 32,
      }} />

      {/* Top chrome — brand */}
      <div style={{
        position: 'absolute', top: 20, left: 22, right: 22, zIndex: 4,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <span className="n-mono" style={{ color: 'var(--ink-3)' }}>
          {lang === 'ar' ? product.brand : product.brand.toUpperCase()}
        </span>
      </div>

      {/* Big score pill — top-left, overlapping into the photo region */}
      <div style={{
        position: 'absolute',
        top: 58,
        [lang === 'ar' ? 'right' : 'left']: 18,
        zIndex: 4,
      }}>
        <BigScorePill grade={product.grade} lang={lang} />
      </div>

      {/* Hero photo — floating opposite the score pill */}
      <div style={{
        position: 'absolute',
        top: '22%',
        [lang === 'ar' ? 'left' : 'right']: '6%',
        width: width * 0.58,
        height: width * 0.74,
        zIndex: 2,
        filter: 'drop-shadow(0 22px 30px rgba(40,28,18,0.18)) drop-shadow(0 8px 12px rgba(40,28,18,0.12))',
      }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.image}
          alt={product.product_name}
          loading="lazy"
          style={{
            width: '100%', height: '100%',
            objectFit: 'contain',
          }}
        />
      </div>

      {/* Floating chips */}
      {chips[0] && (
        <div style={{
          position: 'absolute',
          top: width * 0.78,
          [lang === 'ar' ? 'right' : 'left']: 22,
          zIndex: 3,
          transform: lang === 'ar' ? 'rotate(2deg)' : 'rotate(-2deg)',
        }}>
          <Chip kind={chips[0].kind} lang={lang}>{chips[0].text}</Chip>
        </div>
      )}
      {chips[1] && (
        <div style={{
          position: 'absolute',
          top: width * 0.95,
          [lang === 'ar' ? 'left' : 'right']: 22,
          zIndex: 3,
          transform: lang === 'ar' ? 'rotate(-2deg)' : 'rotate(2deg)',
        }}>
          <Chip kind={chips[1].kind} lang={lang}>{chips[1].text}</Chip>
        </div>
      )}

      {/* Footer copy — name + take + size + arrow button */}
      <div style={{
        position: 'absolute',
        left: 26, right: 26,
        bottom: 26,
        zIndex: 3,
        textAlign: lang === 'ar' ? 'right' : 'left',
      }}>
        <div style={{
          fontFamily: lang === 'ar' ? 'var(--ff-ar)' : 'var(--ff-display)',
          fontWeight: 800,
          fontSize: lang === 'ar' ? 24 : 26,
          lineHeight: 0.95,
          letterSpacing: '-0.02em',
          color: 'var(--ink)',
          marginBottom: 6,
          textWrap: 'balance',
        }}>
          {product.product_name}
        </div>
        <div style={{
          fontFamily: lang === 'ar' ? 'var(--ff-ar)' : 'var(--ff-sans)',
          fontSize: 12.5,
          fontWeight: 500,
          lineHeight: 1.3,
          color: 'var(--ink-2)',
          marginBottom: 12,
        }}>
          {product.take}
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: 12,
        }}>
          <span style={{
            fontFamily: lang === 'ar' ? 'var(--ff-ar)' : 'var(--ff-mono)',
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: lang === 'ar' ? 0 : '0.14em',
            color: 'var(--ink-3)',
            textTransform: lang === 'ar' ? 'none' : 'uppercase',
          }}>{product.size_label}</span>
          <span style={{
            width: 36, height: 36, borderRadius: '50%',
            background: 'var(--ink)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 6px 14px -4px rgba(40,28,18,0.22)',
          }} aria-hidden>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ transform: arrow }}>
              <path d="M5 12h14M13 6l6 6-6 6" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </div>
      </div>
    </button>
  )
}
