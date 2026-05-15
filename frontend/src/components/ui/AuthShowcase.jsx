import { motion } from 'framer-motion';

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
    <div className="auth-visual-panel">
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
          }}
        />
      ))}

      {/* ── Skill Exchange Visualizer ── */}
      <div className="relative z-10 w-full px-10 flex flex-col items-center gap-8">

        {/* Row: Avatar + chip track + Avatar */}
        <div className="flex items-center w-full max-w-sm gap-0">

          {/* Left Avatar */}
          <div className="auth-avatar auth-avatar-left auth-avatar-pulse">
            <span className="initials">AR</span>
            <span className="role">React Dev</span>
          </div>

          {/* Chip Track */}
          <div className="auth-chip-track flex-1">
            {/* LTR chips: orange (#d97757) */}
            {LTR_CHIPS.map((chip) => (
              <span
                key={chip.label}
                className="auth-chip auth-chip-ltr"
                style={{ animationDelay: chip.delay, left: 0, animationDuration: '3.5s' }}
              >
                {chip.label}
              </span>
            ))}

            {/* RTL chips: blue (#4a9eff) */}
            {RTL_CHIPS.map((chip) => (
              <span
                key={chip.label}
                className="auth-chip auth-chip-rtl"
                style={{ animationDelay: chip.delay, right: 0, animationDuration: '3.5s' }}
              >
                {chip.label}
              </span>
            ))}
          </div>

          {/* Right Avatar */}
          <div className="auth-avatar auth-avatar-right auth-avatar-pulse" style={{ animationDelay: '1s' }}>
            <span className="initials">MB</span>
            <span className="role">UX Designer</span>
          </div>
        </div>

        {/* Divider */}
        <div className="auth-visual-divider" />

        {/* Tagline */}
        <div className="auth-tagline">
          <h2
            style={{
              fontSize:      '1.6rem',
              fontWeight:    700,
              color:         '#ececec',
              letterSpacing: '-0.02em',
              lineHeight:    1.2,
              marginBottom:  '0.5rem',
            }}
          >
            Trade Skills.
            <br />
            <span style={{ color: '#d97757' }}>Grow Together.</span>
          </h2>
          <p style={{ color: '#6b6b6b', fontSize: '0.8rem', marginTop: '0.5rem', letterSpacing: '0.04em' }}>
            The world's most premium skill exchange community.
          </p>
        </div>

        {/* Floating stats pills */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.8 }}
          style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}
        >
          {[
            { label: '2,400+ Members', bg: 'rgba(217,119,87,0.1)', border: 'rgba(217,119,87,0.2)', color: '#d97757' },
            { label: '8,000+ Swaps',   bg: 'rgba(74,158,255,0.1)', border: 'rgba(74,158,255,0.2)', color: '#4a9eff'  },
            { label: '95% Satisfied',  bg: 'rgba(76,175,80,0.1)',  border: 'rgba(76,175,80,0.2)',  color: '#4caf50'  },
          ].map((s) => (
            <span
              key={s.label}
              style={{
                background:   s.bg,
                border:       `1px solid ${s.border}`,
                color:        s.color,
                borderRadius: '999px',
                padding:      '0.25rem 0.875rem',
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
