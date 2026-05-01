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

  const sendMessage = async () => {
    if (!input.trim() || loading) return
    const userMessage: ChatMessage = { role: 'user', content: input.trim() }
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
    <div className="min-h-screen flex flex-col">
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
        <button onClick={() => router.push('/result')} className="text-gray-400 text-sm flex items-center gap-1 transition-colors hover:text-gray-600">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          Back
        </button>
        <h1 className="text-sm font-semibold text-[#3A3F57] flex items-center gap-1.5">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"/></svg>
          AI Assistant
        </h1>
        <div className="w-12" />
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
        {messages.length === 0 && (
          <div className="text-center text-gray-400 text-sm mt-8">
            <p>Ask any question about this product</p>
            <div className="flex flex-wrap gap-2 justify-center mt-4">
              {['Is this good for diabetics?', 'What are the harmful ingredients?', 'Give me better alternatives'].map((q) => (
                <button key={q} onClick={() => setInput(q)} className="text-xs bg-gray-50 text-gray-500 px-3 py-2 rounded-full border border-gray-100 transition-colors hover:bg-gray-100 hover:text-gray-600">{q}</button>
              ))}
            </div>
          </div>
        )}
        {messages.map((msg, i) => (<ChatMessageComponent key={i} message={msg} />))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-600 px-4 py-3 rounded-2xl rounded-tl-sm text-sm">
              <div className="flex gap-1">
                <span className="animate-bounce">.</span>
                <span className="animate-bounce" style={{ animationDelay: '0.1s' }}>.</span>
                <span className="animate-bounce" style={{ animationDelay: '0.2s' }}>.</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="px-4 py-3 border-t border-gray-100 flex gap-2">
        <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && sendMessage()} placeholder="Ask a question..." className="flex-1 bg-gray-50 rounded-xl px-4 py-3 text-sm outline-none border border-gray-100 focus:border-[#F1B123]/40 transition-colors" />
        <button onClick={sendMessage} disabled={loading || !input.trim()} className="w-10 h-10 bg-[#F1B123] rounded-xl flex items-center justify-center text-white disabled:opacity-40 transition-all hover:bg-[#D89A0E] active:scale-95">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
        </button>
      </div>
    </div>
  )
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-gray-300 border-t-transparent rounded-full animate-spin" /></div>}>
      <ChatContent />
    </Suspense>
  )
}
