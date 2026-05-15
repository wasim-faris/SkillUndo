import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { HiUsers, HiRefresh, HiChevronRight, HiLocationMarker, HiLightningBolt } from 'react-icons/hi';
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
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: parseFloat(delay) }}
      className="card-premium group h-full flex flex-col"
    >
      <div className="flex items-center gap-4 mb-6">
        <div className="relative">
          <Avatar firstName={nameParts[0]} lastName={nameParts[1]} src={match.photo} size="lg" className="!w-14 !h-14 !rounded-2xl border-2 border-white shadow-sm" />
          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-white rounded-full" />
        </div>
        <div className="min-w-0">
          <p className="text-lg font-display font-black text-coffee-500 group-hover:text-coffee-300 transition-colors truncate">
            {match.name}
          </p>
          <div className="flex items-center gap-1.5 text-coffee-200 text-[10px] font-black uppercase tracking-widest">
             <HiLocationMarker size={12} /> {match.city || 'Remote'}
          </div>
        </div>
      </div>

      {match.bio && (
        <p className="text-coffee-700 text-sm font-medium line-clamp-3 mb-6 leading-relaxed">
          {match.bio}
        </p>
      )}

      <div className="space-y-4 mb-8 mt-auto">
        {teaches.length > 0 && (
          <div className="space-y-2">
            <p className="text-[10px] font-black text-coffee-200 uppercase tracking-widest">Expertise</p>
            <div className="flex flex-wrap gap-2">
              {teaches.slice(0, 3).map((s) => <SkillPill key={s.id} name={s.name} type="teaching" />)}
            </div>
          </div>
        )}
      </div>

      <Button fullWidth size="md">
        Send Invite
      </Button>
    </motion.div>
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
      <div className="max-w-6xl mx-auto space-y-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h1 className="text-4xl lg:text-5xl font-display font-black text-coffee-500 tracking-tight mb-2">
              Growth Network
            </h1>
            <p className="text-coffee-300 font-bold text-lg">Curated professionals matching your current skill trajectory.</p>
          </motion.div>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={fetchMatches} 
            className="bg-white/50 backdrop-blur-md border border-coffee-500/10 px-5 py-2.5 rounded-full text-coffee-500 hover:bg-white transition-all flex items-center gap-2 text-sm font-black uppercase tracking-wider shadow-sm"
          >
            <HiRefresh size={18} className={loading ? 'animate-spin' : ''} /> Recalibrate
          </motion.button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => <SkeletonCard key={i} />)}
          </div>
        ) : error ? (
          <div className="card-premium text-center py-24 flex flex-col items-center">
            <HiRefresh size={48} className="text-red-400 mb-6 animate-pulse" />
            <p className="text-coffee-500 font-black text-xl mb-8 tracking-tight">Sync interrupted by solar flares.</p>
            <Button size="md" onClick={fetchMatches}>Retry Connection</Button>
          </div>
        ) : matches.length === 0 ? (
          <div className="card-premium text-center py-32 flex flex-col items-center">
            <div className="w-20 h-20 bg-coffee-500/5 rounded-[32px] flex items-center justify-center text-coffee-200 mb-8">
              <HiUsers size={48} />
            </div>
            <h2 className="text-3xl font-display font-black text-coffee-500 mb-4 tracking-tight">Quiet in the network</h2>
            <p className="text-coffee-300 font-bold text-lg mb-12 max-w-sm">
              Expand your skills to attract more high-value professional matches.
            </p>
            <Link to="/skills">
              <Button size="lg" className="h-14 px-10 text-lg">Evolve Profile</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {matches.map((m, idx) => (
              <MatchCard key={m.id} match={m} delay={`${0.1 + idx * 0.05}`} />
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}

