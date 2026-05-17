'use client'

import { useEffect, useState, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import ChatMessageComponent from '@/components/ChatMessage'
import type { ChatMessage, ProductData, GradeResult } from '@/lib/types'
import { useT } from '@/lib/i18n'

function ChatContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const t = useT()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [product, setProduct] = useState<ProductData | null>(null)
  const [gradeResult, setGradeResult] = useState<GradeResult | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const productData = sessionStorage.getItem('dfqs_product')
    const gradeData = sessionStorage.getItem('dfqs_grade')
    // If product context is missing, run in general AI mode (no bounce)
    if (!productData || !gradeData) return
    const p = JSON.parse(productData)
    const g = JSON.parse(gradeData)
    setProduct(p)
    setGradeResult(g)
    if (searchParams.get('tab') === 'recommend') {
      const recData = sessionStorage.getItem('dfqs_recommendations')
      if (recData) {
        const rec = JSON.parse(recData)
        const altText = rec.alternatives?.length > 0
          ? rec.alternatives.map((a: any) => `- ${a.product_name} (${a.grade})`).join('\n')
          : 'No alternatives found in database'
        setMessages([
          { role: 'user', content: 'Give me better alternatives' },
          { role: 'assistant', content: `${rec.summary || 'Here are some alternatives:'}\n\n${altText}` },
        ])
      }
    }
  }, [router, searchParams])

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const sendMessage = async (directMessage?: string) => {
    const text = directMessage || input.trim()
    if (!text || loading) return
    const userMessage: ChatMessage = { role: 'user', content: text }
    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setLoading(true)
    try {
      const res = await fetch('/api/chat', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage.content,
          product_context: product && gradeResult ? {
            product_name: product.product_name, grade: gradeResult.grade,
            score: gradeResult.score, nutrition: product.nutrition,
          } : undefined,
        }),
      })
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        setMessages((prev) => [...prev, { role: 'assistant', content: errData.error || 'Something went wrong. Please try again.' }])
        return
      }
      const data = await res.json()
      if (data.error) {
        setMessages((prev) => [...prev, { role: 'assistant', content: data.error }])
      } else {
        setMessages((prev) => [...prev, { role: 'assistant', content: data.response }])
      }
    } catch (err) {
      setMessages((prev) => [...prev, { role: 'assistant', content: `Error: ${err instanceof Error ? err.message : 'Please try again'}` }])
    } finally { setLoading(false) }
  }

  return (
    <div className="h-dvh flex flex-col" style={{ background: '#F5F4F0' }}>
      {/* Header */}
      <div className="px-4 py-3 flex items-center justify-between z-10" style={{ background: '#F5F4F0', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
        <button onClick={() => router.push(product ? '/result' : '/')} className="text-sm flex items-center gap-1 transition-colors min-w-[44px] min-h-[44px] -ml-2 pl-2 rounded-xl" style={{ color: '#7A7A7A' }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          {t('chat.back')}
        </button>
        <h1 className="text-[14px] font-extrabold flex items-center gap-1.5" style={{ color: '#1A1A1A', letterSpacing: '-0.01em' }}>
          <span className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #B6F074, #A8E866)' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#1A1A1A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"/></svg>
          </span>
          {t('chat.title')}
        </h1>
        <button
          onClick={() => setMessages([])}
          className="w-9 h-9 rounded-full flex items-center justify-center transition-colors"
          style={{ color: '#7A7A7A' }}
          aria-label="New chat"
          disabled={messages.length === 0}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
        {messages.length === 0 && (
          <div className="text-center text-sm mt-8 animate-fade-in" style={{ color: '#7A7A7A' }}>
            <p>{product ? t('chat.empty') : t('chat.empty.general')}</p>
            <div className="flex flex-wrap gap-2 justify-center mt-4">
              {(product
                ? [t('chat.suggest1'), t('chat.suggest2'), t('chat.suggest3')]
                : [t('chat.suggest.general1'), t('chat.suggest.general2'), t('chat.suggest.general3')]
              ).map((q) => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  className="text-xs bg-white px-3.5 py-2.5 rounded-full transition-all min-h-[44px]"
                  style={{ color: '#1A1A1A', border: '1px solid rgba(0,0,0,0.06)' }}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((msg, i) => (<ChatMessageComponent key={i} message={msg} />))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white px-5 py-3 rounded-2xl rounded-bl-md text-sm" style={{ color: '#7A7A7A', border: '1px solid rgba(0,0,0,0.06)' }}>
              <div className="flex gap-1.5">
                <span className="w-2 h-2 rounded-full animate-bounce" style={{ background: '#ACACAC' }} />
                <span className="w-2 h-2 rounded-full animate-bounce" style={{ background: '#ACACAC', animationDelay: '0.15s' }} />
                <span className="w-2 h-2 rounded-full animate-bounce" style={{ background: '#ACACAC', animationDelay: '0.3s' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick-action chips above input (only when in product context) */}
      {product && messages.length > 0 && !loading && (
        <div className="flex gap-1.5 px-4 pt-2 pb-1 overflow-x-auto no-scrollbar" style={{ background: '#F5F4F0' }}>
          {['Ingredients?', 'Healthier swap', 'Daily limit?', 'Allergens'].map((q) => (
            <button
              key={q}
              onClick={() => sendMessage(q)}
              className="shrink-0 px-3 py-1.5 rounded-full text-[11px] font-bold transition-colors"
              style={{ background: '#FFFFFF', color: '#1A1A1A', border: '1px solid rgba(0,0,0,0.06)' }}
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Input Bar */}
      <div className="px-4 py-3 flex gap-2 items-center" style={{ background: '#F5F4F0', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
        <button
          onClick={() => router.push('/scan?mode=label&return=chat')}
          className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 transition-colors"
          style={{ background: '#FFFFFF', color: '#1A1A1A', border: '1px solid rgba(0,0,0,0.06)' }}
          aria-label="Scan to chat"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
        </button>
        <div className="flex-1 relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') sendMessage() }}
            placeholder={t('chat.placeholder')}
            className="w-full bg-white rounded-2xl pl-4 pr-12 py-3 text-sm outline-none focus:ring-2 transition-all"
            style={{ color: '#1A1A1A', border: '1px solid rgba(0,0,0,0.06)' }}
          />
          <button
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center transition-colors"
            style={{ color: '#ACACAC' }}
            aria-label="Voice input"
            type="button"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>
          </button>
        </div>
        <button
          onClick={() => sendMessage()}
          disabled={loading || !input.trim()}
          className="w-11 h-11 rounded-2xl btn-accent flex items-center justify-center disabled:opacity-40 shrink-0"
          aria-label="Send"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
        </button>
      </div>
    </div>
  )
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center" style={{ background: '#F5F4F0' }}><div className="w-10 h-10 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#1A1A1A', borderTopColor: 'transparent' }} /></div>}>
      <ChatContent />
    </Suspense>
  )
}
