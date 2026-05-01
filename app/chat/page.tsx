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
          ? rec.alternatives.map((a: any) => `• ${a.product_name} (${a.grade})`).join('\n')
          : 'لم أجد بدائل في قاعدة البيانات'
        setMessages([
          { role: 'user', content: 'أعطني بدائل أفضل' },
          { role: 'assistant', content: `${rec.summary || 'إليك بعض البدائل:'}\n\n${altText}` },
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
      setMessages((prev) => [...prev, { role: 'assistant', content: data.response }])
    } catch {
      setMessages((prev) => [...prev, { role: 'assistant', content: 'حدث خطأ — حاول مرة أخرى' }])
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="px-4 py-3 border-b flex items-center justify-between">
        <button onClick={() => router.push('/result')} className="text-gray-500 text-sm">← رجوع</button>
        <h1 className="text-sm font-semibold" dir="rtl">💬 المساعد الذكي</h1>
        <div className="w-12" />
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
        {messages.length === 0 && (
          <div className="text-center text-gray-400 text-sm mt-8" dir="rtl">
            <p>اسأل أي سؤال عن المنتج</p>
            <div className="flex flex-wrap gap-2 justify-center mt-4">
              {['هل مناسب لمرضى السكري؟', 'ما هي المكونات الضارة؟', 'أعطني بدائل أفضل'].map((q) => (
                <button key={q} onClick={() => setInput(q)} className="text-xs bg-gray-100 text-gray-600 px-3 py-2 rounded-full">{q}</button>
              ))}
            </div>
          </div>
        )}
        {messages.map((msg, i) => (<ChatMessageComponent key={i} message={msg} />))}
        {loading && (
          <div className="flex justify-end" dir="rtl">
            <div className="bg-gray-800 text-white px-4 py-3 rounded-2xl rounded-tr-sm text-sm">
              <div className="flex gap-1">
                <span className="animate-bounce">·</span>
                <span className="animate-bounce" style={{ animationDelay: '0.1s' }}>·</span>
                <span className="animate-bounce" style={{ animationDelay: '0.2s' }}>·</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="px-4 py-3 border-t flex gap-2">
        <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && sendMessage()} placeholder="اكتب سؤالك..." className="flex-1 bg-gray-100 rounded-xl px-4 py-3 text-sm outline-none" dir="rtl" />
        <button onClick={sendMessage} disabled={loading || !input.trim()} className="w-10 h-10 bg-yellow-500 rounded-xl flex items-center justify-center text-white disabled:opacity-50">↑</button>
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
