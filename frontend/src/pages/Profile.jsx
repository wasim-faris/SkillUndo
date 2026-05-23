import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  HiPencil, HiLocationMarker, HiGlobe, HiLightningBolt,
  HiPlus, HiDotsHorizontal, HiChat, HiUserAdd,
  HiVideoCamera, HiBadgeCheck,
  HiCalendar, HiDesktopComputer,
} from 'react-icons/hi';
import AppLayout from '../components/layout/AppLayout';
import { useAuth } from '../context/AuthContext';
import { getProfile } from '../api/auth';
import { getMatches, getUserSkills } from '../api/skills';

/* ─── MOCK DATA ─── */
const MOCK = {
  name: 'Wasim Faris',
  headline: 'Full Stack Developer · Skill Architect · Open to Swaps',
  location: 'Kerala, India',
  connections: '2,410',
  matches: 18,
  bio: 'Passionate full-stack developer with 4+ years building scalable web applications. I specialize in React, Node.js, and cloud architecture. Always looking to swap skills — teach what I know, learn what I don\'t.',
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

const API_BASE_URL = 'http://127.0.0.1:8000';

const unwrap = (response) => response?.data?.data ?? response?.data ?? null;
const hasValue = (value) => value !== undefined && value !== null && value !== '';
const pick = (...values) => values.find(hasValue);
const asArray = (value) => Array.isArray(value) ? value : [];
const formatCount = (value, fallback) => {
  const number = Number(value);
  return Number.isFinite(number) ? number.toLocaleString() : fallback;
};
const getInitials = (value) =>
  (value || MOCK.name).split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
const getAssetUrl = (url) => {
  if (!url) return null;
  if (/^https?:\/\//i.test(url)) return url;
  return `${API_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
};
const normalizeSkillName = (item) =>
  item?.skill?.name || item?.name || item?.title || item?.skill_name || item;
const normalizeTeachSkill = (item) => {
  const name = normalizeSkillName(item);
  if (!name) return null;
  return {
    id: item?.id || item?.skill?.id || name,
    name,
    endorsements: item?.endorsements ?? item?.endorsement_count ?? 0,
    level: item?.level ?? item?.proficiency ?? 3,
  };
};
const normalizeLearnSkill = (item) => {
  const name = normalizeSkillName(item);
  if (!name) return null;
  return {
    id: item?.id || item?.skill?.id || name,
    name,
  };
};
const normalizeExperience = (item) => ({
  title: pick(item?.title, item?.role, item?.position, 'Role'),
  company: pick(item?.company, item?.organization, item?.employer, 'Company'),
  type: pick(item?.type, item?.employment_type, 'Full-time'),
  duration: pick(item?.duration, item?.date_range, [item?.start_date, item?.end_date].filter(Boolean).join(' – '), ''),
  location: pick(item?.location, item?.city, 'Remote'),
  description: pick(item?.description, item?.summary, ''),
  skills: asArray(item?.skills).map(normalizeSkillName).filter(Boolean),
  initials: pick(item?.initials, getInitials(pick(item?.company, item?.organization, item?.employer, ''))),
});
const normalizeEducation = (item) => ({
  degree: pick(item?.degree, item?.course, item?.field_of_study, 'Degree'),
  institution: pick(item?.institution, item?.school, item?.university, 'Institution'),
  years: pick(item?.years, item?.date_range, [item?.start_year, item?.end_year].filter(Boolean).join(' – '), ''),
  initials: pick(item?.initials, getInitials(pick(item?.institution, item?.school, item?.university, ''))),
  description: pick(item?.description, ''),
});

/* ─── SUB-COMPONENTS ─── */
function Card({ children, className = '' }) {
  return (
    <div className={`card-premium p-6 ${className}`}>
      {children}
    </div>
  );
}

function CardHeader({ icon, title, action }) {
  return (
    <div className="flex items-center justify-between pb-4 mb-5 border-b border-[var(--border-default)]">
      <h2 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
        <span>{icon}</span> {title}
      </h2>
      {action}
    </div>
  );
}

function AddBtn({ onClick }) {
  return (
    <button onClick={onClick} className="w-8 h-8 flex items-center justify-center rounded-lg border border-[var(--border-default)] text-[var(--text-muted)] hover:text-[var(--accent-primary)] hover:border-[var(--accent-primary)] transition-all text-lg leading-none bg-[var(--bg-secondary)]">
      <HiPlus size={16} />
    </button>
  );
}

function EditBtn() {
  return (
    <button className="w-7 h-7 flex items-center justify-center rounded-md border border-[var(--border-default)] text-[var(--text-muted)] hover:text-[var(--accent-primary)] hover:border-[var(--accent-primary)] transition-all opacity-0 group-hover:opacity-100 bg-[var(--bg-secondary)]">
      <HiPencil size={13} />
    </button>
  );
}

function Dots({ max = 5, filled = 3 }) {
  return (
    <div className="flex gap-0.5 mt-1">
      {Array.from({ length: max }).map((_, i) => (
        <div key={i} className={`w-1.5 h-1.5 rounded-full ${i < filled ? 'bg-[var(--accent-primary)]' : 'bg-[var(--bg-secondary)]'}`} />
      ))}
    </div>
  );
}

function Stars({ count = 5 }) {
  return <span className="text-[var(--accent-yellow)] text-sm">{'★'.repeat(count)}{'☆'.repeat(5 - count)}</span>;
}

function StatusBadge({ status }) {
  const map = {
    Completed: 'bg-[rgba(52,211,153,0.1)] border-[rgba(52,211,153,0.3)] text-[var(--accent-green)]',
    Active: 'bg-[rgba(124,111,247,0.1)] border-[rgba(124,111,247,0.3)] text-[var(--accent-primary)]',
    Pending: 'bg-[var(--bg-secondary)] border-[var(--border-default)] text-[var(--text-muted)]',
  };
  return (
    <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${map[status] || map.Pending}`}>
      {status}
    </span>
  );
}

function SkillLoadingState({ variant = 'teach' }) {
  const widths = variant === 'teach' ? ['w-32', 'w-40', 'w-36'] : ['w-28', 'w-36', 'w-32'];

  return (
    <div className="flex flex-wrap gap-4">
      {widths.map((width, index) => (
        <div key={index} className={`h-12 ${width} bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-xl animate-pulse`} />
      ))}
    </div>
  );
}

function SkillEmptyState({ message, onAdd, variant = 'teach' }) {
  const buttonClass = variant === 'learn'
    ? 'border-[var(--accent-secondary)] text-[var(--accent-secondary)] hover:bg-[rgba(249,112,102,0.1)]'
    : 'border-[var(--accent-primary)] text-[var(--accent-primary)] hover:bg-[rgba(124,111,247,0.1)]';

  return (
    <div className="w-full rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-default)] px-5 py-8 text-center flex flex-col items-center">
      <p className="text-[var(--text-secondary)] font-medium text-sm mb-4">{message}</p>
      <button
        onClick={onAdd}
        className={`px-3 py-1.5 text-[12px] rounded-lg border font-medium transition-all flex items-center gap-1 ${buttonClass}`}
      >
        <HiPlus size={13} /> Add Skill
      </button>
    </div>
  );
}

function ProfileSkillsSection({ type, skills, loading, onAdd }) {
  const isLearn = type === 'learn';

  if (loading) {
    return <SkillLoadingState variant={type} />;
  }

  if (!skills.length) {
    return (
      <SkillEmptyState
        message={isLearn ? 'No learning skills added yet' : 'No teaching skills added yet'}
        onAdd={onAdd}
        variant={type}
      />
    );
  }

  if (isLearn) {
    return (
      <div className="flex flex-wrap gap-2">
        {skills.map(skill => (
          <span key={skill.id} className="px-3.5 py-1.5 rounded-full bg-[rgba(249,112,102,0.1)] border border-[rgba(249,112,102,0.3)] text-[var(--accent-secondary)] text-[13px] font-medium hover:bg-[rgba(249,112,102,0.2)] transition-all cursor-default">
            {skill.name}
          </span>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-4">
      {skills.map(skill => (
        <div key={skill.id} className="flex flex-col items-start bg-[var(--bg-secondary)] border border-[var(--border-default)] p-2 rounded-xl">
          <div className="flex items-center gap-2 px-2 py-1 text-[var(--text-primary)] text-[13px] font-semibold cursor-default">
            {skill.name}
            <span className="text-[10px] text-[var(--accent-primary)] bg-[rgba(124,111,247,0.1)] px-1.5 py-0.5 rounded-md">✓ {skill.endorsements}</span>
          </div>
          <div className="px-2 pb-1">
            <Dots max={5} filled={skill.level} />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── MAIN PAGE ─── */
export default function Profile() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState(user);
  const [userSkills, setUserSkills] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loadingProfile, setLoadingProfile] = useState(false);

  useEffect(() => {
    let active = true;

    const fetchProfileData = async () => {
      setLoadingProfile(true);
      try {
        const [profileRes, skillsRes, matchesRes] = await Promise.allSettled([
          getProfile(),
          getUserSkills(),
          getMatches(),
        ]);

        if (!active) return;

        if (profileRes.status === 'fulfilled') {
          const profileData = unwrap(profileRes.value);
          if (profileData) {
            setProfile(profileData);
            updateUser?.(profileData);
          }
        }

        if (skillsRes.status === 'fulfilled') {
          setUserSkills(asArray(unwrap(skillsRes.value)));
        }

        if (matchesRes.status === 'fulfilled') {
          setMatches(asArray(unwrap(matchesRes.value)));
        }
      } finally {
        if (active) setLoadingProfile(false);
      }
    };

    fetchProfileData();

    return () => {
      active = false;
    };
  }, [updateUser]);

  const profileData = profile || user || {};
  const stats = profileData.profile || {};
  const displayName = pick(profileData.name, user?.name, MOCK.name);
  const initials = getInitials(displayName);
  const photoUrl = getAssetUrl(pick(profileData.photo, user?.photo));
  const headline = pick(profileData.headline, profileData.title, profileData.language && `${profileData.language} Speaker`, MOCK.headline);
  const location = pick(profileData.location, profileData.city, MOCK.location);
  const bio = pick(profileData.bio, MOCK.bio);
  const teachSkills = useMemo(() => {
    return userSkills
      .filter((item) => item?.skill_type === 'teach')
      .map(normalizeTeachSkill)
      .filter(Boolean);
  }, [userSkills]);
  const learnSkills = useMemo(() => {
    return userSkills
      .filter((item) => item?.skill_type === 'learn')
      .map(normalizeLearnSkill)
      .filter(Boolean);
  }, [userSkills]);
  const openAddSkills = (tab) => navigate(`/skills?tab=${tab}&add=1`);
  const experience = asArray(profileData.experience).length
    ? asArray(profileData.experience).map(normalizeExperience)
    : MOCK.experience;
  const education = asArray(profileData.education).length
    ? asArray(profileData.education).map(normalizeEducation)
    : MOCK.education;
  const connectionCount = formatCount(pick(profileData.connections_count, profileData.connection_count, profileData.followers_count), MOCK.connections);
  const matchCount = formatCount(pick(profileData.matches_count, matches.length || null), MOCK.matches);
  const completedSwaps = formatCount(pick(stats.total_sessions, profileData.posts_count, profileData.activity_count), '12');
  const avgRating = Number(stats.avg_rating);
  const ratingLabel = Number.isFinite(avgRating) && avgRating > 0 ? `${avgRating.toFixed(1)}★` : '4.9★';

  return (
    <AppLayout>
      <div className="max-w-[900px] mx-auto space-y-5">

        {/* ── CARD 1: HERO ── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="card-premium overflow-hidden">
          {/* Banner */}
          <div className="h-40 relative" style={{ background: 'var(--gradient-1)' }}>
            <div className="absolute inset-0 opacity-20 mix-blend-overlay bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
          </div>

          <div className="px-6 pb-6">
            {/* Avatar row */}
            <div className="flex items-end justify-between -mt-14 mb-4 relative z-10">
              <div className="w-28 h-28 rounded-full border-4 border-[var(--bg-card)] bg-[var(--bg-secondary)] flex items-center justify-center overflow-hidden shadow-xl">
                {photoUrl ? (
                  <img src={photoUrl} alt={displayName} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-[var(--gradient-2)] flex items-center justify-center text-white font-black text-3xl">
                    {initials}
                  </div>
                )}
              </div>
              <button className="mb-2 px-4 py-2 rounded-xl border border-[var(--border-default)] bg-[var(--bg-secondary)] text-[var(--text-primary)] text-[13px] font-medium hover:border-[var(--accent-primary)] hover:text-[var(--accent-primary)] transition-all flex items-center gap-1.5">
                <HiPencil size={14} /> Edit Profile
              </button>
            </div>

            {/* Identity */}
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-extrabold text-[var(--text-primary)]">{displayName}</h1>
              <HiBadgeCheck className="text-[var(--accent-primary)] w-5 h-5" />
            </div>
            <p className="text-[15px] text-[var(--text-secondary)] mb-3">
              {loadingProfile && !profile ? 'Loading profile...' : headline}
            </p>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-[var(--text-muted)] mb-5">
              <span className="flex items-center gap-1"><HiLocationMarker size={14} /> {location}</span>
              <span className="text-[var(--border-default)]">·</span>
              <span className="flex items-center gap-1"><HiGlobe size={14} /> Available for Remote Swaps</span>
            </div>

            <div className="flex items-center gap-2 text-[13px] mb-6 bg-[var(--bg-secondary)] w-fit px-4 py-2 rounded-xl border border-[var(--border-default)]">
              <span className="font-bold text-[var(--accent-primary)]">{connectionCount}</span>
              <span className="text-[var(--text-secondary)]">Connections</span>
              <span className="text-[var(--border-default)]">·</span>
              <span className="font-bold text-[var(--accent-secondary)]">{matchCount}</span>
              <span className="text-[var(--text-secondary)]">Skill Matches</span>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-3">
              <button className="btn-primary flex items-center gap-2 px-6">
                <HiUserAdd size={18} /> Connect
              </button>
              <button className="btn-ghost flex items-center gap-2 px-6">
                <HiChat size={18} /> Message
              </button>
              <button className="btn-ghost flex items-center gap-2 px-6">
                <HiLightningBolt size={18} /> Swap Skills
              </button>
              <button className="w-11 h-11 rounded-xl border border-[var(--border-default)] bg-[var(--bg-secondary)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--accent-primary)] transition-all flex items-center justify-center">
                <HiDotsHorizontal size={20} />
              </button>
            </div>
          </div>
        </motion.div>

        {/* ── CARD 2: ABOUT ── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <Card className="group">
            <CardHeader icon="📝" title="About" action={<EditBtn />} />
            <p className="text-[15px] text-[var(--text-secondary)] leading-relaxed">{bio}</p>
          </Card>
        </motion.div>

        {/* ── CARD 3: SKILLS I OFFER ── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
          <Card>
            <CardHeader icon="⚡" title="Skills I Can Teach" action={
              <button onClick={() => openAddSkills('teaching')} className="px-3 py-1.5 text-[12px] rounded-lg border border-[var(--accent-primary)] text-[var(--accent-primary)] font-medium hover:bg-[rgba(124,111,247,0.1)] transition-all flex items-center gap-1">
                <HiPlus size={13} /> Add Skill
              </button>
            } />
            <ProfileSkillsSection
              type="teach"
              skills={teachSkills}
              loading={loadingProfile}
              onAdd={() => openAddSkills('teaching')}
            />
          </Card>
        </motion.div>

        {/* ── CARD 4: SKILLS I WANT ── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardHeader icon="🎯" title="Skills I Want to Learn" action={
              <button onClick={() => openAddSkills('learning')} className="px-3 py-1.5 text-[12px] rounded-lg border border-[var(--accent-secondary)] text-[var(--accent-secondary)] font-medium hover:bg-[rgba(249,112,102,0.1)] transition-all flex items-center gap-1">
                <HiPlus size={13} /> Add Skill
              </button>
            } />
            <ProfileSkillsSection
              type="learn"
              skills={learnSkills}
              loading={loadingProfile}
              onAdd={() => openAddSkills('learning')}
            />
          </Card>
        </motion.div>

        {/* ── CARD 5: EXPERIENCE ── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}>
          <Card>
            <CardHeader icon="💼" title="Experience" action={<AddBtn />} />
            <div className="space-y-0">
              {experience.map((exp, i) => (
                <div key={i}>
                  <div className="flex gap-4 group py-2">
                    <div className="w-12 h-12 shrink-0 rounded-xl bg-[var(--bg-secondary)] flex items-center justify-center text-[var(--accent-primary)] font-bold text-sm border border-[var(--border-default)]">
                      {exp.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-[15px] font-bold text-[var(--text-primary)]">{exp.title}</p>
                          <p className="text-[14px] text-[var(--text-secondary)] font-medium">{exp.company} · {exp.type}</p>
                          <p className="text-[13px] text-[var(--text-muted)] mt-0.5">{exp.duration} · {exp.location}</p>
                        </div>
                        <EditBtn />
                      </div>
                      {exp.description && (
                        <p className="text-[14px] text-[var(--text-secondary)] leading-[1.65] mt-3 mb-3">{exp.description}</p>
                      )}
                      <div className="flex flex-wrap gap-1.5">
                        {exp.skills.map(s => (
                          <span key={s} className="px-2 py-0.5 rounded text-[11px] bg-[var(--bg-secondary)] border border-[var(--border-default)] text-[var(--text-muted)]">{s}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  {i < experience.length - 1 && <div className="h-px bg-[var(--border-default)] my-4" />}
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
              {education.map((edu, i) => (
                <div key={i}>
                  <div className="flex gap-4 group py-2">
                    <div className="w-12 h-12 shrink-0 rounded-xl bg-[var(--bg-secondary)] flex items-center justify-center text-[var(--accent-secondary)] font-bold text-xs border border-[var(--border-default)]">
                      {edu.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-[15px] font-bold text-[var(--text-primary)]">{edu.degree}</p>
                          <p className="text-[14px] text-[var(--text-secondary)] font-medium">{edu.institution}</p>
                          <p className="text-[13px] text-[var(--text-muted)] mt-0.5">{edu.years}</p>
                        </div>
                        <EditBtn />
                      </div>
                      {edu.description && (
                        <p className="text-[14px] text-[var(--text-secondary)] leading-[1.65] mt-3">{edu.description}</p>
                      )}
                    </div>
                  </div>
                  {i < education.length - 1 && <div className="h-px bg-[var(--border-default)] my-4" />}
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* ── CARD 7: SWAP HISTORY ── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}>
          <Card>
            <CardHeader icon="🔄" title="Swap History" />
            <p className="text-[13px] text-[var(--text-muted)] -mt-3 mb-5">Skills exchanged with the community</p>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              {[[completedSwaps, 'Swaps Completed'], [ratingLabel, 'Avg Rating'], ['8', 'Active Swaps']].map(([val, label]) => (
                <div key={label} className="rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-default)] p-4 text-center">
                  <p className="text-2xl font-bold text-[var(--accent-primary)]">{val}</p>
                  <p className="text-[11px] text-[var(--text-secondary)] mt-1 font-medium">{label}</p>
                </div>
              ))}
            </div>

            <div className="space-y-0">
              {MOCK.swaps.map((swap, i) => (
                <div key={i}>
                  <div className="flex items-center gap-4 py-4">
                    {/* Avatars with arrow */}
                    <div className="flex items-center gap-2 shrink-0 bg-[var(--bg-secondary)] border border-[var(--border-default)] px-2 py-1.5 rounded-full">
                      <div className="w-8 h-8 rounded-full bg-[var(--gradient-1)] flex items-center justify-center text-white text-xs font-bold shadow-sm">
                        WF
                      </div>
                      <span className="text-[var(--text-muted)] text-sm">⇄</span>
                      <div className="w-8 h-8 rounded-full bg-[var(--bg-card)] border border-[var(--border-default)] flex items-center justify-center text-[var(--text-primary)] text-xs font-bold">
                        {swap.initials}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0 ml-2">
                      <p className="text-[14px] text-[var(--text-primary)] font-medium">
                        Taught <span className="text-[var(--accent-primary)] font-bold">{swap.taught}</span> to {swap.partner} · Learned <span className="text-[var(--accent-secondary)] font-bold">{swap.learned}</span>
                      </p>
                      <p className="text-[12px] text-[var(--text-muted)] mt-1">{swap.date} · {swap.sessions} sessions</p>
                    </div>
                    <div className="shrink-0 flex flex-col items-end gap-1.5">
                      <Stars count={swap.rating} />
                      <StatusBadge status={swap.status} />
                    </div>
                  </div>
                  {i < MOCK.swaps.length - 1 && <div className="h-px bg-[var(--border-default)]" />}
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* ── CARD 8: AVAILABILITY ── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card>
            <CardHeader icon="📅" title="Availability" action={<EditBtn />} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="space-y-6">
                {/* Status */}
                <div>
                  <p className="text-[11px] text-[var(--text-muted)] uppercase tracking-wider mb-2 font-bold">Status</p>
                  <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[rgba(52,211,153,0.1)] border border-[rgba(52,211,153,0.3)] text-[var(--accent-green)] text-[13px] font-bold">
                    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" /> Open to Skill Swaps
                  </span>
                </div>

                {/* Session types */}
                <div>
                  <p className="text-[11px] text-[var(--text-muted)] uppercase tracking-wider mb-2 font-bold">Preferred Session Types</p>
                  <div className="flex flex-wrap gap-2">
                    {['1-on-1', 'Group', 'Async'].map(t => (
                      <span key={t} className="px-3 py-1.5 rounded-lg border border-[var(--border-default)] bg-[var(--bg-secondary)] text-[var(--text-secondary)] text-[12px] font-medium cursor-default">{t}</span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                {/* Schedule */}
                <div>
                  <p className="text-[11px] text-[var(--text-muted)] uppercase tracking-wider mb-2 font-bold">Weekly Availability</p>
                  <p className="text-[13px] text-[var(--text-primary)] flex items-center gap-2 font-medium bg-[var(--bg-secondary)] px-3 py-2 rounded-lg border border-[var(--border-default)] w-fit"><HiCalendar size={16} className="text-[var(--accent-primary)]" /> Weekends · Evenings (IST)</p>
                </div>
                
                {/* Communication */}
                <div>
                  <p className="text-[11px] text-[var(--text-muted)] uppercase tracking-wider mb-2 font-bold">Communication Tools</p>
                  <div className="flex flex-wrap gap-2">
                    {[['Video Call', HiVideoCamera], ['Chat', HiChat], ['Screen Share', HiDesktopComputer]].map(([label, Icon]) => (
                      <span key={label} className="px-3 py-1.5 rounded-lg border border-[var(--border-default)] bg-[var(--bg-secondary)] text-[var(--text-secondary)] text-[12px] font-medium flex items-center gap-1.5 cursor-default">
                        <Icon size={14} className="text-[var(--accent-secondary)]" /> {label}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          </Card>
        </motion.div>

      </div>
    </AppLayout>
  );
}
