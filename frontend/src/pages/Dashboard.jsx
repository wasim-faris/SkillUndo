import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { HiRefresh, HiLightningBolt, HiBookOpen, HiUsers, HiChevronRight, HiGlobe, HiAcademicCap } from 'react-icons/hi';
import AppLayout from '../components/layout/AppLayout';
import SkeletonCard, { SkeletonStat } from '../components/ui/SkeletonCard';
import Avatar from '../components/ui/Avatar';
import SkillPill from '../components/ui/SkillPill';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { getProfile } from '../api/auth';
import { getUserSkills, getMatches } from '../api/skills';

function StatCard({ icon: Icon, label, value, color, delay }) {
  return (
    <div className="bg-white border border-neutral-200 rounded-lg p-5 shadow-sm hover:shadow-md transition-all animate-fade-in" style={{ animationDelay: delay }}>
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${color} bg-opacity-10`}>
          <Icon size={24} className={color.replace('bg-', 'text-').split(' ')[0]} />
        </div>
        <div>
          <p className="text-[24px] font-bold text-black leading-tight">{value}</p>
          <p className="text-[12px] font-bold text-neutral-500 uppercase tracking-tight">{label}</p>
        </div>
      </div>
    </div>
  );
}

function MatchCard({ match, delay }) {
  const teaches = match.teaching_skills || [];
  const nameParts = (match.name || '').split(' ');

  return (
    <div className="bg-white border border-neutral-200 rounded-lg p-5 shadow-sm hover:shadow-md transition-all animate-fade-in flex flex-col h-full" style={{ animationDelay: delay }}>
      <div className="flex items-center gap-3 mb-4">
        <Avatar firstName={nameParts[0]} lastName={nameParts[1]} src={match.photo} size="lg" className="!rounded-md" />
        <div className="min-w-0">
          <p className="font-bold text-black text-[16px] hover:text-[#0a66c2] hover:underline cursor-pointer truncate">
            {match.name}
          </p>
          <div className="flex items-center gap-1.5 text-neutral-500 text-xs font-medium">
             <HiGlobe size={14} /> {match.city || 'Remote'}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {teaches.slice(0, 3).map((s) => <SkillPill key={s.id} name={s.name} type="teaching" />)}
      </div>

      <Button variant="outline" size="sm" fullWidth className="mt-auto">
        Message
      </Button>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [userSkills, setUserSkills] = useState([]);
  const [matches, setMatches] = useState([]);

  const fetchAll = async () => {
    setLoading(true);
    setError(false);
    try {
      const [skillsRes, matchesRes] = await Promise.all([
        getUserSkills(),
        getMatches(),
      ]);
      setUserSkills(skillsRes.data || []);
      setMatches(matchesRes.data || []);
    } catch {
      setError(true);
      toast.error('Sync failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const teaching = userSkills.filter((s) => s.skill_type === 'teaching');
  const learning = userSkills.filter((s) => s.skill_type === 'learning');
  const topMatches = matches.slice(0, 3);

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-8 py-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-black tracking-tight">
              Personal Dashboard
            </h1>
            <p className="text-neutral-500 font-medium text-[14px]">You have {matches.length} potential skill matches this week.</p>
          </div>
          <button onClick={fetchAll} className="text-neutral-500 hover:text-[#0a66c2] transition-colors flex items-center gap-2 text-sm font-bold">
            <HiRefresh size={18} className={loading ? 'animate-spin' : ''} /> Sync metrics
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {loading ? [1, 2, 3].map((i) => <SkeletonStat key={i} />) : (
            <>
              <StatCard icon={HiLightningBolt} label="Active Teaching" value={teaching.length} color="bg-blue-600 text-blue-600" delay="0.1s" />
              <StatCard icon={HiBookOpen} label="Learning Goals" value={learning.length} color="bg-orange-500 text-orange-500" delay="0.2s" />
              <StatCard icon={HiUsers} label="Professional Matches" value={matches.length} color="bg-green-600 text-green-600" delay="0.3s" />
            </>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           {/* Left/Main Column */}
           <div className="lg:col-span-2 space-y-8">
              <section className="space-y-4">
                <div className="flex items-center justify-between border-b border-neutral-200 pb-2">
                  <h2 className="text-[18px] font-bold text-black">Top Matches for You</h2>
                  <Link to="/matches" className="text-sm font-bold text-[#0a66c2] hover:underline flex items-center gap-1">
                    View all
                  </Link>
                </div>

                {loading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[1, 2].map((i) => <SkeletonCard key={i} />)}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {topMatches.map((m, idx) => <MatchCard key={m.id} match={m} delay={`${0.4 + idx * 0.1}s`} />)}
                  </div>
                )}
              </section>

              <section className="bg-white border border-neutral-200 rounded-lg p-6">
                 <h3 className="text-lg font-bold text-black mb-6">Skills Activity</h3>
                 <div className="space-y-6">
                    <div>
                       <p className="text-[14px] font-bold text-neutral-500 mb-3 uppercase tracking-wider">Currently Teaching</p>
                       <div className="flex flex-wrap gap-2">
                          {teaching.map(s => <SkillPill key={s.id} name={s.skill?.name} type="teaching" />)}
                       </div>
                    </div>
                    <div>
                       <p className="text-[14px] font-bold text-neutral-500 mb-3 uppercase tracking-wider">Learning Goals</p>
                       <div className="flex flex-wrap gap-2">
                          {learning.map(s => <SkillPill key={s.id} name={s.skill?.name} type="learning" />)}
                       </div>
                    </div>
                 </div>
              </section>
           </div>

           {/* Right Column */}
           <div className="space-y-6">
              <div className="bg-white border border-neutral-200 rounded-lg p-5">
                 <h3 className="text-[16px] font-bold text-black mb-4">Analytics Overview</h3>
                 <div className="space-y-4">
                    <div className="flex items-center justify-between">
                       <span className="text-[14px] text-neutral-500">Profile views</span>
                       <span className="text-[14px] font-bold text-[#0a66c2]">124</span>
                    </div>
                    <div className="flex items-center justify-between">
                       <span className="text-[14px] text-neutral-500">Post impressions</span>
                       <span className="text-[14px] font-bold text-[#0a66c2]">2.1k</span>
                    </div>
                    <div className="flex items-center justify-between border-t border-neutral-100 pt-3 mt-3">
                       <span className="text-[14px] text-neutral-500">Search appearances</span>
                       <span className="text-[14px] font-bold text-[#0a66c2]">18</span>
                    </div>
                 </div>
              </div>

              <div className="bg-[#eef3f8] border border-neutral-200 rounded-lg p-5">
                 <p className="text-[14px] font-bold text-black mb-2">Advance your career</p>
                 <p className="text-[12px] text-neutral-600 mb-4 font-medium">Unlock premium features to see who viewed your profile and get more matches.</p>
                 <Button variant="outline" size="sm" fullWidth>Learn More</Button>
              </div>
           </div>
        </div>
      </div>
    </AppLayout>
  );
}
