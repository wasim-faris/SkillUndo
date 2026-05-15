import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  HiPencil, HiLocationMarker, HiGlobe, HiLightningBolt,
  HiPlus, HiDotsHorizontal, HiChat, HiUserAdd, HiStar,
  HiRefresh, HiVideoCamera, HiBadgeCheck, HiExternalLink,
  HiCheck, HiCalendar, HiClock, HiDesktopComputer,
} from 'react-icons/hi';
import AppLayout from '../components/layout/AppLayout';
import { useAuth } from '../context/AuthContext';

/* ─── MOCK DATA ─── */
const MOCK = {
  name: 'Wasim Faris',
  headline: 'Full Stack Developer · Skill Architect · Open to Swaps',
  location: 'Kerala, India',
  connections: '2,410',
  matches: 18,
  bio: 'Passionate full-stack developer with 4+ years building scalable web applications. I specialize in React, Node.js, and cloud architecture. Always looking to swap skills — teach what I know, learn what I don\'t.',
  teachSkills: [
    { name: 'React', endorsements: 24, level: 5 },
    { name: 'Next.js', endorsements: 18, level: 4 },
    { name: 'TypeScript', endorsements: 21, level: 5 },
    { name: 'Node.js', endorsements: 15, level: 4 },
    { name: 'PostgreSQL', endorsements: 12, level: 3 },
    { name: 'REST APIs', endorsements: 19, level: 5 },
    { name: 'System Design', endorsements: 8, level: 3 },
    { name: 'Docker', endorsements: 6, level: 3 },
  ],
  learnSkills: ['Go', 'Rust', 'Machine Learning', 'UX Design', 'Flutter', 'DevOps/K8s'],
  experience: [
    {
      title: 'Senior Frontend Engineer', company: 'TechCorp Solutions', type: 'Full-time',
      duration: 'Jan 2022 – Present · 2 yrs 4 mos', location: 'Remote',
      description: 'Led frontend architecture for a SaaS platform serving 50k+ users. Built reusable component library and improved performance by 40% through code splitting and lazy loading.',
      skills: ['React', 'TypeScript', 'GraphQL', 'AWS'], initials: 'TC',
    },
    {
      title: 'Full Stack Developer', company: 'StartupXYZ', type: 'Full-time',
      duration: 'Jun 2020 – Dec 2021 · 1 yr 6 mos', location: 'Bangalore, India',
      description: 'Built and shipped 3 major product features end-to-end. Worked directly with founders in a fast-paced environment.',
      skills: ['Node.js', 'React', 'PostgreSQL', 'Docker'], initials: 'SX',
    },
  ],
  education: [
    {
      degree: 'Bachelor of Technology — Computer Science',
      institution: 'APJ Abdul Kalam Technological University',
      years: '2016 – 2020', initials: 'KTU',
      description: 'Focused on software engineering and distributed systems. Final year project: Real-time collaborative code editor.',
    },
    {
      degree: 'Higher Secondary (Science)',
      institution: 'Kerala State Board',
      years: '2014 – 2016', initials: 'KSB', description: '',
    },
  ],
  certs: [
    { name: 'AWS Certified Developer', issuer: 'Amazon Web Services', date: 'Mar 2023', emoji: '☁️' },
    { name: 'Meta React Professional', issuer: 'Meta', date: 'Jan 2022', emoji: '⚛️' },
  ],
  swaps: [
    { taught: 'React', learned: 'Figma', partner: 'Sarah Chen', initials: 'SC', date: 'March 2024', sessions: 3, rating: 5, status: 'Completed' },
    { taught: 'Node.js', learned: 'UX Design', partner: 'Marcus Bell', initials: 'MB', date: 'Jan 2024', sessions: 4, rating: 5, status: 'Completed' },
    { taught: 'TypeScript', learned: 'Go', partner: 'Elena R.', initials: 'ER', date: 'May 2024', sessions: 2, rating: 4, status: 'Active' },
  ],
};

/* ─── SUB-COMPONENTS ─── */
function Card({ children, className = '' }) {
  return (
    <div className={`rounded-2xl bg-[#1c1c1c] border border-[#2a2a2a] hover:border-[#333] transition-colors p-6 ${className}`}>
      {children}
    </div>
  );
}

function CardHeader({ icon, title, action }) {
  return (
    <div className="flex items-center justify-between pb-4 mb-5 border-b border-[#222]">
      <h2 className="text-base font-bold text-[#ececec] flex items-center gap-2">
        <span>{icon}</span> {title}
      </h2>
      {action}
    </div>
  );
}

function AddBtn({ onClick }) {
  return (
    <button onClick={onClick} className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#2a2a2a] text-[#a8a8a8] hover:text-[#d97757] hover:border-[#d97757]/40 transition-all text-lg leading-none">
      <HiPlus size={16} />
    </button>
  );
}

function EditBtn() {
  return (
    <button className="w-7 h-7 flex items-center justify-center rounded-md border border-[#2a2a2a] text-[#6b6b6b] hover:text-[#d97757] hover:border-[#d97757]/40 transition-all opacity-0 group-hover:opacity-100">
      <HiPencil size={13} />
    </button>
  );
}

function Dots({ max = 5, filled = 3 }) {
  return (
    <div className="flex gap-0.5 mt-1">
      {Array.from({ length: max }).map((_, i) => (
        <div key={i} className={`w-1.5 h-1.5 rounded-full ${i < filled ? 'bg-[#d97757]' : 'bg-[#2a2a2a]'}`} />
      ))}
    </div>
  );
}

function Stars({ count = 5 }) {
  return <span className="text-[#d97757] text-sm">{'★'.repeat(count)}{'☆'.repeat(5 - count)}</span>;
}

function StatusBadge({ status }) {
  const map = {
    Completed: 'bg-green-500/10 border-green-500/30 text-green-400',
    Active: 'bg-[#d97757]/10 border-[#d97757]/30 text-[#d97757]',
    Pending: 'bg-[#6b6b6b]/10 border-[#6b6b6b]/30 text-[#6b6b6b]',
  };
  return (
    <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${map[status] || map.Pending}`}>
      {status}
    </span>
  );
}

/* ─── MAIN PAGE ─── */
export default function Profile() {
  const { user } = useAuth();
  const displayName = user?.name || MOCK.name;
  const initials = displayName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <AppLayout>
      <div className="max-w-[900px] mx-auto py-8 space-y-4">

        {/* ── CARD 1: HERO ── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl bg-[#1c1c1c] border border-[#2a2a2a] overflow-hidden">
          {/* Banner */}
          <div className="h-36 relative" style={{ background: 'linear-gradient(135deg, #d97757 0%, #8b3a1a 60%, #1c1c1c 100%)' }}>
            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
          </div>

          <div className="px-6 pb-6">
            {/* Avatar row */}
            <div className="flex items-end justify-between -mt-12 mb-4">
              <div className="w-24 h-24 rounded-full border-4 border-[#1c1c1c] bg-gradient-to-br from-[#d97757] to-[#8b3a1a] flex items-center justify-center text-white font-black text-3xl shadow-xl">
                {initials}
              </div>
              <button className="mb-1 px-4 py-1.5 rounded-lg border border-[#3a3a3a] text-[#ececec] text-[13px] font-medium hover:border-[#d97757]/40 hover:text-[#d97757] transition-all flex items-center gap-1.5">
                <HiPencil size={14} /> Edit Profile
              </button>
            </div>

            {/* Identity */}
            <h1 className="text-2xl font-extrabold text-[#ececec] mb-1">{displayName}</h1>
            <p className="text-[15px] text-[#a8a8a8] mb-3">{MOCK.headline}</p>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-[#6b6b6b] mb-4">
              <span className="flex items-center gap-1"><HiLocationMarker size={14} /> {MOCK.location}</span>
              <span className="text-[#2a2a2a]">·</span>
              <span className="flex items-center gap-1"><HiGlobe size={14} /> Available for Remote Swaps</span>
            </div>

            <div className="flex items-center gap-2 text-[13px] mb-5">
              <span className="font-bold text-[#d97757]">{MOCK.connections}</span>
              <span className="text-[#6b6b6b]">Connections</span>
              <span className="text-[#2a2a2a]">·</span>
              <span className="font-bold text-[#d97757]">{MOCK.matches}</span>
              <span className="text-[#6b6b6b]">Skill Matches</span>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-2">
              <button className="px-5 py-2 rounded-full bg-[#d97757] text-white text-[14px] font-semibold hover:bg-[#c4643f] transition-all flex items-center gap-1.5">
                <HiUserAdd size={16} /> Connect
              </button>
              <button className="px-5 py-2 rounded-full border border-[#d97757] text-[#d97757] text-[14px] font-semibold hover:bg-[#d97757]/10 transition-all flex items-center gap-1.5">
                <HiChat size={16} /> Message
              </button>
              <button className="px-5 py-2 rounded-full border border-[#3a3a3a] text-[#ececec] text-[14px] font-semibold hover:border-[#d97757]/40 transition-all flex items-center gap-1.5">
                <HiLightningBolt size={16} /> Swap Skills
              </button>
              <button className="w-9 h-9 rounded-full border border-[#3a3a3a] text-[#a8a8a8] hover:text-[#ececec] transition-all flex items-center justify-center">
                <HiDotsHorizontal size={18} />
              </button>
            </div>
          </div>
        </motion.div>

        {/* ── CARD 2: ABOUT ── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <Card className="group">
            <CardHeader icon="📝" title="About" action={<EditBtn />} />
            <p className="text-[15px] text-[#d4d4d4] leading-[1.75]">{MOCK.bio}</p>
          </Card>
        </motion.div>

        {/* ── CARD 3: SKILLS I OFFER ── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
          <Card>
            <CardHeader icon="⚡" title="Skills I Can Teach" action={
              <button className="px-3 py-1 text-[12px] rounded-lg border border-[#d97757]/40 text-[#d97757] font-medium hover:bg-[#d97757]/10 transition-all flex items-center gap-1">
                <HiPlus size={13} /> Add Skill
              </button>
            } />
            <div className="flex flex-wrap gap-3">
              {MOCK.teachSkills.map(skill => (
                <div key={skill.name} className="flex flex-col items-start">
                  <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#d97757]/10 border border-[#d97757]/40 text-[#d97757] text-[13px] font-medium hover:bg-[#d97757]/20 transition-all cursor-default">
                    {skill.name}
                    <span className="text-[11px] text-[#d97757]/60 font-normal">✓ {skill.endorsements}</span>
                  </div>
                  <Dots max={5} filled={skill.level} />
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* ── CARD 4: SKILLS I WANT ── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardHeader icon="🎯" title="Skills I Want to Learn" action={
              <button className="px-3 py-1 text-[12px] rounded-lg border border-[#4a9eff]/40 text-[#4a9eff] font-medium hover:bg-[#4a9eff]/10 transition-all flex items-center gap-1">
                <HiPlus size={13} /> Add Skill
              </button>
            } />
            <div className="flex flex-wrap gap-2">
              {MOCK.learnSkills.map(skill => (
                <span key={skill} className="px-3.5 py-1.5 rounded-full bg-[#4a9eff]/10 border border-[#4a9eff]/40 text-[#4a9eff] text-[13px] font-medium hover:bg-[#4a9eff]/20 transition-all cursor-default">
                  {skill}
                </span>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* ── CARD 5: EXPERIENCE ── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}>
          <Card>
            <CardHeader icon="💼" title="Experience" action={<AddBtn />} />
            <div className="space-y-0">
              {MOCK.experience.map((exp, i) => (
                <div key={i}>
                  <div className="flex gap-4 group py-2">
                    <div className="w-12 h-12 shrink-0 rounded-xl bg-[#2a2a2a] flex items-center justify-center text-[#d97757] font-bold text-sm border border-[#333]">
                      {exp.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-[15px] font-semibold text-[#ececec]">{exp.title}</p>
                          <p className="text-[14px] text-[#a8a8a8]">{exp.company} · {exp.type}</p>
                          <p className="text-[13px] text-[#6b6b6b]">{exp.duration} · {exp.location}</p>
                        </div>
                        <EditBtn />
                      </div>
                      {exp.description && (
                        <p className="text-[14px] text-[#d4d4d4] leading-[1.65] mt-2 mb-3">{exp.description}</p>
                      )}
                      <div className="flex flex-wrap gap-1.5">
                        {exp.skills.map(s => (
                          <span key={s} className="px-2 py-0.5 rounded text-[11px] bg-[#1f1f1f] border border-[#3a3a3a] text-[#a8a8a8]">{s}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  {i < MOCK.experience.length - 1 && <div className="h-px bg-[#1f1f1f] my-4" />}
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* ── CARD 6: EDUCATION ── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }}>
          <Card>
            <CardHeader icon="🎓" title="Education" action={<AddBtn />} />
            <div className="space-y-0">
              {MOCK.education.map((edu, i) => (
                <div key={i}>
                  <div className="flex gap-4 group py-2">
                    <div className="w-12 h-12 shrink-0 rounded-xl bg-[#2a2a2a] flex items-center justify-center text-[#4a9eff] font-bold text-xs border border-[#333]">
                      {edu.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-[15px] font-semibold text-[#ececec]">{edu.degree}</p>
                          <p className="text-[14px] text-[#a8a8a8]">{edu.institution}</p>
                          <p className="text-[13px] text-[#6b6b6b]">{edu.years}</p>
                        </div>
                        <EditBtn />
                      </div>
                      {edu.description && (
                        <p className="text-[14px] text-[#d4d4d4] leading-[1.65] mt-2">{edu.description}</p>
                      )}
                    </div>
                  </div>
                  {i < MOCK.education.length - 1 && <div className="h-px bg-[#1f1f1f] my-4" />}
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* ── CARD 7: CERTIFICATIONS ── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }}>
          <Card>
            <CardHeader icon="🏆" title="Certifications" action={<AddBtn />} />
            <div className="space-y-4">
              {MOCK.certs.map((cert, i) => (
                <div key={i} className="flex gap-4 group items-start">
                  <div className="w-11 h-11 shrink-0 rounded-xl bg-gradient-to-br from-[#d97757]/20 to-[#8b3a1a]/20 border border-[#d97757]/20 flex items-center justify-center text-2xl">
                    {cert.emoji}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-[14px] font-semibold text-[#ececec]">{cert.name}</p>
                        <p className="text-[13px] text-[#a8a8a8]">{cert.issuer}</p>
                        <p className="text-[12px] text-[#6b6b6b]">Issued {cert.date}</p>
                      </div>
                      <EditBtn />
                    </div>
                    <button className="mt-1.5 text-[12px] text-[#d97757] hover:underline flex items-center gap-1">
                      Show Credential <HiExternalLink size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* ── CARD 8: SWAP HISTORY ── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}>
          <Card>
            <CardHeader icon="🔄" title="Swap History" />
            <p className="text-[13px] text-[#6b6b6b] -mt-3 mb-5">Skills exchanged with the community</p>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              {[['12', 'Swaps Completed'], ['4.9★', 'Avg Rating'], ['8', 'Active Swaps']].map(([val, label]) => (
                <div key={label} className="rounded-xl bg-[#111] border border-[#2a2a2a] p-3 text-center">
                  <p className="text-xl font-bold text-[#d97757]">{val}</p>
                  <p className="text-[11px] text-[#6b6b6b] mt-0.5">{label}</p>
                </div>
              ))}
            </div>

            <div className="space-y-0">
              {MOCK.swaps.map((swap, i) => (
                <div key={i}>
                  <div className="flex items-center gap-4 py-3">
                    {/* Avatars with arrow */}
                    <div className="flex items-center gap-1 shrink-0">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#d97757] to-[#8b3a1a] flex items-center justify-center text-white text-xs font-bold">
                        WF
                      </div>
                      <span className="text-[#6b6b6b] text-sm">⇄</span>
                      <div className="w-9 h-9 rounded-full bg-[#2a2a2a] border border-[#3a3a3a] flex items-center justify-center text-[#ececec] text-xs font-bold">
                        {swap.initials}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] text-[#d4d4d4]">
                        Taught <span className="text-[#d97757] font-medium">{swap.taught}</span> to {swap.partner} · Learned <span className="text-[#4a9eff] font-medium">{swap.learned}</span>
                      </p>
                      <p className="text-[12px] text-[#6b6b6b]">{swap.date} · {swap.sessions} sessions</p>
                    </div>
                    <div className="shrink-0 flex flex-col items-end gap-1">
                      <Stars count={swap.rating} />
                      <StatusBadge status={swap.status} />
                    </div>
                  </div>
                  {i < MOCK.swaps.length - 1 && <div className="h-px bg-[#1f1f1f]" />}
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* ── CARD 9: AVAILABILITY ── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card>
            <CardHeader icon="📅" title="Availability" action={<EditBtn />} />
            <div className="space-y-5">
              {/* Status */}
              <div>
                <p className="text-[12px] text-[#6b6b6b] uppercase tracking-wider mb-2 font-medium">Status</p>
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-green-500/10 border border-green-500/30 text-green-400 text-[13px] font-medium">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" /> Open to Skill Swaps
                </span>
              </div>

              {/* Session types */}
              <div>
                <p className="text-[12px] text-[#6b6b6b] uppercase tracking-wider mb-2 font-medium">Preferred Session Types</p>
                <div className="flex flex-wrap gap-2">
                  {['1-on-1', 'Group', 'Async'].map(t => (
                    <span key={t} className="px-3 py-1 rounded-full border border-[#3a3a3a] text-[#ececec] text-[13px] hover:border-[#d97757]/40 transition-all cursor-default">{t}</span>
                  ))}
                </div>
              </div>

              {/* Schedule */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[12px] text-[#6b6b6b] uppercase tracking-wider mb-1.5 font-medium">Weekly Availability</p>
                  <p className="text-[14px] text-[#d4d4d4] flex items-center gap-1.5"><HiCalendar size={15} className="text-[#6b6b6b]" /> Weekends · Evenings (IST)</p>
                </div>
                <div>
                  <p className="text-[12px] text-[#6b6b6b] uppercase tracking-wider mb-1.5 font-medium">Session Length</p>
                  <p className="text-[14px] text-[#d4d4d4] flex items-center gap-1.5"><HiClock size={15} className="text-[#6b6b6b]" /> 30–60 min sessions</p>
                </div>
              </div>

              {/* Communication */}
              <div>
                <p className="text-[12px] text-[#6b6b6b] uppercase tracking-wider mb-2 font-medium">Communication</p>
                <div className="flex flex-wrap gap-2">
                  {[['Video Call', HiVideoCamera], ['Chat', HiChat], ['Screen Share', HiDesktopComputer]].map(([label, Icon]) => (
                    <span key={label} className="px-3 py-1 rounded-full border border-[#3a3a3a] text-[#ececec] text-[13px] flex items-center gap-1.5 cursor-default">
                      <Icon size={14} className="text-[#6b6b6b]" /> {label}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

      </div>
    </AppLayout>
  );
}
