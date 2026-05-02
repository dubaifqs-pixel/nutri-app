'use client'

import type { ChatMessage as ChatMessageType } from '@/lib/types'

const BADGE_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  HARMFUL: { bg: 'rgba(220, 38, 38, 0.08)', text: '#DC2626', border: 'rgba(220, 38, 38, 0.2)' },
  CAUTION: { bg: 'rgba(234, 88, 12, 0.08)', text: '#EA580C', border: 'rgba(234, 88, 12, 0.2)' },
  MODERATE: { bg: 'rgba(217, 119, 6, 0.08)', text: '#D97706', border: 'rgba(217, 119, 6, 0.2)' },
  GOOD: { bg: 'rgba(101, 163, 13, 0.08)', text: '#65A30D', border: 'rgba(101, 163, 13, 0.2)' },
  EXCELLENT: { bg: 'rgba(5, 150, 105, 0.08)', text: '#059669', border: 'rgba(5, 150, 105, 0.2)' },
  SAFE: { bg: 'rgba(5, 150, 105, 0.08)', text: '#059669', border: 'rgba(5, 150, 105, 0.2)' },
  OK: { bg: 'rgba(101, 163, 13, 0.08)', text: '#65A30D', border: 'rgba(101, 163, 13, 0.2)' },
  LIMIT: { bg: 'rgba(217, 119, 6, 0.08)', text: '#D97706', border: 'rgba(217, 119, 6, 0.2)' },
  AVOID: { bg: 'rgba(220, 38, 38, 0.08)', text: '#DC2626', border: 'rgba(220, 38, 38, 0.2)' },
}

const LEVEL_COLORS: Record<string, string> = {
  high: '#DC2626',
  moderate: '#D97706',
  low: '#059669',
  good: '#059669',
}

function DailyIntakeBar({ percent, color }: { percent: number; color: string }) {
  const clamped = Math.min(percent, 150)
  return (
    <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'rgba(26, 29, 46, 0.06)' }}>
      <div
        className="h-full rounded-full transition-all duration-700"
        style={{
          width: `${Math.min(clamped / 1.5, 100)}%`,
          background: color,
          boxShadow: percent > 80 ? `0 0 8px ${color}40` : 'none',
        }}
      />
    </div>
  )
}

function WarningIcon() {
  return <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
}

function CheckIcon() {
  return <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
}

function LightbulbIcon() {
  return <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>
}

function ShieldIcon() {
  return <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/></svg>
}

function RichResponse({ content }: { content: string }) {
  let parsed: any
  try {
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) return <PlainText content={content} />
    parsed = JSON.parse(jsonMatch[0])
    if (!parsed.sections) return <PlainText content={content} />
  } catch {
    return <PlainText content={content} />
  }

  return (
    <div className="flex flex-col gap-3 w-full">
      {parsed.sections.map((section: any, i: number) => {
        switch (section.type) {
          case 'verdict':
          case 'answer':
            return <VerdictBadge key={i} section={section} />
          case 'concerns':
            return <ConcernsSection key={i} section={section} />
          case 'positives':
            return <PositivesSection key={i} section={section} />
          case 'detail':
            return <DetailSection key={i} section={section} />
          case 'calculation':
            return <CalculationSection key={i} section={section} />
          case 'advice':
            return <AdviceSection key={i} section={section} />
          case 'tip':
            return <TipSection key={i} section={section} />
          default:
            return null
        }
      })}
    </div>
  )
}

function VerdictBadge({ section }: { section: any }) {
  const style = BADGE_STYLES[section.badge] || BADGE_STYLES.MODERATE
  return (
    <div
      className="flex items-center gap-2.5 px-4 py-3 rounded-2xl animate-scale-in"
      style={{ background: style.bg, border: `1px solid ${style.border}` }}
    >
      <div
        className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: style.text, color: 'white' }}
      >
        {section.badge === 'HARMFUL' || section.badge === 'CAUTION' ? <WarningIcon /> : <CheckIcon />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold" style={{ color: style.text }}>{section.title_en}</p>
        <p className="text-xs mt-0.5" style={{ color: style.text, opacity: 0.8 }} dir="rtl">{section.title_ar}</p>
      </div>
      <span
        className="text-[10px] font-bold px-2 py-1 rounded-lg shrink-0 uppercase tracking-wider"
        style={{ background: style.text, color: 'white' }}
      >
        {section.badge}
      </span>
    </div>
  )
}

function ConcernsSection({ section }: { section: any }) {
  if (!section.items?.length) return null
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-1.5 px-1">
        <span style={{ color: '#DC2626' }}><WarningIcon /></span>
        <span className="text-xs font-semibold text-[#DC2626] uppercase tracking-wider">Concerns</span>
      </div>
      {section.items.map((item: any, i: number) => {
        const color = LEVEL_COLORS[item.level] || '#D97706'
        return (
          <div
            key={i}
            className="glass-subtle rounded-2xl p-3 animate-slide-up"
            style={{ animationDelay: `${i * 0.1}s`, borderColor: `${color}15` }}
          >
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-[#1A1D2E]">{item.nutrient}</span>
                <span className="text-xs font-bold px-1.5 py-0.5 rounded-md" style={{ background: `${color}12`, color }}>{item.value}</span>
              </div>
              <span className="text-xs font-bold px-2 py-0.5 rounded-lg" style={{ background: `${color}15`, color }}>
                {item.daily_percent}% daily
              </span>
            </div>
            <DailyIntakeBar percent={item.daily_percent} color={color} />
            <p className="text-xs text-[#6B7194] mt-1.5">{item.note_en}</p>
            <p className="text-xs text-[#6B7194] mt-0.5" dir="rtl">{item.note_ar}</p>
          </div>
        )
      })}
    </div>
  )
}

function PositivesSection({ section }: { section: any }) {
  if (!section.items?.length) return null
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-1.5 px-1">
        <span style={{ color: '#059669' }}><CheckIcon /></span>
        <span className="text-xs font-semibold text-[#059669] uppercase tracking-wider">Positives</span>
      </div>
      {section.items.map((item: any, i: number) => {
        const color = LEVEL_COLORS[item.level] || '#059669'
        return (
          <div
            key={i}
            className="glass-subtle rounded-2xl p-3 animate-slide-up"
            style={{ animationDelay: `${(i + 3) * 0.1}s`, borderColor: `${color}15` }}
          >
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-[#1A1D2E]">{item.nutrient}</span>
              <span className="text-xs font-bold px-1.5 py-0.5 rounded-md" style={{ background: `${color}12`, color }}>{item.value}</span>
              <span className="text-xs px-1.5 py-0.5 rounded-md uppercase font-semibold" style={{ background: `${color}12`, color }}>{item.level}</span>
            </div>
            <p className="text-xs text-[#6B7194] mt-1.5">{item.note_en}</p>
            <p className="text-xs text-[#6B7194] mt-0.5" dir="rtl">{item.note_ar}</p>
          </div>
        )
      })}
    </div>
  )
}

function DetailSection({ section }: { section: any }) {
  if (!section.points?.length) return null
  return (
    <div className="flex flex-col gap-2 animate-slide-up" style={{ animationDelay: '0.15s' }}>
      <div className="flex items-center gap-1.5 px-1">
        <span style={{ color: '#1A1D2E' }}><ShieldIcon /></span>
        <span className="text-xs font-semibold text-[#1A1D2E] uppercase tracking-wider">{section.title_en || 'Details'}</span>
      </div>
      <div className="glass-subtle rounded-2xl p-3" style={{ borderColor: 'rgba(26, 29, 46, 0.08)' }}>
        <div className="flex flex-col gap-2.5">
          {section.points.map((point: any, i: number) => (
            <div key={i} className="flex items-start gap-2.5">
              <div
                className="w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5"
                style={{
                  background: point.highlight ? 'rgba(241, 177, 35, 0.12)' : 'rgba(26, 29, 46, 0.06)',
                  color: point.highlight ? '#D89A0E' : '#6B7194',
                }}
              >
                {point.highlight ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"/></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/></svg>
                )}
              </div>
              <div className="flex-1">
                <p className={`text-sm leading-relaxed ${point.highlight ? 'text-[#1A1D2E] font-medium' : 'text-[#3A3F57]'}`}>{point.text_en}</p>
                <p className="text-xs text-[#6B7194] mt-0.5" dir="rtl">{point.text_ar}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function CalculationSection({ section }: { section: any }) {
  return (
    <div
      className="rounded-2xl p-4 animate-scale-in"
      style={{
        animationDelay: '0.3s',
        background: 'linear-gradient(135deg, rgba(241, 177, 35, 0.08), rgba(241, 177, 35, 0.03))',
        border: '1px solid rgba(241, 177, 35, 0.18)',
      }}
    >
      <div className="flex items-center gap-1.5 mb-3">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#D89A0E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="16" height="16" x="4" y="4" rx="2"/><path d="M8 10h8"/><path d="M8 14h4"/><path d="M12 8v8"/></svg>
        <span className="text-xs font-semibold text-[#D89A0E] uppercase tracking-wider">{section.label_en || 'Recommended Amount'}</span>
      </div>
      <div className="flex items-center gap-3 mb-2">
        <div className="text-2xl font-bold text-[#1A1D2E]" style={{ fontFamily: 'var(--font-inter)' }}>{section.value}</div>
      </div>
      <div className="text-sm font-medium text-[#6B7194] mb-2" dir="rtl">{section.value_ar}</div>
      <div className="h-px w-full my-2" style={{ background: 'rgba(241, 177, 35, 0.15)' }} />
      <p className="text-xs text-[#6B7194] leading-relaxed">{section.note_en}</p>
      <p className="text-xs text-[#6B7194] leading-relaxed mt-1" dir="rtl">{section.note_ar}</p>
    </div>
  )
}

function AdviceSection({ section }: { section: any }) {
  return (
    <div className="glass-subtle rounded-2xl p-3.5 animate-slide-up" style={{ animationDelay: '0.5s', borderColor: 'rgba(241, 177, 35, 0.15)' }}>
      <div className="flex items-center gap-1.5 mb-2">
        <span style={{ color: '#1A1D2E' }}><ShieldIcon /></span>
        <span className="text-xs font-semibold text-[#1A1D2E] uppercase tracking-wider">Advice</span>
      </div>
      <p className="text-sm text-[#1A1D2E] leading-relaxed">{section.text_en}</p>
      <p className="text-sm text-[#6B7194] leading-relaxed mt-1.5" dir="rtl">{section.text_ar}</p>
    </div>
  )
}

function TipSection({ section }: { section: any }) {
  return (
    <div
      className="flex items-start gap-2.5 px-3.5 py-3 rounded-2xl animate-slide-up"
      style={{ animationDelay: '0.6s', background: 'rgba(241, 177, 35, 0.06)', border: '1px solid rgba(241, 177, 35, 0.12)' }}
    >
      <span className="mt-0.5" style={{ color: '#F1B123' }}><LightbulbIcon /></span>
      <div className="flex-1">
        <p className="text-xs text-[#1A1D2E] leading-relaxed">{section.text_en}</p>
        <p className="text-xs text-[#6B7194] leading-relaxed mt-1" dir="rtl">{section.text_ar}</p>
      </div>
    </div>
  )
}

function PlainText({ content }: { content: string }) {
  return <div className="whitespace-pre-wrap text-sm leading-relaxed">{content}</div>
}

export default function ChatMessage({ message }: { message: ChatMessageType }) {
  const isUser = message.role === 'user'

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] px-4 py-3 text-sm leading-relaxed glass-dark text-white rounded-2xl rounded-br-md">
          <div className="whitespace-pre-wrap">{message.content}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex justify-start">
      <div className="max-w-[92%] w-full">
        <RichResponse content={message.content} />
      </div>
    </div>
  )
}
