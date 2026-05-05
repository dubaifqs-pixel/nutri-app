'use client'

import { useEffect, useState, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import ChatMessageComponent from '@/components/ChatMessage'
import type { ChatMessage, ProductData, GradeResult } from '@/lib/types'

function ChatContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [product, setProduct] = useState<ProductData | null>(null)
  const [gradeResult, setGradeResult] = useState<GradeResult | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const productData = sessionStorage.getItem('dfqs_product')
    const gradeData = sessionStorage.getItem('dfqs_grade')
    if (!productData || !gradeData) { router.push('/'); return }
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
    <div className="h-dvh flex flex-col bg-[#F2F0ED]">
      {/* Header */}
      <div className="bg-[#F2F0ED] px-4 py-3 flex items-center justify-between z-10" style={{ borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
        <button onClick={() => router.push('/result')} className="text-[#8A8A8A] text-sm flex items-center gap-1 transition-colors hover:text-[#1A1A1A] min-w-[44px] min-h-[44px] -ml-2 pl-2 rounded-xl">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          Back
        </button>
        <h1 className="text-sm font-semibold text-[#1A1A1A] flex items-center gap-1.5">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1A1A1A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"/></svg>
          AI Assistant
        </h1>
        <div className="w-12" />
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
        {messages.length === 0 && (
          <div className="text-center text-[#8A8A8A] text-sm mt-8 animate-fade-in">
            <p>Ask any question about this product</p>
            <div className="flex flex-wrap gap-2 justify-center mt-4">
              {['Is this good for diabetics?', 'What are the harmful ingredients?', 'Give me better alternatives'].map((q) => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  className="text-xs bg-white text-[#1A1A1A] px-3.5 py-2.5 rounded-full transition-all hover:shadow-sm min-h-[44px]"
                  style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
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
            <div className="bg-white text-[#8A8A8A] px-5 py-3 rounded-2xl rounded-bl-md text-sm" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <div className="flex gap-1.5">
                <span className="w-2 h-2 bg-[#8A8A8A] rounded-full animate-bounce" />
                <span className="w-2 h-2 bg-[#8A8A8A] rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
                <span className="w-2 h-2 bg-[#8A8A8A] rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div className="bg-[#F2F0ED] px-4 py-3 flex gap-2" style={{ borderTop: '1px solid rgba(0,0,0,0.04)' }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') sendMessage() }}
          placeholder="Ask a question..."
          className="flex-1 bg-white rounded-2xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#4CAF50]/30 transition-all"
          style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
        />
        <button
          onClick={() => sendMessage()}
          disabled={loading || !input.trim()}
          className="w-11 h-11 rounded-2xl btn-green flex items-center justify-center disabled:opacity-40 shrink-0"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
        </button>
      </div>
    </div>
  )
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#F2F0ED]"><div className="w-10 h-10 border-2 border-[#1A1A1A] border-t-transparent rounded-full animate-spin" /></div>}>
      <ChatContent />
    </Suspense>
  )
}
