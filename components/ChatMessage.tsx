'use client'

import type { ChatMessage as ChatMessageType } from '@/lib/types'

export default function ChatMessage({ message }: { message: ChatMessageType }) {
  const isUser = message.role === 'user'
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
        isUser ? 'bg-[#3A3F57] text-white rounded-br-sm' : 'bg-gray-100 text-gray-800 rounded-bl-sm'
      }`}>
        <div className="whitespace-pre-wrap">{message.content}</div>
      </div>
    </div>
  )
}
