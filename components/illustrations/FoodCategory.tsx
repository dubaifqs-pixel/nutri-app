'use client'

type CategoryType = 'dairy' | 'beverages' | 'snacks' | 'cereals' | 'bread' | 'meat' | 'fruits' | 'frozen'

interface FoodCategoryProps {
  category: CategoryType
  size?: number
}

function DairyIllustration({ id }: { id: string }) {
  return (
    <g>
      <defs>
        <linearGradient id={`${id}-milk`} x1="20" y1="5" x2="35" y2="55">
          <stop offset="0%" stopColor="#f0f4ff" />
          <stop offset="100%" stopColor="#dbeafe" />
        </linearGradient>
        <linearGradient id={`${id}-cheese`} x1="35" y1="30" x2="55" y2="55">
          <stop offset="0%" stopColor="#FDE68A" />
          <stop offset="100%" stopColor="#F59E0B" />
        </linearGradient>
      </defs>
      {/* Milk carton */}
      <g filter="url(#cat-shadow)">
        <path d="M14 18 L14 52 C14 53.5 15 54.5 16 54.5 L34 54.5 C35 54.5 36 53.5 36 52 L36 18 Z" fill={`url(#${id}-milk)`} />
        <path d="M14 18 L25 8 L36 18 Z" fill="#93C5FD" opacity="0.5" />
        <path d="M14 18 L36 18" stroke="#93C5FD" strokeWidth="0.8" opacity="0.6" />
        <rect x="18" y="26" width="14" height="3" rx="1" fill="#3B82F6" opacity="0.3" />
        <rect x="20" y="32" width="10" height="1.5" rx="0.5" fill="#3B82F6" opacity="0.2" />
        <rect x="19" y="36" width="12" height="1.5" rx="0.5" fill="#3B82F6" opacity="0.15" />
        {/* Milk highlight */}
        <rect x="15" y="18" width="3" height="36" rx="1" fill="white" opacity="0.3" />
      </g>
      {/* Cheese wedge */}
      <g filter="url(#cat-shadow)" transform="translate(32, 30)">
        <path d="M5 24 L22 24 L22 10 Z" fill={`url(#${id}-cheese)`} />
        <path d="M5 24 L22 24 L22 10 Z" fill="white" opacity="0.1" />
        {/* Cheese side face for 3D */}
        <path d="M22 10 L28 7 L28 21 L22 24 Z" fill="#D97706" opacity="0.7" />
        {/* Cheese holes */}
        <circle cx="14" cy="19" r="2" fill="#D97706" opacity="0.4" />
        <circle cx="18" cy="22" r="1.2" fill="#D97706" opacity="0.3" />
        <circle cx="10" cy="22" r="1.5" fill="#D97706" opacity="0.35" />
      </g>
    </g>
  )
}

function BeveragesIllustration({ id }: { id: string }) {
  return (
    <g>
      <defs>
        <linearGradient id={`${id}-glass`} x1="20" y1="10" x2="45" y2="55">
          <stop offset="0%" stopColor="white" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#EDE9FE" stopOpacity="0.7" />
        </linearGradient>
        <linearGradient id={`${id}-liquid`} x1="25" y1="22" x2="25" y2="50">
          <stop offset="0%" stopColor="#C084FC" />
          <stop offset="100%" stopColor="#7C3AED" />
        </linearGradient>
      </defs>
      <g filter="url(#cat-shadow)">
        {/* Glass body */}
        <path d="M18 12 L16 52 C16 53.5 17 55 19 55 L41 55 C43 55 44 53.5 44 52 L42 12 Z" fill={`url(#${id}-glass)`} stroke="#C4B5FD" strokeWidth="0.8" />
        {/* Liquid fill */}
        <path d="M17.5 24 L16.5 52 C16.5 53 17.5 54 19 54 L41 54 C42.5 54 43.5 53 43.5 52 L42.5 24 Z" fill={`url(#${id}-liquid)`} opacity="0.6" />
        {/* Liquid surface wave */}
        <path d="M17.5 24 C22 22, 28 26, 33 24 C38 22, 40 23, 42.5 24" fill="#A78BFA" opacity="0.3" />
        {/* Glass rim highlight */}
        <path d="M18 12 L42 12" stroke="white" strokeWidth="1.5" opacity="0.6" />
        {/* Glass reflection */}
        <rect x="19" y="14" width="2" height="35" rx="1" fill="white" opacity="0.3" />
        {/* Bubbles */}
        <circle cx="28" cy="38" r="1.5" fill="white" opacity="0.4" />
        <circle cx="32" cy="44" r="1" fill="white" opacity="0.3" />
        <circle cx="25" cy="48" r="1.2" fill="white" opacity="0.35" />
      </g>
      {/* Straw */}
      <rect x="34" y="4" width="2.5" height="40" rx="1" fill="#F472B6" opacity="0.7" transform="rotate(8, 35, 24)" />
    </g>
  )
}

function SnacksIllustration({ id }: { id: string }) {
  return (
    <g>
      <defs>
        <linearGradient id={`${id}-bag`} x1="15" y1="10" x2="48" y2="55">
          <stop offset="0%" stopColor="#FCD34D" />
          <stop offset="100%" stopColor="#F59E0B" />
        </linearGradient>
      </defs>
      <g filter="url(#cat-shadow)">
        {/* Bag body */}
        <path d="M18 20 C16 20, 14 22, 13 26 L11 50 C11 53, 13 55, 16 55 L44 55 C47 55 49 53 49 50 L47 26 C46 22, 44 20, 42 20 Z" fill={`url(#${id}-bag)`} />
        {/* Bag top crimp */}
        <path d="M18 20 C22 14, 26 12, 30 12 C34 12, 38 14, 42 20" fill="#D97706" opacity="0.4" />
        <path d="M22 16 L26 11 L30 10 L34 11 L38 16" stroke="#92400E" strokeWidth="0.8" fill="none" opacity="0.3" />
        {/* Bag highlight */}
        <path d="M18 22 C16 25, 15 30, 14 40 L16 40 C17 30, 18 25, 20 22 Z" fill="white" opacity="0.25" />
        {/* Label area */}
        <rect x="20" y="28" width="20" height="8" rx="2" fill="white" opacity="0.3" />
        <rect x="23" y="30" width="14" height="1.5" rx="0.5" fill="#92400E" opacity="0.3" />
        <rect x="25" y="33" width="10" height="1" rx="0.5" fill="#92400E" opacity="0.2" />
        {/* Bag creases */}
        <path d="M25 42 C28 40, 32 44, 35 42" stroke="#D97706" strokeWidth="0.5" fill="none" opacity="0.3" />
        <path d="M20 48 C24 46, 32 50, 40 48" stroke="#D97706" strokeWidth="0.5" fill="none" opacity="0.25" />
      </g>
      {/* Chip peeking out */}
      <ellipse cx="30" cy="16" rx="6" ry="3" fill="#FCD34D" opacity="0.6" transform="rotate(-15, 30, 16)" />
    </g>
  )
}

function CerealsIllustration({ id }: { id: string }) {
  return (
    <g>
      <defs>
        <linearGradient id={`${id}-bowl`} x1="10" y1="25" x2="55" y2="55">
          <stop offset="0%" stopColor="#D1FAE5" />
          <stop offset="100%" stopColor="#6EE7B7" />
        </linearGradient>
        <linearGradient id={`${id}-cereal`} x1="20" y1="25" x2="20" y2="40">
          <stop offset="0%" stopColor="#FDE68A" />
          <stop offset="100%" stopColor="#F59E0B" />
        </linearGradient>
      </defs>
      <g filter="url(#cat-shadow)">
        {/* Bowl */}
        <path d="M8 30 C8 48, 20 56, 30 56 C40 56, 52 48, 52 30 Z" fill={`url(#${id}-bowl)`} />
        {/* Bowl rim */}
        <ellipse cx="30" cy="30" rx="22" ry="5" fill="#A7F3D0" />
        <ellipse cx="30" cy="30" rx="22" ry="5" fill="none" stroke="#6EE7B7" strokeWidth="1" />
        {/* Bowl inner shadow */}
        <ellipse cx="30" cy="32" rx="18" ry="3" fill="#059669" opacity="0.1" />
        {/* Cereal pieces */}
        <circle cx="20" cy="28" r="3" fill={`url(#${id}-cereal)`} />
        <circle cx="27" cy="26" r="3.5" fill={`url(#${id}-cereal)`} />
        <circle cx="34" cy="27" r="3" fill={`url(#${id}-cereal)`} />
        <circle cx="40" cy="29" r="2.8" fill={`url(#${id}-cereal)`} />
        <circle cx="23" cy="30" r="2.5" fill="#FCD34D" opacity="0.8" />
        <circle cx="37" cy="31" r="2.5" fill="#FCD34D" opacity="0.7" />
        {/* Bowl highlight */}
        <path d="M12 35 C12 30, 14 28, 14 35 C14 42, 12 42, 12 35 Z" fill="white" opacity="0.3" />
      </g>
      {/* Spoon */}
      <g transform="rotate(-30, 50, 25)">
        <rect x="46" y="10" width="2" height="28" rx="1" fill="#D1D5DB" />
        <ellipse cx="47" cy="10" rx="4" ry="5" fill="#E5E7EB" />
        <ellipse cx="47" cy="10" rx="3" ry="4" fill="#F3F4F6" opacity="0.5" />
      </g>
    </g>
  )
}

function BreadIllustration({ id }: { id: string }) {
  return (
    <g>
      <defs>
        <linearGradient id={`${id}-bread`} x1="10" y1="15" x2="50" y2="55">
          <stop offset="0%" stopColor="#FDE68A" />
          <stop offset="50%" stopColor="#D97706" />
          <stop offset="100%" stopColor="#B45309" />
        </linearGradient>
        <linearGradient id={`${id}-crumb`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FEF3C7" />
          <stop offset="100%" stopColor="#FDE68A" />
        </linearGradient>
      </defs>
      <g filter="url(#cat-shadow)">
        {/* Loaf body */}
        <path d="M10 35 C10 20, 18 14, 30 14 C42 14, 50 20, 50 35 L50 50 C50 53, 48 55, 45 55 L15 55 C12 55, 10 53, 10 50 Z" fill={`url(#${id}-bread)`} />
        {/* Top crust highlight */}
        <path d="M14 32 C14 22, 20 16, 30 16 C40 16, 46 22, 46 32" fill="#FBBF24" opacity="0.4" />
        {/* Scoring lines on top */}
        <path d="M20 22 C24 18, 28 18, 32 22" stroke="#92400E" strokeWidth="0.8" fill="none" opacity="0.3" />
        <path d="M26 20 C30 16, 34 16, 38 20" stroke="#92400E" strokeWidth="0.8" fill="none" opacity="0.25" />
      </g>
      {/* Slice in front */}
      <g filter="url(#cat-shadow)" transform="translate(30, 8)">
        <ellipse cx="15" cy="27" rx="12" ry="16" fill={`url(#${id}-crumb)`} />
        <ellipse cx="15" cy="27" rx="12" ry="16" fill="none" stroke="#D97706" strokeWidth="1.2" />
        {/* Crust border */}
        <ellipse cx="15" cy="27" rx="12" ry="16" fill="none" stroke="#B45309" strokeWidth="2.5" opacity="0.3" />
        {/* Air holes */}
        <circle cx="12" cy="24" r="1.5" fill="#D97706" opacity="0.2" />
        <circle cx="18" cy="30" r="1" fill="#D97706" opacity="0.15" />
        <circle cx="14" cy="32" r="1.2" fill="#D97706" opacity="0.18" />
        <circle cx="17" cy="22" r="0.8" fill="#D97706" opacity="0.12" />
      </g>
    </g>
  )
}

function MeatIllustration({ id }: { id: string }) {
  return (
    <g>
      <defs>
        <radialGradient id={`${id}-meat`} cx="0.4" cy="0.3" r="0.7">
          <stop offset="0%" stopColor="#FECACA" />
          <stop offset="40%" stopColor="#F87171" />
          <stop offset="100%" stopColor="#B91C1C" />
        </radialGradient>
        <linearGradient id={`${id}-bone`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FEF3C7" />
          <stop offset="100%" stopColor="#D1D5DB" />
        </linearGradient>
      </defs>
      <g filter="url(#cat-shadow)">
        {/* Drumstick body */}
        <path d="M20 22 C14 26, 10 34, 12 42 C14 50, 22 54, 30 52 C38 50, 44 42, 42 34 C40 28, 34 22, 28 20 Z" fill={`url(#${id}-meat)`} />
        {/* Meat highlight */}
        <path d="M18 28 C16 32, 16 36, 18 38 C20 34, 20 30, 18 28 Z" fill="white" opacity="0.2" />
        {/* Crispy skin lines */}
        <path d="M22 30 C26 28, 30 30, 32 32" stroke="#991B1B" strokeWidth="0.6" fill="none" opacity="0.3" />
        <path d="M20 36 C24 34, 28 36, 30 38" stroke="#991B1B" strokeWidth="0.5" fill="none" opacity="0.25" />
      </g>
      {/* Bone */}
      <g filter="url(#cat-shadow)">
        <path d="M36 26 L48 10" stroke={`url(#${id}-bone)`} strokeWidth="4" strokeLinecap="round" />
        {/* Bone knob */}
        <circle cx="49" cy="9" r="4" fill="#FEF3C7" />
        <circle cx="49" cy="9" r="2.5" fill="#F5F5F4" opacity="0.5" />
        {/* Bone knob bottom */}
        <circle cx="34" cy="28" r="3" fill="#FECACA" opacity="0.3" />
      </g>
    </g>
  )
}

function FruitsIllustration({ id }: { id: string }) {
  return (
    <g>
      <defs>
        <radialGradient id={`${id}-apple`} cx="0.35" cy="0.3" r="0.65">
          <stop offset="0%" stopColor="#86EFAC" />
          <stop offset="60%" stopColor="#22C55E" />
          <stop offset="100%" stopColor="#15803D" />
        </radialGradient>
        <linearGradient id={`${id}-banana`} x1="30" y1="30" x2="55" y2="55">
          <stop offset="0%" stopColor="#FDE68A" />
          <stop offset="100%" stopColor="#F59E0B" />
        </linearGradient>
      </defs>
      {/* Apple */}
      <g filter="url(#cat-shadow)">
        <path d="M10 30 C10 18, 16 12, 22 12 C28 12, 34 18, 34 30 C34 44, 28 52, 22 52 C16 52, 10 44, 10 30Z" fill={`url(#${id}-apple)`} />
        <path d="M14 24 C14 18, 18 14, 20 14 C22 14, 20 20, 18 26 C16 30, 14 28, 14 24Z" fill="white" opacity="0.2" />
        {/* Apple stem */}
        <path d="M22 12 C22 8, 24 5, 26 4" stroke="#7c6a3a" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        {/* Apple leaf */}
        <path d="M24 7 C28 5, 30 7, 28 10 C26 9, 24 8, 24 7Z" fill="#15803D" opacity="0.8" />
      </g>
      {/* Banana cluster */}
      <g filter="url(#cat-shadow)" transform="translate(28, 16)">
        <path d="M8 38 C4 28, 6 16, 14 8 C16 6, 18 8, 16 12 C12 20, 10 30, 14 38 Z" fill={`url(#${id}-banana)`} />
        <path d="M14 36 C10 26, 12 14, 20 6 C22 4, 24 6, 22 10 C18 18, 16 28, 20 36 Z" fill={`url(#${id}-banana)`} />
        <path d="M20 34 C16 24, 18 12, 26 4 C28 2, 30 4, 28 8 C24 16, 22 26, 26 34 Z" fill={`url(#${id}-banana)`} />
        {/* Banana highlights */}
        <path d="M10 28 C8 22, 10 18, 12 14" stroke="#FEF3C7" strokeWidth="0.8" fill="none" opacity="0.4" />
        <path d="M16 26 C14 20, 16 16, 18 12" stroke="#FEF3C7" strokeWidth="0.8" fill="none" opacity="0.35" />
        {/* Banana tips */}
        <circle cx="14" cy="8" r="1" fill="#92400E" opacity="0.3" />
        <circle cx="20" cy="6" r="1" fill="#92400E" opacity="0.3" />
        <circle cx="26" cy="4" r="1" fill="#92400E" opacity="0.3" />
      </g>
    </g>
  )
}

function FrozenIllustration({ id }: { id: string }) {
  return (
    <g>
      <defs>
        <linearGradient id={`${id}-box`} x1="12" y1="15" x2="48" y2="55">
          <stop offset="0%" stopColor="#E0F2FE" />
          <stop offset="100%" stopColor="#7DD3FC" />
        </linearGradient>
        <linearGradient id={`${id}-ice`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#BAE6FD" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#0EA5E9" stopOpacity="0.6" />
        </linearGradient>
      </defs>
      {/* Frozen box */}
      <g filter="url(#cat-shadow)">
        <rect x="14" y="22" width="32" height="32" rx="4" fill={`url(#${id}-box)`} />
        {/* Box 3D side */}
        <path d="M46 22 L52 18 L52 50 L46 54 Z" fill="#38BDF8" opacity="0.4" />
        {/* Box top */}
        <path d="M14 22 L20 18 L52 18 L46 22 Z" fill="#BAE6FD" opacity="0.6" />
        {/* Box label */}
        <rect x="18" y="30" width="24" height="6" rx="1.5" fill="white" opacity="0.4" />
        <rect x="20" y="32" width="16" height="1.5" rx="0.5" fill="#0EA5E9" opacity="0.3" />
        {/* Box stripe */}
        <rect x="14" y="40" width="32" height="2" fill="#0EA5E9" opacity="0.15" />
        {/* Box highlight */}
        <rect x="15" y="22" width="2.5" height="32" rx="1" fill="white" opacity="0.25" />
      </g>
      {/* Ice crystal */}
      <g transform="translate(8, 5)" opacity="0.7">
        {/* Main crystal */}
        <line x1="12" y1="4" x2="12" y2="20" stroke={`url(#${id}-ice)`} strokeWidth="1.5" strokeLinecap="round" />
        <line x1="4" y1="12" x2="20" y2="12" stroke={`url(#${id}-ice)`} strokeWidth="1.5" strokeLinecap="round" />
        <line x1="6" y1="6" x2="18" y2="18" stroke={`url(#${id}-ice)`} strokeWidth="1" strokeLinecap="round" />
        <line x1="18" y1="6" x2="6" y2="18" stroke={`url(#${id}-ice)`} strokeWidth="1" strokeLinecap="round" />
        {/* Crystal branches */}
        <line x1="12" y1="5" x2="9" y2="3" stroke="#7DD3FC" strokeWidth="0.8" strokeLinecap="round" />
        <line x1="12" y1="5" x2="15" y2="3" stroke="#7DD3FC" strokeWidth="0.8" strokeLinecap="round" />
        <line x1="12" y1="19" x2="9" y2="21" stroke="#7DD3FC" strokeWidth="0.8" strokeLinecap="round" />
        <line x1="12" y1="19" x2="15" y2="21" stroke="#7DD3FC" strokeWidth="0.8" strokeLinecap="round" />
      </g>
      {/* Frost sparkles */}
      <circle cx="48" cy="12" r="1" fill="#BAE6FD" opacity="0.5" className="frost-sparkle fs1" />
      <circle cx="8" cy="42" r="1.2" fill="#BAE6FD" opacity="0.4" className="frost-sparkle fs2" />
    </g>
  )
}

const CATEGORY_MAP: Record<CategoryType, (props: { id: string }) => React.ReactElement> = {
  dairy: DairyIllustration,
  beverages: BeveragesIllustration,
  snacks: SnacksIllustration,
  cereals: CerealsIllustration,
  bread: BreadIllustration,
  meat: MeatIllustration,
  fruits: FruitsIllustration,
  frozen: FrozenIllustration,
}

export default function FoodCategory({ category, size = 64 }: FoodCategoryProps) {
  const id = `fc-${category}`
  const Illustration = CATEGORY_MAP[category]

  if (!Illustration) return null

  return (
    <div style={{ width: size, height: size }}>
      <svg viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
        <defs>
          <filter id="cat-shadow" x="-15%" y="-10%" width="130%" height="130%">
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#1A1D2E" floodOpacity="0.12" />
          </filter>
        </defs>
        <Illustration id={id} />
      </svg>

      <style>{`
        .frost-sparkle {
          will-change: transform;
        }
        .fs1 { animation: sparkle-blink 2s ease-in-out infinite; }
        .fs2 { animation: sparkle-blink 2.5s ease-in-out 0.5s infinite; }
        @keyframes sparkle-blink {
          0%, 100% { opacity: 0.2; transform: scale(0.8); }
          50% { opacity: 0.7; transform: scale(1.2); }
        }
      `}</style>
    </div>
  )
}
