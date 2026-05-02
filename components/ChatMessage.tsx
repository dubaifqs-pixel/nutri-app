'use client'

import type { ChatMessage as ChatMessageType } from '@/lib/types'

export default function ChatMessage({ message }: { message: ChatMessageType }) {
  const isUser = message.role === 'user'
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[85%] px-4 py-3 text-sm leading-relaxed ${
          isUser
            ? 'glass-dark text-white rounded-2xl rounded-br-md'
            : 'glass text-[#1A1D2E] rounded-2xl rounded-bl-md'
        }`}
        style={
          !isUser
            ? { borderColor: 'rgba(241, 177, 35, 0.12)' }
            : undefined
        }
      >
        <div className="whitespace-pre-wrap">{message.content}</div>
      </div>
    </div>
  )
}
