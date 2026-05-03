'use client'

import { type Grade, GRADE_COLORS } from '@/lib/types'

const GRADE_FILL_STARTS: Record<Grade, string> = {
  A: '#34D399',
  B: '#A3E635',
  C: '#FBBF24',
  D: '#FB923C',
  E: '#F87171',
}

const GRADE_FILL_ENDS: Record<Grade, string> = {
  A: '#059669',
  B: '#65A30D',
  C: '#D97706',
  D: '#EA580C',
  E: '#DC2626',
}

export default function GradeShield({ grade, size = 160 }: { grade: Grade; size?: number }) {
  const id = `gs-${Math.random().toString(36).slice(2, 8)}`
  const isGood = grade === 'A' || grade === 'B'
  const isBad = grade === 'D' || grade === 'E'

  return (
    <div className="grade-shield-wrap" style={{ width: size, height: size * 1.15 }}>
      <svg
        viewBox="0 0 160 184"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        width="100%"
        height="100%"
        className="grade-shield-svg"
      >
        <defs>
          <linearGradient id={`${id}-fill`} x1="40" y1="10" x2="120" y2="170">
            <stop offset="0%" stopColor={GRADE_FILL_STARTS[grade]} />
            <stop offset="100%" stopColor={GRADE_FILL_ENDS[grade]} />
          </linearGradient>
          <linearGradient id={`${id}-inner`} x1="80" y1="20" x2="80" y2="160">
            <stop offset="0%" stopColor="white" stopOpacity="0.2" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </linearGradient>
          <linearGradient id={`${id}-rim`} x1="80" y1="5" x2="80" y2="175">
            <stop offset="0%" stopColor="white" stopOpacity="0.4" />
            <stop offset="50%" stopColor="white" stopOpacity="0.1" />
            <stop offset="100%" stopColor="white" stopOpacity="0.2" />
          </linearGradient>
          <filter id={`${id}-shadow`} x="-30%" y="-20%" width="160%" height="160%">
            <feDropShadow dx="0" dy="6" stdDeviation="12" floodColor={GRADE_COLORS[grade]} floodOpacity="0.35" />
          </filter>
          <filter id={`${id}-inner-shadow`} x="-10%" y="-10%" width="120%" height="120%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="4" result="blur" />
            <feOffset dx="0" dy="3" result="offset" />
            <feComposite in="SourceGraphic" in2="offset" operator="over" />
          </filter>
          <clipPath id={`${id}-shield-clip`}>
            <path d="M80 8 L145 35 C148 36 150 39 150 42 L150 95 C150 125 125 155 80 175 C35 155 10 125 10 95 L10 42 C10 39 12 36 15 35 Z" />
          </clipPath>
        </defs>

        {/* Shield outer glow */}
        <g filter={`url(#${id}-shadow)`}>
          {/* Shield body */}
          <path
            d="M80 8 L145 35 C148 36 150 39 150 42 L150 95 C150 125 125 155 80 175 C35 155 10 125 10 95 L10 42 C10 39 12 36 15 35 Z"
            fill={`url(#${id}-fill)`}
            className="shield-body"
          />
        </g>

        {/* Inner highlight for depth */}
        <path
          d="M80 16 L140 40 C142 41 143 43 143 45 L143 93 C143 120 120 148 80 166 C40 148 17 120 17 93 L17 45 C17 43 18 41 20 40 Z"
          fill={`url(#${id}-inner)`}
          className="shield-highlight"
        />

        {/* Rim/border line */}
        <path
          d="M80 8 L145 35 C148 36 150 39 150 42 L150 95 C150 125 125 155 80 175 C35 155 10 125 10 95 L10 42 C10 39 12 36 15 35 Z"
          fill="none"
          stroke={`url(#${id}-rim)`}
          strokeWidth="1.5"
        />

        {/* Crack effects for D/E grades */}
        {isBad && (
          <g opacity="0.3" stroke="white" strokeWidth="1.2" strokeLinecap="round">
            <path d="M45 55 L55 70 L48 78 L56 90" />
            <path d="M120 60 L112 72 L118 82" />
            <path d="M38 100 L45 108 L40 115" />
          </g>
        )}

        {/* Stars for Grade A */}
        {grade === 'A' && (
          <g className="shield-stars" opacity="0.7">
            <path d="M35 28 l2 4 4.5 0.7 -3.2 3.2 0.8 4.5 -4-2.1 -4 2.1 0.8-4.5 -3.2-3.2 4.5-0.7z" fill="white" opacity="0.5" className="star s1" />
            <path d="M125 28 l2 4 4.5 0.7 -3.2 3.2 0.8 4.5 -4-2.1 -4 2.1 0.8-4.5 -3.2-3.2 4.5-0.7z" fill="white" opacity="0.5" className="star s2" />
            <path d="M80 155 l1.5 3 3.4 0.5 -2.4 2.4 0.6 3.4 -3-1.6 -3 1.6 0.6-3.4 -2.4-2.4 3.4-0.5z" fill="white" opacity="0.4" className="star s3" />
          </g>
        )}

        {/* Laurel wreath for A/B grades */}
        {isGood && (
          <g opacity="0.25" className="laurel-wreath">
            {/* Left laurel */}
            <path d="M25 70 C20 60, 15 50, 18 40" stroke="white" strokeWidth="1.2" fill="none" />
            <ellipse cx="18" cy="48" rx="5" ry="3" transform="rotate(-30 18 48)" fill="white" opacity="0.4" />
            <ellipse cx="20" cy="56" rx="5" ry="3" transform="rotate(-20 20 56)" fill="white" opacity="0.4" />
            <ellipse cx="22" cy="64" rx="5" ry="3" transform="rotate(-10 22 64)" fill="white" opacity="0.4" />
            <path d="M25 100 C18 110, 15 125, 22 138" stroke="white" strokeWidth="1.2" fill="none" />
            <ellipse cx="20" cy="112" rx="5" ry="3" transform="rotate(15 20 112)" fill="white" opacity="0.4" />
            <ellipse cx="19" cy="122" rx="5" ry="3" transform="rotate(25 19 122)" fill="white" opacity="0.4" />
            <ellipse cx="21" cy="132" rx="5" ry="3" transform="rotate(35 21 132)" fill="white" opacity="0.4" />
            {/* Right laurel */}
            <path d="M135 70 C140 60, 145 50, 142 40" stroke="white" strokeWidth="1.2" fill="none" />
            <ellipse cx="142" cy="48" rx="5" ry="3" transform="rotate(30 142 48)" fill="white" opacity="0.4" />
            <ellipse cx="140" cy="56" rx="5" ry="3" transform="rotate(20 140 56)" fill="white" opacity="0.4" />
            <ellipse cx="138" cy="64" rx="5" ry="3" transform="rotate(10 138 64)" fill="white" opacity="0.4" />
            <path d="M135 100 C142 110, 145 125, 138 138" stroke="white" strokeWidth="1.2" fill="none" />
            <ellipse cx="140" cy="112" rx="5" ry="3" transform="rotate(-15 140 112)" fill="white" opacity="0.4" />
            <ellipse cx="141" cy="122" rx="5" ry="3" transform="rotate(-25 141 122)" fill="white" opacity="0.4" />
            <ellipse cx="139" cy="132" rx="5" ry="3" transform="rotate(-35 139 132)" fill="white" opacity="0.4" />
          </g>
        )}

        {/* Grade letter */}
        <text
          x="80"
          y="108"
          textAnchor="middle"
          fill="white"
          fontSize="64"
          fontWeight="bold"
          fontFamily="Inter, sans-serif"
          style={{ textShadow: '0 3px 8px rgba(0,0,0,0.3)' }}
        >
          {grade}
        </text>
      </svg>

      <style>{`
        .grade-shield-wrap {
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .grade-shield-svg {
          overflow: visible;
        }
        .shield-body {
          animation: shield-assemble 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) both;
        }
        @keyframes shield-assemble {
          0% { transform: scale(0) rotate(-10deg); opacity: 0; }
          60% { transform: scale(1.05) rotate(2deg); opacity: 1; }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        .shield-highlight {
          animation: highlight-fade 0.8s ease-out 0.3s both;
        }
        @keyframes highlight-fade {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        .star {
          will-change: transform;
        }
        .s1 { animation: star-twinkle 3s ease-in-out infinite; }
        .s2 { animation: star-twinkle 3s ease-in-out 1s infinite; }
        .s3 { animation: star-twinkle 3s ease-in-out 2s infinite; }
        @keyframes star-twinkle {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.2); }
        }
        .laurel-wreath {
          animation: laurel-fade 1s ease-out 0.5s both;
        }
        @keyframes laurel-fade {
          0% { opacity: 0; transform: scale(0.9); }
          100% { opacity: 0.25; transform: scale(1); }
        }
      `}</style>
    </div>
  )
}
