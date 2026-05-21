import { useEffect, useState, useMemo } from 'react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { HiPlus, HiSearch, HiLightningBolt, HiRefresh, HiX, HiCheck, HiSparkles, HiChevronRight } from 'react-icons/hi';
import AppLayout from '../components/layout/AppLayout';
import SkillPill from '../components/ui/SkillPill';
import Button from '../components/ui/Button';
import { SkeletonLine } from '../components/ui/SkeletonCard';
import { getAllSkills, getUserSkills, addSkill, deleteSkill } from '../api/skills';

const TABS = ['teaching', 'learning'];

export default function Skills() {
  const [activeTab, setActiveTab] = useState('teaching');
  const [userSkills, setUserSkills] = useState([]);
  const [allSkills, setAllSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [search, setSearch] = useState('');
  const [addingId, setAddingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(false);
    try {
      const [userRes, allRes] = await Promise.all([getUserSkills(), getAllSkills()]);
      setUserSkills(userRes.data || []);
      setAllSkills(allRes.data || []);
    } catch {
      setError(true);
      toast.error('Sync failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const currentSkills = userSkills.filter((s) => s.skill_type === activeTab);
  const currentSkillIds = new Set(userSkills.map((s) => s.skill.id));

  const filteredGrouped = useMemo(() => {
    const lower = search.toLowerCase();
    const filtered = allSkills.filter((s) => s.name.toLowerCase().includes(lower));
    return filtered.reduce((acc, skill) => {
      const cat = skill.category || 'Other';
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(skill);
      return acc;
    }, {});
  }, [allSkills, search]);

  const handleDelete = async (userSkillId) => {
    const prev = [...userSkills];
    setUserSkills((p) => p.filter((s) => s.id !== userSkillId));
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
    if (currentSkillIds.has(skill.id)) return;
    
    setAddingId(skill.id);
    const optimistic = { id: `temp-${skill.id}`, skill, skill_type: activeTab };
    setUserSkills((p) => [...p, optimistic]);
    try {
      const res = await addSkill(skill.id, activeTab);
      setUserSkills((p) => p.map((s) => s.id === optimistic.id ? res.data : s));
      toast.success(`${skill.name} added`);
    } catch {
      setUserSkills((p) => p.filter((s) => s.id !== optimistic.id));
      toast.error('Failed to add');
    } finally {
      setAddingId(null);
    }
  };

  return (
    <AppLayout>
      <div className="w-full space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 card-premium p-4">
          <h1 className="text-2xl font-bold text-[var(--text-primary)] ml-2">
            Skills & Expertise
          </h1>
          
          <div className="flex bg-[var(--bg-secondary)] p-1 rounded-xl border border-[var(--border-default)]">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => { setActiveTab(tab); setShowAdd(false); setSearch(''); }}
                className={`
                  px-8 py-2 rounded-lg text-sm font-bold transition-all capitalize tracking-wider
                  ${activeTab === tab
                    ? 'bg-[var(--accent-primary)] text-white shadow-sm'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }
                `}
              >
                {tab}
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
                        {activeTab} Index
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
                  ) : currentSkills.length === 0 ? (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center py-24 flex flex-col items-center"
                    >
                      <div className="w-20 h-20 bg-[var(--bg-secondary)] rounded-2xl flex items-center justify-center text-[var(--text-muted)] mb-6">
                        <HiLightningBolt size={48} />
                      </div>
                      <p className="text-[var(--text-secondary)] font-medium text-lg mb-8">Your {activeTab} repository is empty.</p>
                      <Button onClick={() => setShowAdd(true)} variant="outline">Add Skills</Button>
                    </motion.div>
                  ) : (
                    <div className="flex flex-wrap gap-4">
                      {currentSkills.map((us) => (
                        <motion.div
                          key={us.id}
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.8, opacity: 0 }}
                          layout
                        >
                          <SkillPill
                            name={us.skill.name}
                            type={activeTab}
                            onDelete={deletingId === us.id ? undefined : () => handleDelete(us.id)}
                          />
                        </motion.div>
                      ))}
                    </div>
                  )}
                </AnimatePresence>
              </motion.div>
           </div>

           {/* Add/Search Column */}
           <div className="space-y-6">
              <motion.div 
                animate={{ opacity: showAdd ? 1 : 0.6, y: showAdd ? 0 : 20 }}
                className={`card-premium p-6 ${!showAdd && 'pointer-events-none grayscale'}`}
              >
                 <div className="flex items-center justify-between mb-6">
                    <h3 className="text-sm font-bold text-[var(--text-muted)] uppercase tracking-wider">Browse Skills</h3>
                    <button onClick={() => setShowAdd(false)} className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
                       <HiX size={22} />
                    </button>
                 </div>

                 <div className="relative mb-6">
                   <HiSearch size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                   <input
                     type="text"
                     placeholder="Search skills..."
                     value={search}
                     onChange={(e) => setSearch(e.target.value)}
                     className="w-full bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-xl py-2.5 pl-11 pr-4 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)] transition-all"
                   />
                 </div>

                 <div className="max-h-[450px] overflow-y-auto space-y-6 pr-2 custom-scrollbar">
                   {Object.keys(filteredGrouped).length === 0 ? (
                     <div className="text-center py-12">
                        <p className="text-[var(--text-secondary)] font-medium">No skills found.</p>
                     </div>
                   ) : (
                     Object.entries(filteredGrouped).map(([category, skills]) => (
                       <div key={category} className="space-y-3">
                         <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider border-b border-[var(--border-default)] pb-2">
                           {category}
                         </p>
                         <div className="flex flex-col gap-1">
                           {skills.slice(0, 10).map((skill) => {
                             const alreadyHas = currentSkillIds.has(skill.id);
                             return (
                               <button
                                 key={skill.id}
                                 disabled={addingId === skill.id || alreadyHas}
                                 onClick={() => handleAdd(skill)}
                                 className={`
                                   flex items-center justify-between w-full px-4 py-2.5 rounded-xl text-sm font-medium transition-all
                                   ${alreadyHas
                                     ? 'text-[var(--accent-green)] bg-[rgba(52,211,153,0.08)] cursor-default'
                                     : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]'
                                   }
                                   ${addingId === skill.id ? 'animate-pulse' : ''}
                                 `}
                               >
                                 <span className="truncate">{skill.name}</span>
                                 {alreadyHas ? <HiCheck size={18} /> : <HiPlus size={18} className="text-[var(--text-muted)]" />}
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


