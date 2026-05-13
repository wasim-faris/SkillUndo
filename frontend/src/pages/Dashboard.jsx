import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { HiArrowPath, HiBolt, HiBookOpen, HiUsers, HiChevronRight } from 'react-icons/hi2';
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
    <div className="card-premium flex items-center gap-6 animate-fade-in" style={{ animationDelay: delay }}>
      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg ${color}`}>
        <Icon size={30} className="text-white" />
      </div>
      <div>
        <p className="text-3xl font-black text-gray-900 leading-tight">{value}</p>
        <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">{label}</p>
      </div>
    </div>
  );
}

function MatchCard({ match, delay }) {
  const teaches = match.teaching_skills?.slice(0, 2) || [];
  const learns = match.learning_skills?.slice(0, 2) || [];

  return (
    <div className="card-premium group hover:scale-[1.02] transition-all duration-300 animate-fade-in" style={{ animationDelay: delay }}>
      <div className="flex items-center gap-4 mb-6">
        <Avatar firstName={match.first_name} lastName={match.last_name} size="lg" />
        <div className="min-w-0">
          <p className="font-bold text-gray-900 text-lg group-hover:text-[#6C63FF] transition-colors">
            {match.first_name} {match.last_name}
          </p>
          <p className="text-sm text-gray-400 font-medium truncate">{match.email}</p>
        </div>
      </div>
      {match.bio && (
        <p className="text-gray-500 text-sm font-medium line-clamp-2 mb-6 leading-relaxed">{match.bio}</p>
      )}
      <div className="flex flex-wrap gap-2 mb-8">
        {teaches.map((s) => <SkillPill key={s.id} name={s.name} type="teaching" />)}
        {learns.map((s) => <SkillPill key={s.id} name={s.name} type="learning" />)}
      </div>
      <Button variant="outline" fullWidth className="group-hover:bg-[#6C63FF] group-hover:text-white group-hover:border-[#6C63FF]">
        Connect <HiChevronRight />
      </Button>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [profile, setProfile] = useState(null);
  const [userSkills, setUserSkills] = useState([]);
  const [matches, setMatches] = useState([]);

  const fetchAll = async () => {
    setLoading(true);
    setError(false);
    try {
      const [profileRes, skillsRes, matchesRes] = await Promise.all([
        getProfile(),
        getUserSkills(),
        getMatches(),
      ]);
      setProfile(profileRes.data);
      setUserSkills(skillsRes.data || []);
      setMatches(matchesRes.data || []);
    } catch {
      setError(true);
      toast.error('Failed to sync data');
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
      <div className="max-w-6xl mx-auto space-y-12 py-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 animate-fade-in">
          <div>
            <h1 className="text-4xl font-black text-gray-900 leading-tight">
              Welcome back, <span className="text-[#6C63FF]">{user?.first_name || profile?.first_name}</span>! 👋
            </h1>
            <p className="text-gray-500 font-bold text-lg mt-2">Ready to swap some knowledge today?</p>
          </div>
          <Button variant="ghost" onClick={fetchAll} className="text-gray-400 hover:text-[#6C63FF] font-bold">
            <HiArrowPath size={20} className={loading ? 'animate-spin' : ''} /> Sync Data
          </Button>
        </div>

        {/* Stat Cards */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => <SkeletonStat key={i} />)}
          </div>
        ) : error ? (
          <div className="card-premium text-center py-16 animate-fade-in">
            <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-red-500 shadow-lg shadow-red-100">
               <HiArrowPath size={40} />
            </div>
            <p className="text-xl font-bold text-gray-900 mb-6">Failed to load dashboard data.</p>
            <Button variant="outline" onClick={fetchAll}>
               Try Again
            </Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard 
                icon={HiBolt} 
                label="Teaching" 
                value={teaching.length} 
                color="bg-[#6C63FF] shadow-purple-200" 
                delay="0.1s"
              />
              <StatCard 
                icon={HiBookOpen} 
                label="Learning" 
                value={learning.length} 
                color="bg-[#FF6584] shadow-pink-200" 
                delay="0.2s"
              />
              <StatCard 
                icon={HiUsers} 
                label="Matches" 
                value={matches.length} 
                color="bg-emerald-500 shadow-emerald-100" 
                delay="0.3s"
              />
            </div>

            {/* Top Matches */}
            <section className="animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-black text-gray-900">Top Matches For You</h2>
                <Link to="/matches" className="btn-secondary text-sm px-4 py-2 flex items-center gap-2">
                  View all <HiChevronRight />
                </Link>
              </div>
              
              {topMatches.length === 0 ? (
                <div className="card-premium text-center py-20 bg-gray-50 border-dashed border-2 border-gray-200">
                  <div className="w-24 h-24 bg-white rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-xl">
                    <HiUsers size={48} className="text-gray-200" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">No matches yet</h3>
                  <p className="text-gray-500 font-medium mb-10 max-w-sm mx-auto">
                    Add more skills you know and skills you want to learn to find your perfect match.
                  </p>
                  <Link to="/skills">
                    <Button size="lg">Add Skills Now</Button>
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {topMatches.map((m, idx) => <MatchCard key={m.id} match={m} delay={`${0.5 + idx * 0.1}s`} />)}
                </div>
              )}
            </section>

            {/* Quick Skills Summary */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in" style={{ animationDelay: '0.8s' }}>
              <div className="card-premium">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center text-[#6C63FF]">
                       <HiBolt size={20} />
                    </div>
                    <h3 className="font-bold text-gray-900 text-lg">My Teaching Skills</h3>
                  </div>
                  <Link to="/skills" className="text-[#6C63FF] font-bold text-sm hover:underline">Manage</Link>
                </div>
                
                {teaching.length === 0 ? (
                  <p className="text-gray-400 font-medium bg-gray-50 p-4 rounded-xl text-center">No skills listed yet.</p>
                ) : (
                  <div className="flex flex-wrap gap-3">
                    {teaching.slice(0, 5).map((s) => (
                      <SkillPill key={s.id} name={s.skill.name} type="teaching" />
                    ))}
                    {teaching.length > 5 && (
                      <span className="bg-gray-100 text-gray-500 px-3 py-1.5 rounded-xl text-xs font-bold">
                        +{teaching.length - 5} others
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="card-premium">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-pink-50 rounded-xl flex items-center justify-center text-[#FF6584]">
                       <HiBookOpen size={20} />
                    </div>
                    <h3 className="font-bold text-gray-900 text-lg">My Learning Goals</h3>
                  </div>
                  <Link to="/skills" className="text-[#FF6584] font-bold text-sm hover:underline">Manage</Link>
                </div>
                
                {learning.length === 0 ? (
                  <p className="text-gray-400 font-medium bg-gray-50 p-4 rounded-xl text-center">No goals listed yet.</p>
                ) : (
                  <div className="flex flex-wrap gap-3">
                    {learning.slice(0, 5).map((s) => (
                      <SkillPill key={s.id} name={s.skill.name} type="learning" />
                    ))}
                    {learning.length > 5 && (
                      <span className="bg-gray-100 text-gray-500 px-3 py-1.5 rounded-xl text-xs font-bold">
                        +{learning.length - 5} others
                      </span>
                    )}
                  </div>
                )}
              </div>
            </section>
          </>
        )}
      </div>
    </AppLayout>
  );
}
