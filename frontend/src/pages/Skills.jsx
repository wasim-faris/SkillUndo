import { useEffect, useState, useMemo } from 'react';
import toast from 'react-hot-toast';
import { HiPlus, HiSearch, HiLightningBolt, HiRefresh, HiX, HiCheck } from 'react-icons/hi';
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
      <div className="max-w-[1128px] mx-auto space-y-6 py-4">
        {/* Header Section */}
        <div className="bg-white border border-neutral-200 rounded-lg p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-[24px] font-bold text-black tracking-tight">Identity & Skills</h1>
            <p className="text-neutral-500 font-medium text-[14px]">Define your professional expertise and learning objectives.</p>
          </div>
          
          <div className="flex bg-[#f3f2ef] p-1 rounded-md border border-neutral-200">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => { setActiveTab(tab); setShowAdd(false); setSearch(''); }}
                className={`
                  px-8 py-2 rounded-md text-[14px] font-bold transition-all capitalize
                  ${activeTab === tab
                    ? 'bg-white text-[#0a66c2] shadow-sm'
                    : 'text-neutral-600 hover:text-black'
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
              <div className="bg-white border border-neutral-200 rounded-lg p-6 space-y-8 min-h-[400px]">
                <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
                   <h2 className="text-[18px] font-bold text-black capitalize">
                     {activeTab} Skills
                   </h2>
                   {!showAdd && (
                     <Button
                      size="sm"
                      onClick={() => setShowAdd(true)}
                      className="gap-2"
                    >
                      <HiPlus size={16} /> Add skill
                    </Button>
                   )}
                </div>

                {loading ? (
                  <div className="flex flex-wrap gap-3">
                    {[1, 2, 3, 4, 5].map((i) => <div key={i} className="h-9 w-32 bg-neutral-100 animate-pulse rounded-full" />)}
                  </div>
                ) : currentSkills.length === 0 ? (
                  <div className="text-center py-20 flex flex-col items-center">
                    <HiLightningBolt size={48} className="text-neutral-100 mb-4" />
                    <p className="text-neutral-500 font-bold">You haven&apos;t added any {activeTab} skills yet.</p>
                    <button onClick={() => setShowAdd(true)} className="text-[#0a66c2] font-bold hover:underline mt-2">Start adding now</button>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-3">
                    {currentSkills.map((us) => (
                      <SkillPill
                        key={us.id}
                        name={us.skill.name}
                        type={activeTab}
                        onDelete={deletingId === us.id ? undefined : () => handleDelete(us.id)}
                      />
                    ))}
                  </div>
                )}
              </div>
           </div>

           {/* Add/Search Column */}
           <div className="space-y-6">
              <div className={`bg-white border border-neutral-200 rounded-lg p-6 space-y-6 transition-all ${showAdd ? 'opacity-100 translate-y-0' : 'opacity-50 pointer-events-none grayscale translate-y-4'}`}>
                 <div className="flex items-center justify-between">
                    <h3 className="text-[16px] font-bold text-black">Find New Skills</h3>
                    <button onClick={() => setShowAdd(false)} className="text-neutral-400 hover:text-black">
                       <HiX size={20} />
                    </button>
                 </div>

                 <div className="relative">
                   <HiSearch size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                   <input
                     type="text"
                     placeholder="Search for a skill..."
                     value={search}
                     onChange={(e) => setSearch(e.target.value)}
                     className="w-full bg-[#f9fafb] border border-neutral-300 rounded-md pl-10 pr-4 py-2 text-[14px] text-black outline-none focus:border-[#0a66c2]"
                   />
                 </div>

                 <div className="max-h-[500px] overflow-y-auto space-y-6 pr-1 custom-scrollbar">
                   {Object.keys(filteredGrouped).length === 0 ? (
                     <div className="text-center py-10">
                        <p className="text-neutral-400 text-sm">No results found.</p>
                     </div>
                   ) : (
                     Object.entries(filteredGrouped).map(([category, skills]) => (
                       <div key={category} className="space-y-3">
                         <p className="text-[11px] font-black text-neutral-400 uppercase tracking-widest border-b border-neutral-50 pb-1">
                           {category}
                         </p>
                         <div className="flex flex-col gap-1">
                           {skills.slice(0, 15).map((skill) => {
                             const alreadyHas = currentSkillIds.has(skill.id);
                             return (
                               <button
                                 key={skill.id}
                                 disabled={addingId === skill.id || alreadyHas}
                                 onClick={() => handleAdd(skill)}
                                 className={`
                                   flex items-center justify-between w-full px-3 py-2 rounded-md text-[13px] font-bold transition-all
                                   ${alreadyHas
                                     ? 'text-emerald-600 bg-emerald-50 cursor-default'
                                     : 'text-neutral-600 hover:bg-neutral-100'
                                   }
                                   ${addingId === skill.id ? 'animate-pulse' : ''}
                                 `}
                               >
                                 <span className="truncate">{skill.name}</span>
                                 {alreadyHas ? <HiCheck size={16} /> : <HiPlus size={16} className="text-neutral-300" />}
                               </button>
                             );
                           })}
                         </div>
                       </div>
                     ))
                   )}
                 </div>
              </div>
           </div>
        </div>
      </div>
    </AppLayout>
  );
}
