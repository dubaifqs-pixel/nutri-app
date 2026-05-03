'use client'

export default function EmptyState({ message = 'No results found', size = 180 }: { message?: string; size?: number }) {
  const id = `es-${Math.random().toString(36).slice(2, 8)}`

  return (
    <div className="empty-state-wrap" style={{ width: size }}>
      <svg viewBox="0 0 180 160" fill="none" xmlns="http://www.w3.org/2000/svg" width="100%" height="auto">
        <defs>
          <linearGradient id={`${id}-glass`} x1="60" y1="20" x2="120" y2="100">
            <stop offset="0%" stopColor="#E0E7FF" />
            <stop offset="100%" stopColor="#C7D2FE" />
          </linearGradient>
          <radialGradient id={`${id}-lens`} cx="0.45" cy="0.4" r="0.55">
            <stop offset="0%" stopColor="#EEF2FF" stopOpacity="0.9" />
            <stop offset="60%" stopColor="#C7D2FE" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#A5B4FC" stopOpacity="0.2" />
          </radialGradient>
          <filter id={`${id}-shadow`} x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="3" stdDeviation="5" floodColor="#1A1D2E" floodOpacity="0.1" />
          </filter>
          <radialGradient id={`${id}-apple`} cx="0.4" cy="0.35" r="0.6">
            <stop offset="0%" stopColor="#FCA5A5" />
            <stop offset="100%" stopColor="#EF4444" />
          </radialGradient>
          <radialGradient id={`${id}-orange`} cx="0.4" cy="0.35" r="0.6">
            <stop offset="0%" stopColor="#FDE68A" />
            <stop offset="100%" stopColor="#F59E0B" />
          </radialGradient>
          <radialGradient id={`${id}-grape`} cx="0.4" cy="0.35" r="0.6">
            <stop offset="0%" stopColor="#D8B4FE" />
            <stop offset="100%" stopColor="#8B5CF6" />
          </radialGradient>
        </defs>

        {/* Scattered food items */}
        {/* Apple - floating */}
        <g className="food-float ff1" filter={`url(#${id}-shadow)`}>
          <circle cx="30" cy="45" r="10" fill={`url(#${id}-apple)`} />
          <path d="M30 35 C30 32, 32 30, 34 29" stroke="#7c6a3a" strokeWidth="1.2" fill="none" strokeLinecap="round" />
          <path d="M32 31 C35 29, 37 31, 35 33" fill="#22C55E" opacity="0.7" />
          <path d="M24 40 C24 37, 27 36, 27 40" fill="white" opacity="0.2" />
        </g>

        {/* Orange - floating */}
        <g className="food-float ff2" filter={`url(#${id}-shadow)`}>
          <circle cx="148" cy="55" r="9" fill={`url(#${id}-orange)`} />
          <circle cx="148" cy="55" r="9" fill="none" stroke="#D97706" strokeWidth="0.5" opacity="0.3" />
          <circle cx="145" cy="52" r="2" fill="white" opacity="0.15" />
        </g>

        {/* Grapes cluster - floating */}
        <g className="food-float ff3" filter={`url(#${id}-shadow)`}>
          <circle cx="42" cy="120" r="5" fill={`url(#${id}-grape)`} />
          <circle cx="50" cy="118" r="5" fill={`url(#${id}-grape)`} />
          <circle cx="46" cy="127" r="5" fill={`url(#${id}-grape)`} />
          <circle cx="54" cy="125" r="4.5" fill={`url(#${id}-grape)`} />
          <path d="M48 113 C48 110, 50 108, 52 108" stroke="#7c6a3a" strokeWidth="1" fill="none" strokeLinecap="round" />
        </g>

        {/* Bread slice - floating */}
        <g className="food-float ff4" filter={`url(#${id}-shadow)`}>
          <ellipse cx="140" cy="115" rx="10" ry="13" fill="#FDE68A" />
          <ellipse cx="140" cy="115" rx="10" ry="13" fill="none" stroke="#D97706" strokeWidth="1.5" opacity="0.4" />
          <circle cx="138" cy="112" r="1.2" fill="#D97706" opacity="0.15" />
          <circle cx="142" cy="118" r="0.8" fill="#D97706" opacity="0.12" />
        </g>

        {/* Magnifying glass - main element */}
        <g filter={`url(#${id}-shadow)`}>
          {/* Glass lens */}
          <circle cx="90" cy="65" r="32" fill={`url(#${id}-lens)`} />
          <circle cx="90" cy="65" r="32" fill="none" stroke="#A5B4FC" strokeWidth="3" />
          {/* Lens reflection */}
          <path d="M72 50 C76 44, 82 42, 86 44" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
          {/* Inner rim */}
          <circle cx="90" cy="65" r="28" fill="none" stroke="#C7D2FE" strokeWidth="1" opacity="0.5" />
          {/* Handle */}
          <line x1="114" y1="89" x2="134" y2="112" stroke="#9CA3AF" strokeWidth="6" strokeLinecap="round" />
          <line x1="114" y1="89" x2="134" y2="112" stroke="#D1D5DB" strokeWidth="3" strokeLinecap="round" />
          {/* Handle grip lines */}
          <line x1="124" y1="100" x2="126" y2="102" stroke="#9CA3AF" strokeWidth="1" opacity="0.4" />
          <line x1="128" y1="104" x2="130" y2="106" stroke="#9CA3AF" strokeWidth="1" opacity="0.4" />
        </g>

        {/* Confused/sad expression on lens */}
        <g opacity="0.35">
          {/* Eyes */}
          <circle cx="82" cy="60" r="2.5" fill="#6B7194" />
          <circle cx="98" cy="60" r="2.5" fill="#6B7194" />
          {/* Eye highlights */}
          <circle cx="81" cy="59" r="0.8" fill="white" />
          <circle cx="97" cy="59" r="0.8" fill="white" />
          {/* Sad mouth */}
          <path d="M83 74 C86 71, 94 71, 97 74" stroke="#6B7194" strokeWidth="1.8" fill="none" strokeLinecap="round" />
          {/* Eyebrows (worried) */}
          <path d="M78 55 C80 54, 83 54, 85 55" stroke="#6B7194" strokeWidth="1.2" fill="none" strokeLinecap="round" />
          <path d="M95 55 C97 54, 100 54, 102 55" stroke="#6B7194" strokeWidth="1.2" fill="none" strokeLinecap="round" />
          {/* Question mark */}
          <text x="90" y="85" textAnchor="middle" fill="#6B7194" fontSize="8" fontWeight="bold" fontFamily="Inter, sans-serif">?</text>
        </g>
      </svg>

      <p className="empty-state-text">{message}</p>

      <style>{`
        .empty-state-wrap {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
        }
        .empty-state-text {
          font-size: 13px;
          color: #6B7194;
          text-align: center;
          font-family: var(--font-inter), sans-serif;
        }
        .food-float {
          will-change: transform;
        }
        .ff1 { animation: food-bob-1 4s ease-in-out infinite; }
        .ff2 { animation: food-bob-2 5s ease-in-out infinite; }
        .ff3 { animation: food-bob-3 4.5s ease-in-out infinite; }
        .ff4 { animation: food-bob-4 3.5s ease-in-out infinite; }
        @keyframes food-bob-1 {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(3px, -6px); }
        }
        @keyframes food-bob-2 {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(-4px, -5px); }
        }
        @keyframes food-bob-3 {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(2px, -4px); }
        }
        @keyframes food-bob-4 {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(-3px, -7px); }
        }
      `}</style>
    </div>
  )
}
