'use client'

export default function AnimatedBackground() {
  return (
    <div className="animated-bg-container" aria-hidden="true">
      <div className="animated-orb orb-green" />
      <div className="animated-orb orb-gold" />
      <div className="animated-orb orb-blue" />
      <div className="animated-orb orb-purple" />

      <style>{`
        .animated-bg-container {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 0;
          overflow: hidden;
        }
        .animated-orb {
          position: absolute;
          border-radius: 50%;
          will-change: transform;
          filter: blur(80px);
        }
        .orb-green {
          width: 320px;
          height: 320px;
          top: -60px;
          left: -80px;
          background: radial-gradient(circle, rgba(52, 211, 153, 0.12) 0%, transparent 70%);
          animation: orb-float-1 18s ease-in-out infinite;
        }
        .orb-gold {
          width: 280px;
          height: 280px;
          top: 40%;
          right: -100px;
          background: radial-gradient(circle, rgba(241, 177, 35, 0.1) 0%, transparent 70%);
          animation: orb-float-2 22s ease-in-out infinite;
        }
        .orb-blue {
          width: 260px;
          height: 260px;
          bottom: 10%;
          left: -60px;
          background: radial-gradient(circle, rgba(14, 165, 233, 0.08) 0%, transparent 70%);
          animation: orb-float-3 25s ease-in-out infinite;
        }
        .orb-purple {
          width: 200px;
          height: 200px;
          top: 20%;
          left: 50%;
          background: radial-gradient(circle, rgba(139, 92, 246, 0.06) 0%, transparent 70%);
          animation: orb-float-4 20s ease-in-out infinite;
        }
        @keyframes orb-float-1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(40px, 30px) scale(1.05); }
          66% { transform: translate(-20px, 50px) scale(0.95); }
        }
        @keyframes orb-float-2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(-30px, -40px) scale(1.08); }
          66% { transform: translate(20px, -20px) scale(0.92); }
        }
        @keyframes orb-float-3 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(50px, -30px) scale(0.95); }
          66% { transform: translate(-10px, -50px) scale(1.06); }
        }
        @keyframes orb-float-4 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(-40px, 20px) scale(1.1); }
          66% { transform: translate(30px, -30px) scale(0.9); }
        }
      `}</style>
    </div>
  )
}
