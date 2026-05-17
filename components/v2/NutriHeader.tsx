'use client'

import { NutriLogo } from './NutriLogo'
import LangToggle from '@/components/LangToggle'

export function NutriHeader() {
  return (
    <header style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '12px 24px 0',
      gap: 12,
    }}>
      <NutriLogo height={16} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <LangToggle />
      </div>
    </header>
  )
}
