'use client'

import type { ChatMessage as ChatMessageType } from '@/lib/types'

export default function ChatMessage({ message }: { message: ChatMessageType }) {
  const isUser = message.role === 'user'
  return (
    <div className={`flex ${isUser ? 'justify-start' : 'justify-end'}`} dir="rtl">
      <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
        isUser ? 'bg-gray-100 text-gray-800 rounded-tl-sm' : 'bg-gray-800 text-white rounded-tr-sm'
      }`}>
        <div className="whitespace-pre-wrap">{message.content}</div>
      </div>
    </div>
  )
}
