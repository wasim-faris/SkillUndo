import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { HiUsers, HiArrowPath, HiChevronRight } from 'react-icons/hi2';
import AppLayout from '../components/layout/AppLayout';
import Avatar from '../components/ui/Avatar';
import SkillPill from '../components/ui/SkillPill';
import Button from '../components/ui/Button';
import SkeletonCard from '../components/ui/SkeletonCard';
import { getMatches } from '../api/skills';

function MatchCard({ match, delay }) {
  const teaches = match.teaching_skills || [];
  const learns = match.learning_skills || [];

  return (
    <div className="card-premium group hover:scale-[1.02] transition-all duration-300 animate-fade-in flex flex-col h-full" style={{ animationDelay: delay }}>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Avatar firstName={match.first_name} lastName={match.last_name} size="lg" />
        <div className="min-w-0">
          <p className="font-black text-gray-900 text-lg group-hover:text-[#6C63FF] transition-colors">
            {match.first_name} {match.last_name}
          </p>
          <p className="text-sm text-gray-400 font-bold">{match.email}</p>
        </div>
      </div>

      {/* Bio */}
      {match.bio && (
        <p className="text-gray-500 text-sm font-medium line-clamp-3 mb-6 leading-relaxed flex-1">
          {match.bio}
        </p>
      )}

      {/* Skill groups */}
      <div className="space-y-4 mb-8 mt-auto">
        {teaches.length > 0 && (
          <div className="space-y-2">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Teaches</p>
            <div className="flex flex-wrap gap-2">
              {teaches.map((s) => <SkillPill key={s.id} name={s.name} type="teaching" />)}
            </div>
          </div>
        )}
        {learns.length > 0 && (
          <div className="space-y-2">
             <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Wants to learn</p>
            <div className="flex flex-wrap gap-2">
              {learns.map((s) => <SkillPill key={s.id} name={s.name} type="learning" />)}
            </div>
          </div>
        )}
      </div>

      {/* Action */}
      <Button variant="outline" fullWidth className="group-hover:bg-[#6C63FF] group-hover:text-white group-hover:border-[#6C63FF]">
        Send Message <HiChevronRight />
      </Button>
    </div>
  );
}

export default function Matches() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchMatches = async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await getMatches();
      setMatches(res.data || []);
    } catch {
      setError(true);
      toast.error('Failed to find matches');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMatches(); }, []);

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-10 animate-fade-in">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black text-gray-900">Matches</h1>
            <p className="text-gray-500 font-bold text-lg mt-2">Discover people ready to trade skills with you.</p>
          </div>
          <Button variant="ghost" onClick={fetchMatches} className="text-gray-400 hover:text-[#6C63FF] font-bold">
            <HiArrowPath size={20} className={loading ? 'animate-spin' : ''} /> Refresh
          </Button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => <SkeletonCard key={i} />)}
          </div>
        ) : error ? (
          <div className="card-premium text-center py-20">
            <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-red-500 shadow-lg shadow-red-100">
               <HiArrowPath size={40} />
            </div>
            <p className="text-xl font-black text-gray-900 mb-6">Failed to load matches.</p>
            <Button variant="outline" onClick={fetchMatches}>Try Again</Button>
          </div>
        ) : matches.length === 0 ? (
          <div className="card-premium text-center py-24 bg-gray-50 border-dashed border-2 border-gray-200">
             <div className="w-24 h-24 bg-white rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-xl">
               <HiUsers size={48} className="text-gray-200" />
             </div>
            <h2 className="text-3xl font-black text-gray-900 mb-4">No matches found yet</h2>
            <p className="text-gray-500 font-bold mb-10 max-w-md mx-auto">
              Add more skills to your profile to find people who match your interests.
            </p>
            <Link to="/skills">
              <Button size="lg">Add More Skills</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {matches.map((m, idx) => <MatchCard key={m.id} match={m} delay={`${0.1 + idx * 0.1}s`} />)}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
