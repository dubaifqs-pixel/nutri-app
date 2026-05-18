'use client'

import { Suspense, useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useT, useLang } from '@/lib/i18n'
import type { ChatMessage, ProductData, GradeResult } from '@/lib/types'
import { NutriChevron } from '@/components/v2/NutriLogo'

// Plaintext-ify the API's structured JSON so the conversational bubbles stay
// readable. The /api/chat endpoint can return JSON sections with title_en
// + text_en (and Arabic variants); we collapse them into a few lines per turn.
function flattenResponse(raw: string, lang: 'en' | 'ar'): string {
  const trimmed = raw.trim()
  if (!trimmed.startsWith('{')) return raw
  try {
    const match = trimmed.match(/\{[\s\S]*\}/)?.[0] || '{}'
    const parsed = JSON.parse(match)
    const sections = parsed.sections || []
    const out: string[] = []
    for (const s of sections) {
      const title = lang === 'ar' ? s.title_ar : s.title_en
      const body = lang === 'ar' ? s.text_ar : s.text_en
      if (title) out.push(title.toString())
      if (body) out.push(body.toString())
    }
    return out.length > 0 ? out.join('\n\n') : raw
  } catch { return raw }
}

function ChatContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const t = useT()
  const lang = useLang() as 'en' | 'ar'
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [product, setProduct] = useState<ProductData | null>(null)
  const [gradeResult, setGradeResult] = useState<GradeResult | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const p = sessionStorage.getItem('dfqs_product')
    const g = sessionStorage.getItem('dfqs_grade')
    if (!p || !g) return
    setProduct(JSON.parse(p))
    setGradeResult(JSON.parse(g))
    if (searchParams.get('tab') === 'recommend') {
      const rec = sessionStorage.getItem('dfqs_recommendations')
      if (rec) {
        const r = JSON.parse(rec)
        const altText = r.alternatives?.length > 0
          ? r.alternatives.map((a: { product_name: string; grade: string }) => `· ${a.product_name} (${a.grade})`).join('\n')
          : (lang === 'ar' ? 'لم يتم العثور على بدائل' : 'No alternatives found')
        setMessages([
          { role: 'user', content: lang === 'ar' ? 'أعطني بدائل أفضل' : 'Give me better alternatives' },
          { role: 'assistant', content: `${r.summary || ''}\n\n${altText}` },
        ])
      }
    }
  }, [searchParams, lang])

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const sendMessage = async (directMessage?: string) => {
    const text = (directMessage || input).trim()
    if (!text || loading) return
    setMessages((prev) => [...prev, { role: 'user', content: text }])
    setInput('')
    setLoading(true)
    try {
      const res = await fetch('/api/chat', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          product_context: product && gradeResult ? {
            product_name: product.product_name, grade: gradeResult.grade,
            score: gradeResult.score, nutrition: product.nutrition,
          } : undefined,
        }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        setMessages((p) => [...p, { role: 'assistant', content: err.error || (lang === 'ar' ? 'حدث خطأ' : 'Something went wrong.'), isError: true }])
        return
      }
      const data = await res.json()
      if (data.error) {
        setMessages((p) => [...p, { role: 'assistant', content: data.error, isError: true }])
      } else {
        setMessages((p) => [...p, { role: 'assistant', content: flattenResponse(data.response || '', lang) }])
      }
    } catch (e) {
      setMessages((p) => [...p, { role: 'assistant', content: `${lang === 'ar' ? 'خطأ' : 'Error'}: ${e instanceof Error ? e.message : ''}`, isError: true }])
    } finally { setLoading(false) }
  }

  const promptsGeneral = lang === 'ar'
    ? ['اقترح بديلاً صحياً', 'هل هذا مناسب للأطفال؟', 'مقارنة سريعة']
    : ['Suggest a healthier swap', 'Kid-friendly?', 'Quick compare']
  const promptsProduct = lang === 'ar'
    ? ['اعرض المكوّنات', 'بدائل أرخص', 'صفر سكر مضاف']
    : ['Show ingredients', 'Cheaper alternatives', 'Zero added sugar']
  const prompts = product ? promptsProduct : promptsGeneral

  const showHeadline = messages.length === 0
  const headline = lang === 'ar' ? 'وش الأفضل اليوم؟' : `What's good today?`
  const kicker = lang === 'ar' ? 'اسأل نوتري' : 'ASK NUTRI'
  const who = lang === 'ar' ? 'نوتري الذكي' : 'Nutri AI'
  const placeholder = lang === 'ar' ? 'اسأل عن أي شيء…' : 'Ask anything about your food…'

  // Split "What's good" so trailing word can be muted like the design
  const headlineSplit = lang === 'en'
    ? { head: "What's good", tail: ' today?' }
    : { head: 'وش الأفضل', tail: ' اليوم؟' }

  return (
    <div className="nutri-app" dir={lang === 'ar' ? 'rtl' : 'ltr'} style={{
      minHeight: '100dvh',
      background: 'var(--cream)',
      position: 'relative',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Header */}
      <div style={{
        padding: '12px 20px 0',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <button onClick={() => router.back()} aria-label="back" style={iconBtn}>
          <svg width="14" height="14" viewBox="0 0 24 24" style={{ transform: lang === 'ar' ? 'rotate(180deg)' : 'none' }}>
            <path d="M14 6l-6 6 6 6" stroke="var(--ink)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          </svg>
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 22, height: 22, borderRadius: '50%',
            background: 'var(--ink)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <NutriChevron height={12}/>
          </div>
          <div style={{
            fontFamily: lang === 'ar' ? 'var(--ff-ar)' : 'var(--ff-display)',
            fontWeight: 700, fontSize: 14, letterSpacing: '-0.005em',
            color: 'var(--ink)',
          }}>{who}</div>
        </div>
        <button onClick={() => setMessages([])} aria-label="new" style={iconBtn}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M12 5v14M5 12h14" stroke="var(--ink)" strokeWidth="2.2" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      {/* Big title when thread is empty */}
      {showHeadline && (
        <div style={{ padding: '14px 24px 0' }}>
          <div className="n-mono" style={{ color: 'var(--ink-3)', marginBottom: 10 }}>{kicker}</div>
          <h1 style={{
            margin: 0,
            fontFamily: lang === 'ar' ? 'var(--ff-ar)' : 'var(--ff-display)',
            fontWeight: 800,
            fontSize: lang === 'ar' ? 30 : 34,
            lineHeight: 0.95, letterSpacing: '-0.02em',
            color: 'var(--ink)',
          }}>
            {headlineSplit.head}<span style={{ color: 'var(--ink-3)', fontWeight: 500 }}>{headlineSplit.tail}</span>
          </h1>
        </div>
      )}

      {/* Thread */}
      <div style={{
        flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch',
        padding: '16px 18px 200px',
        display: 'flex', flexDirection: 'column', gap: 14,
      }}>
        {messages.length === 0 && (
          <AiBubble lang={lang} text={
            product
              ? (lang === 'ar' ? `مرحبًا. اسألني أي سؤال عن ${product.product_name}.` : `Hey. Ask me anything about ${product.product_name}.`)
              : (lang === 'ar' ? 'مرحبًا خالد. اسأل عن أي منتج، أو قارن بين اثنين، أو أعطني هدفك وسأقترح بدائل.' : `Morning, Khalid. Ask me about a product, compare two, or tell me your goal and I'll suggest swaps.`)
          }/>
        )}
        {messages.map((m, i) => (
          m.role === 'user'
            ? <UserBubble key={i} text={m.content} lang={lang}/>
            : <AiBubble key={i} text={m.content} lang={lang} isError={m.isError} onRetry={i === messages.length - 1 && m.isError ? () => {
                const lastUser = [...messages].reverse().find((x) => x.role === 'user')
                if (!lastUser) return
                setMessages((prev) => prev.filter((_, j) => j !== messages.length - 1).filter((_, j, arr) => !(j === arr.length - 1 && arr[j].role === 'user')))
                sendMessage(lastUser.content)
              } : undefined}/>
        ))}
        {loading && <AiBubble lang={lang} text="" loading />}
        <div ref={messagesEndRef} />
      </div>

      {/* Composer overlay — prompt chips + input */}
      <div style={{
        position: 'fixed', left: 0, right: 0, bottom: 0,
        zIndex: 30,
        padding: '28px 18px 18px',
        pointerEvents: 'none',
        background: 'linear-gradient(to top, var(--surface) 65%, rgba(255,255,255,0))',
        maxWidth: 448, margin: '0 auto',
      }}>
        <div className="hide-scrollbar" style={{
          display: 'flex', gap: 8, overflowX: 'auto',
          marginBottom: 10, pointerEvents: 'auto',
          padding: '2px 2px',
        }}>
          {prompts.map((p, i) => (
            <button key={i} onClick={() => sendMessage(p)} style={{
              flexShrink: 0,
              padding: '7px 12px',
              background: 'var(--paper)',
              borderRadius: 999,
              border: 'none',
              boxShadow: '0 0 0 0.5px rgba(0,0,0,0.06), 0 4px 10px -6px rgba(40,28,18,0.18)',
              fontFamily: lang === 'ar' ? 'var(--ff-ar)' : 'var(--ff-display)',
              fontSize: 12.5, fontWeight: 700,
              color: 'var(--ink-2)',
              display: 'inline-flex', alignItems: 'center', gap: 6,
              cursor: 'pointer',
            }}>
              <span style={{ color: 'var(--lime-deep)' }}>+</span>
              {p}
            </button>
          ))}
        </div>

        <form
          onSubmit={(e) => { e.preventDefault(); sendMessage() }}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '8px 8px 8px 14px',
            background: 'var(--paper)',
            borderRadius: 999,
            boxShadow: '0 14px 32px -14px rgba(0,0,0,0.18), 0 0 0 0.5px rgba(0,0,0,0.06)',
            pointerEvents: 'auto',
          }}
        >
          <button type="button" aria-label="voice" style={{
            width: 28, height: 28, borderRadius: '50%',
            background: 'transparent', border: 'none', cursor: 'pointer',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <rect x="9" y="3" width="6" height="12" rx="3" stroke="var(--ink-3)" strokeWidth="2"/>
              <path d="M5 11a7 7 0 0014 0M12 18v3" stroke="var(--ink-3)" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={placeholder}
            style={{
              flex: 1,
              border: 'none', outline: 'none',
              background: 'transparent',
              fontFamily: lang === 'ar' ? 'var(--ff-ar)' : 'var(--ff-display)',
              fontSize: 15, fontWeight: 500,
              color: 'var(--ink)',
            }}
          />
          <button type="submit" disabled={loading || !input.trim()} aria-label="send" style={{
            width: 38, height: 38, borderRadius: '50%',
            background: 'var(--lime)',
            border: 'none', cursor: input.trim() ? 'pointer' : 'default',
            opacity: loading || !input.trim() ? 0.5 : 1,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 10px 22px -8px rgba(189,242,114,0.55), inset 0 -2px 0 rgba(0,0,0,0.08)',
            flexShrink: 0,
          }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" style={{ transform: lang === 'ar' ? 'rotate(180deg)' : 'rotate(-90deg)' }}>
              <path d="M5 12h14M13 6l6 6-6 6" stroke="var(--ink)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </form>
      </div>
    </div>
  )
}

// ────────────────────────────────────────────────────────
function UserBubble({ text, lang }: { text: string; lang: 'en' | 'ar' }) {
  return (
    <div style={{
      alignSelf: lang === 'ar' ? 'flex-start' : 'flex-end',
      maxWidth: '78%',
      padding: '10px 14px',
      background: 'var(--ink)', color: '#fff',
      borderRadius: 18,
      borderEndStartRadius: lang === 'ar' ? 4 : 18,
      borderEndEndRadius: lang === 'ar' ? 18 : 4,
      fontFamily: lang === 'ar' ? 'var(--ff-ar)' : 'var(--ff-display)',
      fontSize: 14.5, fontWeight: 500, lineHeight: 1.35,
      whiteSpace: 'pre-wrap',
    }}>{text}</div>
  )
}

function AiBubble({ text, lang, loading, isError, onRetry }: { text: string; lang: 'en' | 'ar'; loading?: boolean; isError?: boolean; onRetry?: () => void }) {
  return (
    <div style={{
      alignSelf: lang === 'ar' ? 'flex-end' : 'flex-start',
      maxWidth: '92%',
      display: 'flex', flexDirection: 'column', gap: 8,
    }}>
      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
        <div style={{
          width: 26, height: 26, borderRadius: '50%',
          background: 'var(--ink)', flexShrink: 0,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <NutriChevron height={14}/>
        </div>
        <div style={{
          padding: '10px 14px',
          background: isError ? '#ffe4dc' : 'var(--paper)',
          borderRadius: 18,
          borderStartStartRadius: lang === 'ar' ? 18 : 4,
          borderStartEndRadius: lang === 'ar' ? 4 : 18,
          boxShadow: '0 0 0 0.5px rgba(0,0,0,0.05), 0 6px 16px -10px rgba(40,28,18,0.16)',
          fontFamily: lang === 'ar' ? 'var(--ff-ar)' : 'var(--ff-display)',
          fontSize: 14.5, fontWeight: 500, lineHeight: 1.4,
          color: isError ? '#5a1810' : 'var(--ink)',
          whiteSpace: 'pre-wrap',
        }}>
          {loading ? (
            <span style={{ display: 'inline-flex', gap: 4 }}>
              <span style={{ width: 6, height: 6, borderRadius: 999, background: 'var(--ink-3)', animation: 'nutri-pulse 1s linear infinite' }} />
              <span style={{ width: 6, height: 6, borderRadius: 999, background: 'var(--ink-3)', animation: 'nutri-pulse 1s linear infinite 0.15s' }} />
              <span style={{ width: 6, height: 6, borderRadius: 999, background: 'var(--ink-3)', animation: 'nutri-pulse 1s linear infinite 0.3s' }} />
            </span>
          ) : text}
        </div>
      </div>
      {onRetry && (
        <button onClick={onRetry} style={{
          alignSelf: lang === 'ar' ? 'flex-end' : 'flex-start',
          marginInlineStart: 36,
          padding: '6px 12px',
          background: 'var(--paper)',
          border: '1px solid rgba(0,0,0,0.1)', borderRadius: 999,
          fontFamily: lang === 'ar' ? 'var(--ff-ar)' : 'var(--ff-display)',
          fontSize: 12, fontWeight: 600, color: 'var(--ink)',
          cursor: 'pointer',
          display: 'inline-flex', alignItems: 'center', gap: 6,
        }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
            <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M21 3v5h-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          {lang === 'ar' ? 'إعادة المحاولة' : 'Retry'}
        </button>
      )}
    </div>
  )
}

// ────────────────────────────────────────────────────────
const iconBtn: React.CSSProperties = {
  width: 36, height: 36, borderRadius: '50%',
  background: 'rgba(0,0,0,0.05)', border: 'none', cursor: 'pointer',
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="nutri-app" style={{ minHeight: '100dvh', background: 'var(--cream)' }} />}>
      <ChatContent />
    </Suspense>
  )
}
