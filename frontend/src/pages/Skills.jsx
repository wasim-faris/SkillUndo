import { useEffect, useState, useMemo } from 'react';
import toast from 'react-hot-toast';
import { HiPlus, HiMagnifyingGlass, HiBolt, HiArrowPath, HiXMark } from 'react-icons/hi2';
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
  const [addError, setAddError] = useState('');
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
      toast.error('Failed to load skills data');
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
      toast.success('Skill removed! ✨');
    } catch {
      setUserSkills(prev);
      toast.error('Failed to remove skill');
    } finally {
      setDeletingId(null);
    }
  };

  const handleAdd = async (skill) => {
    if (currentSkillIds.has(skill.id)) {
      setAddError('Already in your list.');
      return;
    }
    setAddError('');
    setAddingId(skill.id);
    const optimistic = { id: `temp-${skill.id}`, skill, skill_type: activeTab };
    setUserSkills((p) => [...p, optimistic]);
    try {
      const res = await addSkill(skill.id, activeTab);
      setUserSkills((p) => p.map((s) => s.id === optimistic.id ? res.data : s));
      toast.success(`${skill.name} added! 🎉`);
    } catch (err) {
      setUserSkills((p) => p.filter((s) => s.id !== optimistic.id));
      setAddError('Failed to add skill');
    } finally {
      setAddingId(null);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-10 animate-fade-in">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <h1 className="text-4xl font-black text-gray-900">My Skills</h1>
          
          <div className="flex gap-2 bg-white p-2 rounded-2xl shadow-xl shadow-purple-50">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => { setActiveTab(tab); setShowAdd(false); setAddError(''); }}
                className={`
                  px-8 py-3 rounded-xl text-sm font-black transition-all duration-500 capitalize
                  ${activeTab === tab
                    ? tab === 'teaching'
                      ? 'bg-[#6C63FF] text-white shadow-lg shadow-purple-100'
                      : 'bg-[#FF6584] text-white shadow-lg shadow-pink-100'
                    : 'text-gray-400 hover:text-gray-600'
                  }
                `}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {error ? (
          <div className="card-premium text-center py-20">
            <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-red-500 shadow-lg shadow-red-100">
               <HiArrowPath size={40} />
            </div>
            <p className="text-xl font-black text-gray-900 mb-6">Failed to load skills.</p>
            <Button variant="outline" onClick={fetchData}>
              Try Again
            </Button>
          </div>
        ) : (
          <div className="card-premium space-y-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gray-50 rounded-full translate-x-1/2 -translate-y-1/2 -z-10"></div>
            
            <div className="flex items-center justify-between">
               <h2 className="text-2xl font-black text-gray-900 capitalize">
                 Currently {activeTab}
               </h2>
               <Button
                variant={showAdd ? 'outline' : activeTab === 'teaching' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => { setShowAdd((v) => !v); setAddError(''); setSearch(''); }}
                className="gap-2"
              >
                {showAdd ? <HiXMark size={18} /> : <HiPlus size={18} />}
                {showAdd ? 'Close Search' : 'Add New Skill'}
              </Button>
            </div>

            {loading ? (
              <div className="flex flex-wrap gap-3">
                {[1, 2, 3, 4, 5].map((i) => <div key={i} className="h-10 w-32 bg-gray-100 animate-pulse rounded-xl" />)}
              </div>
            ) : currentSkills.length === 0 ? (
              <div className="text-center py-16 bg-gray-50 rounded-[2rem] border-2 border-dashed border-gray-100">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                   <HiBolt size={32} className="text-gray-200" />
                </div>
                <p className="text-gray-400 font-bold">
                  You haven&apos;t added any {activeTab} skills yet.
                </p>
              </div>
            ) : (
              <div className="flex flex-wrap gap-4">
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

            {/* Search Panel */}
            {showAdd && (
              <div className="pt-8 border-t border-gray-100 space-y-6 animate-fade-in">
                <div className="relative group">
                  <HiMagnifyingGlass size={22} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#6C63FF] transition-colors" />
                  <input
                    type="text"
                    placeholder="Search from 500+ skills..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="input-premium pl-14 text-lg"
                    autoFocus
                  />
                </div>

                {addError && (
                  <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-bold flex items-center gap-2 animate-slide-left">
                    <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></div>
                    {addError}
                  </div>
                )}

                <div className="max-h-96 overflow-y-auto space-y-8 pr-2 custom-scrollbar">
                  {Object.keys(filteredGrouped).length === 0 ? (
                    <div className="text-center py-10">
                       <p className="text-gray-400 font-bold text-lg">No results for "{search}"</p>
                       <p className="text-gray-300 text-sm mt-1">Try a different keyword or category.</p>
                    </div>
                  ) : (
                    Object.entries(filteredGrouped).map(([category, skills]) => (
                      <div key={category} className="space-y-4">
                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                          {category}
                        </p>
                        <div className="flex flex-wrap gap-3">
                          {skills.map((skill) => {
                            const alreadyHas = currentSkillIds.has(skill.id);
                            return (
                              <button
                                key={skill.id}
                                disabled={addingId === skill.id || alreadyHas}
                                onClick={() => handleAdd(skill)}
                                className={`
                                  px-5 py-2.5 rounded-2xl text-sm font-bold transition-all duration-300 border-2
                                  ${alreadyHas
                                    ? 'bg-gray-50 text-gray-300 border-gray-100 cursor-default'
                                    : activeTab === 'teaching'
                                    ? 'border-purple-50 text-[#6C63FF] hover:bg-[#6C63FF] hover:text-white hover:border-[#6C63FF] hover:shadow-lg hover:shadow-purple-100'
                                    : 'border-pink-50 text-[#FF6584] hover:bg-[#FF6584] hover:text-white hover:border-[#FF6584] hover:shadow-lg hover:shadow-pink-100'
                                  }
                                  ${addingId === skill.id ? 'animate-pulse' : ''}
                                `}
                              >
                                {alreadyHas ? `✓ ${skill.name}` : skill.name}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
