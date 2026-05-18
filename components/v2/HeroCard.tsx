'use client'

import { Chip } from './Chip'
import { ScorePill } from './ScorePill'
import { BG_PALETTE } from './types'
import type { HeroProduct } from './types'

// Photo-as-hero card. Composition:
//   - Brand mono + save heart at the top
//   - Large rounded photo (dominant element, ~3/5 of card height)
//   - One floating chip overlaying the top-left of the photo
//   - ScorePill straddling the bottom edge of the photo
//   - Product name + size mono + arrow button beneath
export function HeroCard({
  product,
  lang = 'en',
  width = 296,
  height = 460,
  onClick,
}: {
  product: HeroProduct
  lang?: 'en' | 'ar'
  width?: number
  height?: number
  onClick?: () => void
}) {
  const bg = BG_PALETTE[product.bg]
  const photoH = Math.round(height * 0.62)
  const photoW = width - 32

  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width, height,
        borderRadius: 28,
        position: 'relative',
        background: '#FFFFFF',
        direction: lang === 'ar' ? 'rtl' : 'ltr',
        flexShrink: 0,
        border: 'none',
        padding: 16,
        textAlign: 'inherit',
        cursor: onClick ? 'pointer' : 'default',
        boxShadow: `0 24px 50px -28px ${bg.accent}44, 0 1px 0 rgba(255,255,255,0.6) inset, 0 0 0 0.5px rgba(40,28,18,0.05)`,
        display: 'flex', flexDirection: 'column',
      }}
    >
      {/* Top chrome — brand + save */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '4px 6px 12px',
      }}>
        <span className="n-mono" style={{ color: 'var(--ink-3)' }}>
          {lang === 'ar' ? product.brand : product.brand.toUpperCase()}
        </span>
        <span style={{
          width: 28, height: 28, borderRadius: '50%',
          background: 'rgba(24,20,16,0.06)',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }} aria-hidden>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
            <path d="M12 21s-7-4.5-7-10a4 4 0 017-2.6A4 4 0 0119 11c0 5.5-7 10-7 10z"
                  stroke="var(--ink)" strokeWidth="2" strokeLinejoin="round" fill="none" />
          </svg>
        </span>
      </div>

      {/* Photo frame — the hero */}
      <div style={{
        position: 'relative',
        width: photoW, height: photoH,
        marginLeft: 'auto', marginRight: 'auto',
        borderRadius: 20,
        overflow: 'visible',
      }}>
        <div style={{
          width: '100%', height: '100%',
          borderRadius: 20,
          overflow: 'hidden',
          background: `linear-gradient(160deg, ${bg.tint}40 0%, ${bg.tint}20 100%)`,
          position: 'relative',
        }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={product.image}
            alt={product.product_name}
            loading="lazy"
            style={{
              width: '100%', height: '100%',
              objectFit: 'cover',
              display: 'block',
            }}
          />
        </div>

        {/* Floating chip on photo */}
        {product.chips[0] && (
          <div style={{
            position: 'absolute',
            top: 14,
            [lang === 'ar' ? 'right' : 'left']: 14,
            zIndex: 3,
          }}>
            <Chip kind={product.chips[0].kind} lang={lang}>{product.chips[0].text}</Chip>
          </div>
        )}

        {/* Score pill straddling the bottom edge */}
        <div style={{
          position: 'absolute',
          bottom: -18,
          left: 0, right: 0,
          display: 'flex', justifyContent: 'center',
          zIndex: 4,
        }}>
          <ScorePill grade={product.grade} score={product.score} lang={lang} />
        </div>
      </div>

      {/* Footer — name + size + arrow */}
      <div style={{
        marginTop: 30,
        flex: 1,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: 12,
        padding: '0 6px',
      }}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{
            fontFamily: lang === 'ar' ? 'var(--ff-ar)' : 'var(--ff-display)',
            fontWeight: 800,
            fontSize: lang === 'ar' ? 22 : 24,
            lineHeight: 1.05,
            letterSpacing: '-0.02em',
            color: 'var(--ink)',
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}>{product.product_name}</div>
          <div style={{
            marginTop: 4,
            fontFamily: lang === 'ar' ? 'var(--ff-ar)' : 'var(--ff-mono)',
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: lang === 'ar' ? 0 : '0.14em',
            color: 'var(--ink-3)',
            textTransform: lang === 'ar' ? 'none' : 'uppercase',
          }}>{product.size_label}</div>
        </div>
        <span style={{
          width: 40, height: 40, borderRadius: '50%',
          background: 'var(--ink)',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
          boxShadow: '0 6px 14px -4px rgba(40,28,18,0.22)',
        }} aria-hidden>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ transform: lang === 'ar' ? 'rotate(180deg)' : 'rotate(-45deg)' }}>
            <path d="M5 12h14M13 6l6 6-6 6" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </div>
    </button>
  )
}
