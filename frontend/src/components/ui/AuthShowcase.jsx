import { motion } from 'framer-motion';
import { HiLightningBolt } from 'react-icons/hi';


const particles = [
  { left: '15%', top: '20%', size: 3, delay: 0,   dur: 8  },
  { left: '80%', top: '15%', size: 2, delay: 1.5, dur: 11 },
  { left: '65%', top: '70%', size: 4, delay: 3,   dur: 9  },
  { left: '30%', top: '80%', size: 2, delay: 0.8, dur: 13 },
  { left: '90%', top: '50%', size: 3, delay: 2,   dur: 7  },
  { left: '10%', top: '55%', size: 2, delay: 4,   dur: 10 },
  { left: '50%', top: '10%', size: 3, delay: 1,   dur: 12 },
  { left: '40%', top: '90%', size: 2, delay: 3.5, dur: 8  },
];

const LTR_CHIPS = [
  { label: 'React',      delay: '0s'   },
  { label: 'Next.js',   delay: '1.2s' },
  { label: 'TypeScript', delay: '2.4s' },
];

const RTL_CHIPS = [
  { label: 'Figma',        delay: '0.6s' },
  { label: 'Wireframes',   delay: '1.8s' },
  { label: 'UX Research',  delay: '3s'   },
];

export default function AuthShowcase() {
  return (
    <div className="auth-showcase-panel">
      {/* ── Floating Particles ── */}
      {particles.map((p, i) => (
        <span
          key={i}
          className="auth-particle"
          style={{
            left:              p.left,
            top:               p.top,
            width:             p.size,
            height:            p.size,
            animationDelay:    `${p.delay}s`,
            animationDuration: `${p.dur}s`,
            background:        'var(--accent-primary)',
            opacity:           0.2,
            position:          'absolute',
            borderRadius:      '50%',
          }}
        />
      ))}

      {/* ── Skill Exchange Visualizer ── */}
      <div className="relative z-10 w-full max-w-[420px] px-10 flex flex-col items-center gap-8">

        {/* Row: Avatar + chip track + Avatar */}
        <div className="flex items-center w-full max-w-sm gap-0" style={{ position: 'relative', height: '60px' }}>

          {/* Left Avatar */}
          <div className="flex flex-col items-center z-10 bg-[var(--bg-secondary)] border border-[var(--border-focus)] rounded-xl p-3 shadow-[0_0_15px_rgba(124,111,247,0.2)]">
            <span className="font-bold text-[var(--text-primary)]">AR</span>
            <span className="text-[10px] text-[var(--accent-primary)] font-medium">React Dev</span>
          </div>

          {/* Chip Track */}
          <div className="flex-1 relative h-[60px] overflow-hidden mx-2">
            {/* LTR chips: purple */}
            {LTR_CHIPS.map((chip) => (
              <span
                key={chip.label}
                className="absolute bg-[rgba(124,111,247,0.15)] text-[var(--accent-primary)] border border-[rgba(124,111,247,0.3)] px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap"
                style={{ 
                  animation: `slideRight 3.5s linear infinite ${chip.delay}`,
                  left: '-50px',
                  top: '0',
                }}
              >
                {chip.label}
              </span>
            ))}

            {/* RTL chips: coral */}
            {RTL_CHIPS.map((chip) => (
              <span
                key={chip.label}
                className="absolute bg-[rgba(249,112,102,0.15)] text-[var(--accent-secondary)] border border-[rgba(249,112,102,0.3)] px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap"
                style={{ 
                  animation: `slideLeft 3.5s linear infinite ${chip.delay}`,
                  right: '-50px',
                  bottom: '0',
                }}
              >
                {chip.label}
              </span>
            ))}
            
            <style>{`
              @keyframes slideRight {
                0% { transform: translateX(0); opacity: 0; }
                10% { opacity: 1; }
                90% { opacity: 1; }
                100% { transform: translateX(300px); opacity: 0; }
              }
              @keyframes slideLeft {
                0% { transform: translateX(0); opacity: 0; }
                10% { opacity: 1; }
                90% { opacity: 1; }
                100% { transform: translateX(-300px); opacity: 0; }
              }
            `}</style>
          </div>

          {/* Right Avatar */}
          <div className="flex flex-col items-center z-10 bg-[var(--bg-secondary)] border border-[rgba(249,112,102,0.6)] rounded-xl p-3 shadow-[0_0_15px_rgba(249,112,102,0.15)]">
            <span className="font-bold text-[var(--text-primary)]">MB</span>
            <span className="text-[10px] text-[var(--accent-secondary)] font-medium">UX Designer</span>
          </div>
        </div>

        {/* Divider */}
        <div className="w-full h-[1px] bg-[var(--border-default)] my-4 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[var(--bg-secondary)] px-4">
            <HiLightningBolt className="text-[var(--text-muted)] w-4 h-4" />
          </div>
        </div>

        {/* Tagline */}
        <div className="text-center">
          <h2
            style={{
              fontSize:      '1.8rem',
              fontWeight:    700,
              color:         'var(--text-primary)',
              letterSpacing: '-0.02em',
              lineHeight:    1.2,
              marginBottom:  '0.5rem',
            }}
          >
            Trade Skills.
            <br />
            <span style={{ color: 'var(--accent-primary)' }}>Grow Together.</span>
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.75rem', letterSpacing: '0.04em' }}>
            The world's most premium skill exchange platform.
          </p>
        </div>

        {/* Floating stats pills */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.8 }}
          style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center', marginTop: '1rem' }}
        >
          {[
            { label: '2,400+ Members', bg: 'rgba(124,111,247,0.1)', border: 'rgba(124,111,247,0.2)', color: 'var(--accent-primary)' },
            { label: '8,000+ Swaps',   bg: 'rgba(249,112,102,0.1)', border: 'rgba(249,112,102,0.2)', color: 'var(--accent-secondary)'  },
            { label: '95% Satisfied',  bg: 'rgba(52,211,153,0.1)',  border: 'rgba(52,211,153,0.2)',  color: 'var(--accent-green)'  },
          ].map((s) => (
            <span
              key={s.label}
              style={{
                background:   s.bg,
                border:       `1px solid ${s.border}`,
                color:        s.color,
                borderRadius: '999px',
                padding:      '0.3rem 0.875rem',
                fontSize:     '0.65rem',
                fontWeight:   700,
                letterSpacing:'0.06em',
                textTransform:'uppercase',
              }}
            >
              {s.label}
            </span>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
