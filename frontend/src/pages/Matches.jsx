import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { HiUsers, HiRefresh, HiChevronRight, HiLocationMarker } from 'react-icons/hi';
import AppLayout from '../components/layout/AppLayout';
import Avatar from '../components/ui/Avatar';
import SkillPill from '../components/ui/SkillPill';
import Button from '../components/ui/Button';
import SkeletonCard from '../components/ui/SkeletonCard';
import { getMatches } from '../api/skills';

function MatchCard({ match, delay }) {
  const teaches = match.teaching_skills || [];
  const nameParts = (match.name || '').split(' ');

  return (
    <div className="bg-white border border-neutral-200 rounded-lg p-5 shadow-sm hover:shadow-md transition-all animate-fade-in flex flex-col h-full" style={{ animationDelay: delay }}>
      <div className="flex items-center gap-4 mb-4">
        <Avatar firstName={nameParts[0]} lastName={nameParts[1]} src={match.photo} size="lg" className="!rounded-full border border-neutral-100" />
        <div className="min-w-0">
          <p className="font-bold text-black text-[16px] hover:text-[#0a66c2] hover:underline cursor-pointer truncate">
            {match.name}
          </p>
          <div className="flex items-center gap-1.5 text-neutral-500 text-[12px] font-medium">
             <HiLocationMarker size={14} /> {match.city || 'Remote'}
          </div>
        </div>
      </div>

      {match.bio && (
        <p className="text-neutral-600 text-[13px] font-medium line-clamp-2 mb-4 leading-relaxed">
          {match.bio}
        </p>
      )}

      <div className="space-y-3 mb-6 mt-auto">
        {teaches.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest ml-1">Expert in</p>
            <div className="flex flex-wrap gap-1.5">
              {teaches.slice(0, 3).map((s) => <SkillPill key={s.id} name={s.name} type="teaching" />)}
            </div>
          </div>
        )}
      </div>

      <Button variant="outline" size="sm" fullWidth>
        Connect
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
      toast.error('Sync failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMatches(); }, []);

  return (
    <AppLayout>
      <div className="max-w-[1128px] mx-auto space-y-6 py-4">
        <div className="bg-white border border-neutral-200 rounded-lg p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-[20px] font-bold text-black tracking-tight">Professional Network</h1>
            <p className="text-neutral-500 font-medium text-[14px]">Based on your skills and interests</p>
          </div>
          <button onClick={fetchMatches} className="text-neutral-500 hover:text-[#0a66c2] transition-colors flex items-center gap-2 text-sm font-bold">
            <HiRefresh size={18} className={loading ? 'animate-spin' : ''} /> Refresh suggestions
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => <SkeletonCard key={i} />)}
          </div>
        ) : error ? (
          <div className="bg-white border border-neutral-200 rounded-lg text-center py-20 flex flex-col items-center">
            <HiRefresh size={32} className="text-red-500 mb-4" />
            <p className="text-black font-bold mb-6">Failed to load matches.</p>
            <Button variant="outline" size="sm" onClick={fetchMatches}>Try Again</Button>
          </div>
        ) : matches.length === 0 ? (
          <div className="bg-white border border-neutral-200 rounded-lg text-center py-24 flex flex-col items-center">
             <HiUsers size={48} className="text-neutral-200 mb-6" />
            <h2 className="text-[20px] font-bold text-black mb-2">No matches found yet</h2>
            <p className="text-neutral-500 font-medium mb-10 max-w-sm mx-auto">
              Expand your skills to see more people who match your professional profile.
            </p>
            <Link to="/skills">
              <Button size="sm">Add Skills</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {matches.map((m, idx) => <MatchCard key={m.id} match={m} delay={`${0.1 + idx * 0.05}s`} />)}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
