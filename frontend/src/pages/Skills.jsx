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
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h1 className="text-4xl lg:text-5xl font-display font-black text-coffee-500 tracking-tight mb-2">
              Identity & Expertise
            </h1>
            <p className="text-coffee-300 font-bold text-lg">Define the knowledge you possess and the areas you wish to explore.</p>
          </motion.div>
          
          <div className="flex bg-coffee-500/5 p-1.5 rounded-2xl border border-coffee-500/5">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => { setActiveTab(tab); setShowAdd(false); setSearch(''); }}
                className={`
                  px-10 py-3 rounded-xl text-sm font-black transition-all capitalize tracking-wider uppercase
                  ${activeTab === tab
                    ? 'bg-coffee-500 text-cream-100 shadow-xl shadow-coffee-500/20'
                    : 'text-coffee-300 hover:text-coffee-500'
                  }
                `}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
           {/* Current List Column */}
           <div className="lg:col-span-2">
              <motion.div 
                layout
                className="card-premium !p-8 min-h-[500px]"
              >
                <div className="flex items-center justify-between border-b border-coffee-500/5 pb-6 mb-8">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-coffee-500 rounded-xl flex items-center justify-center text-cream-100">
                        <HiSparkles size={20} />
                      </div>
                      <h2 className="text-2xl font-display font-black text-coffee-500 capitalize">
                        {activeTab} Index
                      </h2>
                   </div>
                   {!showAdd && (
                     <Button
                      size="sm"
                      onClick={() => setShowAdd(true)}
                      className="gap-2 !rounded-xl"
                    >
                      <HiPlus size={18} /> Expand List
                    </Button>
                   )}
                </div>

                <AnimatePresence mode="popLayout">
                  {loading ? (
                    <div className="flex flex-wrap gap-4">
                      {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="h-10 w-36 bg-coffee-500/5 animate-pulse rounded-full" />
                      ))}
                    </div>
                  ) : currentSkills.length === 0 ? (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center py-24 flex flex-col items-center"
                    >
                      <div className="w-20 h-20 bg-coffee-500/5 rounded-[32px] flex items-center justify-center text-coffee-200 mb-6">
                        <HiLightningBolt size={48} />
                      </div>
                      <p className="text-coffee-300 font-bold text-lg mb-8">Your {activeTab} repository is empty.</p>
                      <Button onClick={() => setShowAdd(true)} variant="outline">Initialize Skills</Button>
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
           <div className="space-y-8">
              <motion.div 
                animate={{ opacity: showAdd ? 1 : 0.6, y: showAdd ? 0 : 20 }}
                className={`card-premium !p-8 ${!showAdd && 'pointer-events-none grayscale'}`}
              >
                 <div className="flex items-center justify-between mb-8">
                    <h3 className="text-sm font-black text-coffee-200 uppercase tracking-[0.2em]">Acquire Skills</h3>
                    <button onClick={() => setShowAdd(false)} className="text-coffee-200 hover:text-coffee-500 transition-colors">
                       <HiX size={24} />
                    </button>
                 </div>

                 <div className="relative mb-8">
                   <HiSearch size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-coffee-200" />
                   <input
                     type="text"
                     placeholder="Search the directory..."
                     value={search}
                     onChange={(e) => setSearch(e.target.value)}
                     className="input-premium pl-12"
                   />
                 </div>

                 <div className="max-h-[450px] overflow-y-auto space-y-8 pr-2 custom-scrollbar">
                   {Object.keys(filteredGrouped).length === 0 ? (
                     <div className="text-center py-12">
                        <p className="text-coffee-300 font-bold">No skills detected.</p>
                     </div>
                   ) : (
                     Object.entries(filteredGrouped).map(([category, skills]) => (
                       <div key={category} className="space-y-4">
                         <p className="text-[10px] font-black text-coffee-200 uppercase tracking-[0.2em] border-b border-coffee-500/5 pb-2">
                           {category}
                         </p>
                         <div className="flex flex-col gap-2">
                           {skills.slice(0, 10).map((skill) => {
                             const alreadyHas = currentSkillIds.has(skill.id);
                             return (
                               <button
                                 key={skill.id}
                                 disabled={addingId === skill.id || alreadyHas}
                                 onClick={() => handleAdd(skill)}
                                 className={`
                                   flex items-center justify-between w-full px-4 py-3 rounded-2xl text-sm font-bold transition-all
                                   ${alreadyHas
                                     ? 'text-green-600 bg-green-500/5 cursor-default'
                                     : 'text-coffee-300 hover:bg-coffee-500/5 hover:text-coffee-500'
                                   }
                                   ${addingId === skill.id ? 'animate-pulse' : ''}
                                 `}
                               >
                                 <span className="truncate">{skill.name}</span>
                                 {alreadyHas ? <HiCheck size={18} /> : <HiPlus size={18} className="text-coffee-200" />}
                               </button>
                             );
                           })}
                         </div>
                       </div>
                     ))
                   )}
                 </div>
              </motion.div>

              <div className="card-premium !p-8 bg-coffee-500 text-cream-100 border-none">
                 <h3 className="text-xl font-display font-black mb-4">Skill Assessment</h3>
                 <p className="text-sm text-cream-100/60 font-bold mb-8 leading-relaxed">Validate your expertise with peer reviews to increase your match accuracy by 45%.</p>
                 <Button variant="secondary" fullWidth size="md">Get Verified</Button>
              </div>
           </div>
        </div>
      </div>
    </AppLayout>
  );
}

