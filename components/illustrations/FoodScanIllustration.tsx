'use client'

export default function FoodScanIllustration({ size = 200 }: { size?: number }) {
  const id = `fsi-${Math.random().toString(36).slice(2, 8)}`
  return (
    <div className="food-scan-illustration" style={{ width: size, height: size }}>
      <svg
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        width="100%"
        height="100%"
      >
        <defs>
          {/* Phone body gradient */}
          <linearGradient id={`${id}-phone`} x1="60" y1="30" x2="140" y2="170">
            <stop offset="0%" stopColor="#2D3148" />
            <stop offset="100%" stopColor="#1A1D2E" />
          </linearGradient>
          {/* Screen gradient */}
          <linearGradient id={`${id}-screen`} x1="70" y1="45" x2="130" y2="155">
            <stop offset="0%" stopColor="#0f1623" />
            <stop offset="100%" stopColor="#1a2332" />
          </linearGradient>
          {/* Scan beam gradient */}
          <linearGradient id={`${id}-beam`} x1="75" y1="0" x2="125" y2="0">
            <stop offset="0%" stopColor="#34D399" stopOpacity="0" />
            <stop offset="30%" stopColor="#34D399" stopOpacity="0.6" />
            <stop offset="50%" stopColor="#34D399" stopOpacity="0.9" />
            <stop offset="70%" stopColor="#34D399" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#34D399" stopOpacity="0" />
          </linearGradient>
          {/* Apple gradient */}
          <radialGradient id={`${id}-apple`} cx="0.4" cy="0.3" r="0.7">
            <stop offset="0%" stopColor="#f87171" />
            <stop offset="60%" stopColor="#dc2626" />
            <stop offset="100%" stopColor="#991b1b" />
          </radialGradient>
          {/* Gold particle gradient */}
          <radialGradient id={`${id}-particle`} cx="0.5" cy="0.5" r="0.5">
            <stop offset="0%" stopColor="#F1B123" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#F1B123" stopOpacity="0" />
          </radialGradient>
          {/* Green glow for scan area */}
          <radialGradient id={`${id}-glow`} cx="0.5" cy="0.5" r="0.5">
            <stop offset="0%" stopColor="#34D399" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#34D399" stopOpacity="0" />
          </radialGradient>
          {/* Shadow filter */}
          <filter id={`${id}-shadow`} x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="8" floodColor="#1A1D2E" floodOpacity="0.25" />
          </filter>
          <filter id={`${id}-glow-f`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Scan glow area behind everything */}
        <ellipse cx="100" cy="120" rx="70" ry="50" fill={`url(#${id}-glow)`} />

        {/* Phone body - 3D effect with shadow */}
        <g filter={`url(#${id}-shadow)`}>
          {/* Phone frame */}
          <rect x="62" y="30" width="76" height="140" rx="12" fill={`url(#${id}-phone)`} />
          {/* Phone side highlight */}
          <rect x="62" y="30" width="3" height="140" rx="1.5" fill="#3A3F57" opacity="0.5" />
          {/* Camera notch */}
          <rect x="88" y="34" width="24" height="4" rx="2" fill="#0f1623" opacity="0.7" />
          {/* Camera dot */}
          <circle cx="100" cy="36" r="1.5" fill="#3A3F57" />
          {/* Screen */}
          <rect x="68" y="44" width="64" height="116" rx="4" fill={`url(#${id}-screen)`} />
          {/* Screen content - mini nutrition facts */}
          <rect x="74" y="52" width="52" height="4" rx="1" fill="#34D399" opacity="0.4" />
          <rect x="74" y="60" width="36" height="2" rx="1" fill="#6B7194" opacity="0.3" />
          <rect x="74" y="66" width="44" height="2" rx="1" fill="#6B7194" opacity="0.25" />
          <rect x="74" y="72" width="30" height="2" rx="1" fill="#6B7194" opacity="0.2" />
          <rect x="74" y="78" width="40" height="2" rx="1" fill="#6B7194" opacity="0.25" />
          {/* Screen grade badge */}
          <rect x="84" y="90" width="32" height="20" rx="6" fill="#059669" opacity="0.7" />
          <text x="100" y="104" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold" fontFamily="Inter, sans-serif">A</text>
          {/* Score text */}
          <rect x="80" y="116" width="40" height="3" rx="1" fill="#F1B123" opacity="0.3" />
          {/* Bottom bar */}
          <rect x="90" y="152" width="20" height="3" rx="1.5" fill="#3A3F57" opacity="0.4" />
        </g>

        {/* Apple illustration - 3D style with shadow */}
        <g transform="translate(30, 100)">
          {/* Apple shadow on ground */}
          <ellipse cx="20" cy="52" rx="16" ry="4" fill="#1A1D2E" opacity="0.1" />
          {/* Apple body */}
          <path
            d="M8 28 C8 16, 14 8, 20 8 C26 8, 32 16, 32 28 C32 42, 26 50, 20 50 C14 50, 8 42, 8 28Z"
            fill={`url(#${id}-apple)`}
          />
          {/* Apple highlight */}
          <path
            d="M12 22 C12 16, 16 12, 18 12 C20 12, 18 18, 16 24 C14 28, 12 26, 12 22Z"
            fill="white"
            opacity="0.25"
          />
          {/* Apple indent */}
          <path
            d="M17 10 C18 8, 20 7, 22 8"
            stroke="#991b1b"
            strokeWidth="1.5"
            fill="none"
            opacity="0.5"
          />
          {/* Stem */}
          <path
            d="M20 8 C20 4, 22 2, 24 1"
            stroke="#7c6a3a"
            strokeWidth="1.8"
            fill="none"
            strokeLinecap="round"
          />
          {/* Leaf */}
          <path
            d="M22 4 C26 2, 28 4, 26 7 C24 6, 22 5, 22 4Z"
            fill="#059669"
            opacity="0.8"
          />
          {/* Leaf vein */}
          <path d="M23 4.5 L25.5 5.5" stroke="#34D399" strokeWidth="0.4" opacity="0.5" />
        </g>

        {/* Scan beam lines - animated */}
        <g className="scan-lines-group">
          <rect className="scan-beam" x="48" y="110" width="52" height="2" rx="1" fill={`url(#${id}-beam)`} />
        </g>

        {/* Light rays from phone to apple */}
        <g className="scan-rays" opacity="0.3">
          <line x1="68" y1="100" x2="48" y2="115" stroke="#34D399" strokeWidth="0.8" strokeDasharray="3 3" />
          <line x1="68" y1="110" x2="48" y2="120" stroke="#34D399" strokeWidth="0.6" strokeDasharray="2 4" />
          <line x1="68" y1="120" x2="48" y2="130" stroke="#34D399" strokeWidth="0.8" strokeDasharray="3 3" />
          <line x1="68" y1="130" x2="48" y2="140" stroke="#34D399" strokeWidth="0.6" strokeDasharray="2 4" />
        </g>

        {/* Floating data particles */}
        <g filter={`url(#${id}-glow-f)`}>
          <circle className="particle p1" cx="45" cy="90" r="3" fill="#F1B123" opacity="0.7" />
          <circle className="particle p2" cx="155" cy="75" r="2.5" fill="#34D399" opacity="0.6" />
          <circle className="particle p3" cx="160" cy="110" r="2" fill="#F1B123" opacity="0.5" />
          <circle className="particle p4" cx="38" cy="140" r="2" fill="#0EA5E9" opacity="0.5" />
          <circle className="particle p5" cx="150" cy="140" r="3" fill="#34D399" opacity="0.4" />
          <circle className="particle p6" cx="50" cy="65" r="1.5" fill="#059669" opacity="0.6" />
        </g>

        {/* Mini data tags floating */}
        <g className="data-tag dt1" opacity="0.7">
          <rect x="145" y="85" width="28" height="14" rx="4" fill="#1A1D2E" opacity="0.8" />
          <text x="159" y="95" textAnchor="middle" fill="#34D399" fontSize="7" fontWeight="600" fontFamily="Inter, sans-serif">5g</text>
        </g>
        <g className="data-tag dt2" opacity="0.6">
          <rect x="148" y="125" width="24" height="14" rx="4" fill="#1A1D2E" opacity="0.8" />
          <text x="160" y="135" textAnchor="middle" fill="#F1B123" fontSize="7" fontWeight="600" fontFamily="Inter, sans-serif">2g</text>
        </g>
      </svg>

      <style>{`
        .food-scan-illustration {
          position: relative;
        }
        .scan-beam {
          animation: scan-sweep 2.5s ease-in-out infinite;
        }
        @keyframes scan-sweep {
          0% { transform: translateY(-20px); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(40px); opacity: 0; }
        }
        .scan-rays {
          animation: ray-pulse 2s ease-in-out infinite;
        }
        @keyframes ray-pulse {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 0.5; }
        }
        .particle {
          will-change: transform;
        }
        .p1 { animation: particle-float-1 4s ease-in-out infinite; }
        .p2 { animation: particle-float-2 5s ease-in-out infinite; }
        .p3 { animation: particle-float-3 3.5s ease-in-out infinite; }
        .p4 { animation: particle-float-4 4.5s ease-in-out infinite; }
        .p5 { animation: particle-float-5 5.5s ease-in-out infinite; }
        .p6 { animation: particle-float-6 3s ease-in-out infinite; }
        @keyframes particle-float-1 {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(5px, -8px); }
        }
        @keyframes particle-float-2 {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(-6px, -5px); }
        }
        @keyframes particle-float-3 {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(-4px, 7px); }
        }
        @keyframes particle-float-4 {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(6px, -6px); }
        }
        @keyframes particle-float-5 {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(-5px, -4px); }
        }
        @keyframes particle-float-6 {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(3px, -9px); }
        }
        .dt1 { animation: tag-float-1 5s ease-in-out infinite; }
        .dt2 { animation: tag-float-2 6s ease-in-out infinite; }
        @keyframes tag-float-1 {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(-3px, -6px); }
        }
        @keyframes tag-float-2 {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(4px, -4px); }
        }
      `}</style>
    </div>
  )
}
