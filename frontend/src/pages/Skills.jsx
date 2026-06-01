import { useEffect, useState, useMemo } from 'react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { HiArrowLeft, HiCheck, HiPlus, HiSearch, HiLightningBolt, HiX, HiSparkles } from 'react-icons/hi';
import AppLayout from '../components/layout/AppLayout';
import Button from '../components/ui/Button';
import { getAllSkills, getUserSkills, addSkill, deleteSkill } from '../api/skills';

const TABS = ['teaching', 'learning'];
const unwrap = (response) => response?.data?.data ?? response?.data ?? [];
const TAB_META = {
  teaching: {
    label: 'Teaching',
    apiType: 'teach',
    accent: 'primary',
    empty: 'Your teaching repository is empty.',
    selected: 'Teaching skill',
  },
  learning: {
    label: 'Learning',
    apiType: 'learn',
    accent: 'secondary',
    empty: 'Your learning repository is empty.',
    selected: 'Learning skill',
  },
};
const SKILL_TYPE_LABEL = {
  teach: 'Teaching',
  learn: 'Learning',
};

const getSkillId = (item) => item?.skill?.id || item?.skill_id || item?.id;
const getSkillName = (item) => item?.skill?.name || item?.name || 'Untitled skill';
const getSkillCategory = (item) => item?.skill?.category || item?.category || 'Other';
const matchesSkillSearch = (item, query) => {
  if (!query) return true;
  const name = getSkillName(item).toLowerCase();
  const category = getSkillCategory(item).toLowerCase();
  return name.includes(query) || category.includes(query);
};

const normalizeUserSkill = (item) => {
  if (!item) return null;
  const skillId = item?.skill?.id || item?.skill_id || item?.skill?.skill_id || item?.skill?.uuid || item?.skill?.pk || item?.id;
  const skillName = item?.skill?.name || item?.name;
  const skillType = item?.skill_type;

  if (!skillId || !skillType) return null;

  return {
    ...item,
    id: item?.id || `${skillType}-${skillId}`,
    skill_type: skillType,
    skill: {
      ...(item?.skill || {}),
      id: skillId,
      name: skillName || item?.skill?.name || 'Untitled skill',
      category: item?.skill?.category || item?.category || 'Other',
    },
  };
};

const normalizeUserSkills = (skills) => {
  const normalized = (Array.isArray(skills) ? skills : [])
    .map(normalizeUserSkill)
    .filter(Boolean);
  const byKey = new Map();

  normalized.forEach((userSkill) => {
    byKey.set(`${userSkill.skill_type}:${userSkill.skill.id}`, userSkill);
  });

  return Array.from(byKey.values());
};

const buildSelectedSkillIds = (skills) => {
  return skills.reduce((acc, userSkill) => {
    const skillId = userSkill?.skill?.id;
    const skillType = userSkill?.skill_type;
    if (!skillId || !acc[skillType]) return acc;
    acc[skillType].add(skillId);
    return acc;
  }, { teach: new Set(), learn: new Set() });
};

const getOppositeSkillType = (skillType) => skillType === 'teach' ? 'learn' : 'teach';

const getSkillUsageState = (skill, selectedSkillIds, activeSkillType) => {
  const skillId = getSkillId(skill);
  const otherSkillType = getOppositeSkillType(activeSkillType);
  const isSelectedHere = Boolean(skillId && selectedSkillIds[activeSkillType]?.has(skillId));
  const isSelectedElsewhere = Boolean(skillId && selectedSkillIds[otherSkillType]?.has(skillId));
  const otherLabel = SKILL_TYPE_LABEL[otherSkillType];

  return {
    isSelectedHere,
    isSelectedElsewhere,
    isDisabled: isSelectedHere || isSelectedElsewhere,
    label: isSelectedHere ? 'Selected' : isSelectedElsewhere ? `Already in ${otherLabel}` : 'Available',
  };
};

const getSkillButtonClass = (usageState, isAdding) => {
  const base = 'group flex items-center justify-between gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium transition-all border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)] focus-visible:ring-offset-0';

  if (usageState.isSelectedHere) {
    return `${base} border-[rgba(52,211,153,0.45)] bg-[rgba(52,211,153,0.14)] text-[var(--accent-green)] cursor-default shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] ${isAdding ? 'animate-pulse' : ''}`;
  }

  if (usageState.isSelectedElsewhere) {
    return `${base} border-[rgba(249,112,102,0.42)] bg-[rgba(249,112,102,0.10)] text-[var(--text-secondary)] cursor-not-allowed ${isAdding ? 'animate-pulse' : ''}`;
  }

  return `${base} border-transparent text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] hover:border-[var(--border-default)] ${isAdding ? 'animate-pulse' : ''}`;
};

const mergeUserSkill = (skills, nextSkill) => {
  const normalizedNext = normalizeUserSkill(nextSkill);
  if (!normalizedNext) return normalizeUserSkills(skills);

  return normalizeUserSkills([
    ...normalizeUserSkills(skills).filter((item) => (
      item.skill.id !== normalizedNext.skill.id || item.skill_type !== normalizedNext.skill_type
    )),
    normalizedNext,
  ]);
};

const removeUserSkill = (skills, userSkillId) => {
  return normalizeUserSkills(skills).filter((item) => item.id !== userSkillId);
};

function SkillStatusBadge({ usageState }) {
  const className = usageState.isSelectedHere
    ? 'border-[rgba(52,211,153,0.48)] bg-[rgba(52,211,153,0.16)] text-[var(--accent-green)]'
    : usageState.isSelectedElsewhere
      ? 'border-[rgba(249,112,102,0.46)] bg-[rgba(249,112,102,0.14)] text-[var(--accent-secondary)]'
      : 'border-[rgba(124,111,247,0.36)] bg-[rgba(124,111,247,0.10)] text-[var(--accent-primary)]';

  return (
    <span className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-bold leading-none ${className}`}>
      {usageState.isSelectedHere && <HiCheck size={12} />}
      {usageState.label}
    </span>
  );
}

function CurrentSkillCard({ userSkill, activeTab, deleting, onDelete }) {
  const meta = TAB_META[activeTab];
  const skill = userSkill?.skill || {};
  const isTeaching = activeTab === 'teaching';
  const badgeClass = isTeaching
    ? 'border-[rgba(124,111,247,0.40)] bg-[rgba(124,111,247,0.12)] text-[var(--accent-primary)]'
    : 'border-[rgba(249,112,102,0.40)] bg-[rgba(249,112,102,0.12)] text-[var(--accent-secondary)]';

  return (
    <motion.div
      key={userSkill.id}
      initial={{ scale: 0.96, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.96, opacity: 0 }}
      layout
      className="group flex items-center justify-between gap-3 rounded-xl border border-[var(--border-default)] bg-[var(--bg-secondary)] px-4 py-3 transition-all hover:border-[var(--accent-primary)] hover:bg-[var(--bg-hover)]"
    >
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-bold text-[var(--text-primary)]">{getSkillName(skill)}</p>
          <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-bold leading-none ${badgeClass}`}>
            {meta.selected}
          </span>
        </div>
        <p className="mt-1 text-[11px] font-medium capitalize text-[var(--text-muted)]">{getSkillCategory(skill)}</p>
      </div>
      <button
        type="button"
        onClick={onDelete}
        disabled={deleting}
        className="h-8 w-8 shrink-0 rounded-lg border border-[var(--border-default)] text-[var(--text-muted)] opacity-80 transition-all hover:border-[var(--accent-secondary)] hover:text-[var(--accent-secondary)] disabled:cursor-wait disabled:opacity-40 md:opacity-0 md:group-hover:opacity-100"
        aria-label={`Remove ${getSkillName(skill)}`}
      >
        <HiX size={16} className="mx-auto" />
      </button>
    </motion.div>
  );
}

export default function Skills() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialTab = TABS.includes(searchParams.get('tab')) ? searchParams.get('tab') : 'teaching';
  const [activeTab, setActiveTab] = useState(initialTab);
  const [userSkills, setUserSkills] = useState([]);
  const [allSkills, setAllSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(searchParams.get('add') === '1');
  const [search, setSearch] = useState('');
  const [addingId, setAddingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    let active = true;

    const fetchData = async () => {
      setLoading(true);
      try {
        const [userRes, allRes] = await Promise.all([getUserSkills(), getAllSkills()]);
        if (!active) return;
        setUserSkills(normalizeUserSkills(unwrap(userRes)));
        setAllSkills(Array.isArray(unwrap(allRes)) ? unwrap(allRes) : []);
      } catch {
        if (active) toast.error('Sync failed');
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchData();

    return () => {
      active = false;
    };
  }, []);

  const activeMeta = TAB_META[activeTab];
  const activeSkillType = activeMeta.apiType;
  const normalizedUserSkills = useMemo(() => normalizeUserSkills(userSkills), [userSkills]);
  const selectedSkillIds = useMemo(() => buildSelectedSkillIds(normalizedUserSkills), [normalizedUserSkills]);
  const normalizedSearch = useMemo(() => search.trim().toLowerCase(), [search]);
  const currentSkills = useMemo(
    () => normalizedUserSkills.filter((s) => s?.skill_type === activeSkillType),
    [activeSkillType, normalizedUserSkills],
  );
  const filteredCurrentSkills = useMemo(
    () => currentSkills.filter((skill) => matchesSkillSearch(skill, normalizedSearch)),
    [currentSkills, normalizedSearch],
  );

  const filteredGrouped = useMemo(() => {
    const filtered = allSkills.filter((skill) => matchesSkillSearch(skill, normalizedSearch));
    return filtered.reduce((acc, skill) => {
      const cat = getSkillCategory(skill);
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(skill);
      return acc;
    }, {});
  }, [allSkills, normalizedSearch]);
  const visibleSkillCount = useMemo(() => {
    return Object.values(filteredGrouped).reduce((sum, skills) => sum + skills.length, 0);
  }, [filteredGrouped]);
  const availableSkillCount = useMemo(() => {
    return Object.values(filteredGrouped).reduce((sum, skills) => {
      return sum + skills.filter((skill) => !getSkillUsageState(skill, selectedSkillIds, activeSkillType).isDisabled).length;
    }, 0);
  }, [activeSkillType, filteredGrouped, selectedSkillIds]);

  const handleDelete = async (userSkillId) => {
    const prev = normalizedUserSkills;
    setUserSkills((p) => removeUserSkill(p, userSkillId));
    setDeletingId(userSkillId);
    try {
      await deleteSkill(userSkillId);
      toast.success('Skill removed');
    } catch {
      setUserSkills(prev);
      toast.error('Failed to remove');
    } finally {
      setDeletingId(null);
    }
  };

  const handleAdd = async (skill) => {
    const usageState = getSkillUsageState(skill, selectedSkillIds, activeSkillType);
    if (usageState.isDisabled) return;
    
    const skillId = getSkillId(skill);
    setAddingId(skillId);
    const optimistic = { id: `temp-${activeSkillType}-${skillId}`, skill, skill_type: activeSkillType };
    setUserSkills((p) => mergeUserSkill(p, optimistic));
    try {
      const res = await addSkill(skillId, activeSkillType);
      const savedSkill = normalizeUserSkill(unwrap(res));
      setUserSkills((p) => mergeUserSkill(removeUserSkill(p, optimistic.id), savedSkill || optimistic));
      toast.success(`${getSkillName(skill)} added`);
    } catch {
      setUserSkills((p) => removeUserSkill(p, optimistic.id));
      toast.error('Failed to add');
    } finally {
      setAddingId(null);
    }
  };

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }
    navigate('/profile');
  };

  return (
    <AppLayout>
      <div className="w-full space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 card-premium p-4">
          <div className="flex items-center gap-3">
            <button
              onClick={handleBack}
              className="w-10 h-10 shrink-0 rounded-xl border border-[var(--border-default)] bg-[var(--bg-secondary)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--accent-primary)] transition-all flex items-center justify-center"
              aria-label="Go back"
            >
              <HiArrowLeft size={18} />
            </button>
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">
              Skills & Expertise
            </h1>
          </div>
          
          <div className="flex bg-[var(--bg-secondary)] p-1 rounded-xl border border-[var(--border-default)]">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => { setActiveTab(tab); setSearch(''); }}
                className={`
                  px-8 py-2 rounded-lg text-sm font-bold transition-all tracking-wider
                  ${activeTab === tab
                    ? 'bg-[var(--accent-primary)] text-white shadow-sm'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }
                `}
              >
                {TAB_META[tab].label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
           {/* Current List Column */}
           <div className="lg:col-span-2">
              <motion.div 
                layout
                className="card-premium p-6 min-h-[500px]"
              >
                <div className="flex items-center justify-between border-b border-[var(--border-default)] pb-5 mb-6">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[var(--accent-primary)] rounded-xl flex items-center justify-center text-white">
                        <HiSparkles size={20} />
                      </div>
                      <h2 className="text-xl font-bold text-[var(--text-primary)] capitalize">
                        {activeMeta.label} Index
                      </h2>
                   </div>
                   {!showAdd && (
                     <Button
                      size="sm"
                      onClick={() => setShowAdd(true)}
                      className="gap-2 !rounded-xl"
                    >
                      <HiPlus size={18} /> Add Skills
                    </Button>
                   )}
                </div>

                <AnimatePresence mode="popLayout">
                  {loading ? (
                    <div className="flex flex-wrap gap-4">
                      {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="h-10 w-36 bg-[var(--bg-secondary)] animate-pulse rounded-full" />
                      ))}
                    </div>
                  ) : filteredCurrentSkills.length === 0 ? (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center py-24 flex flex-col items-center"
                    >
                      <div className="w-20 h-20 bg-[var(--bg-secondary)] rounded-2xl flex items-center justify-center text-[var(--text-muted)] mb-6">
                        <HiLightningBolt size={48} />
                      </div>
                      <p className="text-[var(--text-secondary)] font-medium text-lg mb-8">
                        {currentSkills.length === 0 ? activeMeta.empty : 'No skills match your search.'}
                      </p>
                      {currentSkills.length === 0 ? (
                        <Button onClick={() => setShowAdd(true)} variant="outline">Add Skills</Button>
                      ) : null}
                    </motion.div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {filteredCurrentSkills.map((us) => (
                        <CurrentSkillCard
                          key={us.id}
                          userSkill={us}
                          activeTab={activeTab}
                          deleting={deletingId === us.id}
                          onDelete={() => handleDelete(us.id)}
                        />
                      ))}
                    </div>
                  )}
                </AnimatePresence>
              </motion.div>
           </div>

           {/* Add/Search Column */}
           <div className="space-y-6 min-h-0">
              <motion.div 
                animate={{ opacity: showAdd ? 1 : 0.6, y: showAdd ? 0 : 20 }}
                className={`card-premium p-6 flex flex-col min-h-[360px] ${!showAdd && 'pointer-events-none grayscale'}`}
              >
                 <div className="flex items-center justify-between mb-6 shrink-0">
                    <div>
                      <h3 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider">Browse Skills</h3>
                      <p className="mt-1 text-[11px] font-medium text-[var(--text-muted)]">
                        {filteredCurrentSkills.length} shown · {currentSkills.length} selected · {availableSkillCount} available
                      </p>
                    </div>
                    <button onClick={() => setShowAdd(false)} className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
                       <HiX size={22} />
                    </button>
                 </div>

                 <div className="relative mb-6 shrink-0">
                   <HiSearch size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                   <input
                     type="text"
                     placeholder="Search skills..."
                     value={search}
                     onChange={(e) => setSearch(e.target.value)}
                     className="w-full bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-xl py-2.5 pl-11 pr-4 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)] transition-all"
                   />
                 </div>

                 <div className="mb-4 grid grid-cols-2 gap-2 shrink-0">
                   <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-secondary)] px-3 py-2">
                     <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Visible</p>
                     <p className="mt-1 text-lg font-black text-[var(--text-primary)]">{visibleSkillCount}</p>
                   </div>
                   <div className="rounded-xl border border-[rgba(124,111,247,0.28)] bg-[rgba(124,111,247,0.08)] px-3 py-2">
                     <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Can Add</p>
                     <p className="mt-1 text-lg font-black text-[var(--accent-primary)]">{availableSkillCount}</p>
                   </div>
                 </div>

                 <div className="min-h-[220px] max-h-[min(58vh,560px)] overflow-y-auto overscroll-contain touch-pan-y scroll-smooth space-y-6 pr-2 pb-6 custom-scrollbar [scrollbar-gutter:stable]">
                   {Object.keys(filteredGrouped).length === 0 ? (
                     <div className="text-center py-12">
                        <p className="text-[var(--text-secondary)] font-medium">No skills found.</p>
                     </div>
                   ) : (
                     Object.entries(filteredGrouped).map(([category, skills]) => (
                       <div key={category} className="space-y-3">
                         <div className="flex items-center justify-between border-b border-[var(--border-default)] pb-2">
                           <p className="text-[10px] font-bold text-[var(--text-primary)] uppercase tracking-wider">
                             {category}
                           </p>
                           <span className="rounded-full border border-[var(--border-default)] bg-[var(--bg-secondary)] px-2 py-0.5 text-[10px] font-bold text-[var(--text-muted)]">
                             {skills.length}
                           </span>
                         </div>
                         <div className="flex flex-col gap-1">
                           {skills.slice(0, 10).map((skill) => {
                             const usageState = getSkillUsageState(skill, selectedSkillIds, activeSkillType);
                             const skillId = getSkillId(skill);
                             const isAdding = addingId === skillId;
                             const disabled = isAdding || usageState.isDisabled;
                             return (
                               <button
                                 key={skillId}
                                 disabled={disabled}
                                 onClick={() => handleAdd(skill)}
                                 className={getSkillButtonClass(usageState, isAdding)}
                               >
                                 <span className="min-w-0 flex-1 truncate text-left">{getSkillName(skill)}</span>
                                 <span className="flex shrink-0 items-center gap-2">
                                   <SkillStatusBadge usageState={usageState} />
                                   {!usageState.isDisabled && (
                                     <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-[var(--border-default)] text-[var(--text-muted)] transition-all group-hover:border-[var(--accent-primary)] group-hover:text-[var(--accent-primary)]">
                                       <HiPlus size={16} />
                                     </span>
                                   )}
                                 </span>
                               </button>
                             );
                           })}
                         </div>
                       </div>
                     ))
                   )}
                 </div>
              </motion.div>

              <div className="card-premium p-6" style={{ background: 'var(--gradient-1)' }}>
                 <h3 className="text-xl font-bold text-white mb-3">Skill Assessment</h3>
                 <p className="text-sm text-white/60 font-medium mb-6 leading-relaxed">Validate your expertise with peer reviews to increase your match accuracy by 45%.</p>
                 <Button variant="secondary" fullWidth size="md">Get Verified</Button>
              </div>
           </div>
        </div>
      </div>
    </AppLayout>
  );
}
