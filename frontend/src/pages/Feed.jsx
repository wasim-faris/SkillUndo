import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  HiOutlinePhotograph, 
  HiOutlineSparkles, 
  HiOutlineLightBulb, 
  HiHeart, 
  HiChat, 
  HiShare, 
  HiBookmark, 
  HiDotsHorizontal 
} from 'react-icons/hi';
import AppLayout from '../components/layout/AppLayout';
import Avatar from '../components/ui/Avatar';
import { useAuth } from '../context/AuthContext';

const INITIAL_POSTS = [
  {
    id: 1,
    author: 'Arjun K',
    authorRole: 'Python Teacher',
    city: 'Bangalore',
    content: 'Just finished teaching Python to 3 people this week! Anyone want to swap for UI/UX design skills? 🐍',
    time: '2h ago',
    likes: 24,
    comments: 8,
    skills: ['Python'],
    isLiked: false,
  },
  {
    id: 2,
    author: 'Sneha M',
    authorRole: 'Design Expert',
    city: 'Kochi',
    content: 'Pro tip for learning any skill faster: teach it to someone else within 24 hours of learning it 🧠',
    time: '5h ago',
    likes: 67,
    comments: 15,
    skills: ['Mentorship'],
    isLiked: true,
  },
  {
    id: 3,
    author: 'Rahul D',
    authorRole: 'Full Stack Dev',
    city: 'Mumbai',
    content: '🎉 Just reached 50 completed sessions on SkillSwap! Thank you to everyone who learned React with me.',
    time: '1d ago',
    likes: 120,
    comments: 22,
    skills: ['React', 'Achievement'],
    isLiked: false,
    isCelebration: true,
  },
  {
    id: 4,
    author: 'Priya S',
    authorRole: 'Language Learner',
    city: 'Delhi',
    content: 'Looking for someone to teach me React, I can offer Django sessions in return. Let me know if you are interested! 🚀',
    time: '1d ago',
    likes: 15,
    comments: 4,
    skills: ['React', 'Django'],
    isLiked: false,
  },
  {
    id: 5,
    author: 'Vikram Singh',
    authorRole: 'Video Editor',
    city: 'Pune',
    content: 'Had an amazing session today. Traded Premiere Pro tips for some great SEO advice. This platform is golden! ✨',
    time: '2d ago',
    likes: 45,
    comments: 2,
    skills: ['Video Editing', 'SEO'],
    isLiked: false,
  }
];

function PostCard({ post, onLike }) {
  const authorName = post.author || 'User';
  const nameParts = authorName.split(' ');
  const firstName = nameParts[0];
  const lastName = nameParts.slice(1).join(' ') || '';

  return (
    <motion.div 
      className="post-card p-6 flex flex-col gap-4"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="flex justify-between items-start gap-4">
        <div className="flex items-center gap-3.5 min-w-0">
          <Avatar 
            firstName={firstName} 
            lastName={lastName} 
            className="!w-11 !h-11 !rounded-full ring-2 ring-[var(--accent-primary)] ring-offset-2 ring-offset-[var(--bg-card)] shrink-0" 
          />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
              <span className="font-bold text-[var(--text-primary)] text-[15px] leading-tight truncate">
                {authorName}
              </span>
              <span className="text-[10px] bg-[rgba(124,111,247,0.08)] border border-[rgba(124,111,247,0.15)] px-2 py-0.5 rounded-full text-[var(--accent-primary)] font-semibold shrink-0">
                {post.authorRole}
              </span>
            </div>
            <p className="text-[12px] text-[var(--text-muted)] mt-1 font-medium">
              {post.city} • {post.time}
            </p>
          </div>
        </div>
        <button className="w-8 h-8 flex items-center justify-center rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-all shrink-0">
          <HiDotsHorizontal size={18} />
        </button>
      </div>

      {/* Content */}
      <p className="text-[15px] text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap">
        {post.content}
      </p>

      {/* Skills */}
      {post.skills && post.skills.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {post.skills.map(skill => (
            <span key={skill} className="skill-tag tag-coding text-[11px] font-medium px-2.5 py-1">
              {skill}
            </span>
          ))}
        </div>
      )}

      {/* Divider */}
      <div className="h-px bg-[var(--border-default)] w-full my-1" />

      {/* Action Row */}
      <div className="flex items-center justify-between gap-1">
        <div className="flex items-center gap-2">
          <button 
            onClick={() => onLike(post.id)}
            className={`flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-xl transition-all duration-200 ${
              post.isLiked 
                ? 'text-[var(--accent-secondary)] bg-[rgba(249,112,102,0.08)]' 
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
            }`}
          >
            <HiHeart size={18} className={post.isLiked ? 'fill-current text-[var(--accent-secondary)]' : 'text-[var(--text-muted)]'} /> 
            <span>{post.likes}</span>
          </button>
          
          <button className="flex items-center gap-2 text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] px-3 py-2 rounded-xl transition-all duration-200">
            <HiChat size={18} className="text-[var(--text-muted)]" /> 
            <span>{post.comments}</span>
          </button>

          <button className="flex items-center gap-2 text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] px-3 py-2 rounded-xl transition-all duration-200">
            <HiShare size={18} className="text-[var(--text-muted)]" /> 
            <span>Share</span>
          </button>
        </div>

        <button className="w-9 h-9 flex items-center justify-center rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-all duration-200">
          <HiBookmark size={18} className="text-[var(--text-muted)]" />
        </button>
      </div>
    </motion.div>
  );
}

export default function Feed() {
  const { user } = useAuth();
  const [posts, setPosts] = useState(INITIAL_POSTS);

  const handleLike = (id) => {
    setPosts(posts.map(p => {
      if (p.id === id) {
        return { ...p, isLiked: !p.isLiked, likes: p.isLiked ? p.likes - 1 : p.likes + 1 };
      }
      return p;
    }));
  };

  const nameParts = (user?.name || 'User').split(' ');

  return (
    <AppLayout>
      <div className="flex gap-6">
        
        {/* Main Feed */}
        <div className="flex-1 space-y-5 min-w-0 max-w-2xl">
          
          {/* Composer */}
          <div className="card-premium p-6">
            <div className="flex gap-4">
              <Avatar 
                firstName={nameParts[0]} 
                lastName={nameParts[1] || ''} 
                src={user?.photo} 
                className="!w-11 !h-11 !rounded-full shrink-0 ring-2 ring-[var(--accent-primary)]/20" 
              />
              <div className="flex-1 min-w-0">
                <textarea 
                  placeholder="Share a skill tip or post a query..." 
                  rows={2}
                  className="w-full bg-transparent border-none text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:ring-0 p-0 pt-1.5 pb-3 outline-none text-[15px] resize-none"
                />
                <div className="flex flex-wrap items-center gap-2 border-t border-[var(--border-default)] pt-3.5 mt-1">
                  <button className="flex items-center gap-2 text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] px-3 py-1.5 rounded-lg transition-all">
                    <HiOutlinePhotograph size={18} className="text-[var(--accent-primary)]" /> 
                    <span>Photo</span>
                  </button>
                  <button className="flex items-center gap-2 text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] px-3 py-1.5 rounded-lg transition-all">
                    <HiOutlineSparkles size={18} className="text-[var(--accent-green)]" /> 
                    <span>Skill</span>
                  </button>
                  <button className="flex items-center gap-2 text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] px-3 py-1.5 rounded-lg transition-all">
                    <HiOutlineLightBulb size={18} className="text-[var(--accent-yellow)]" /> 
                    <span>Tip</span>
                  </button>
                  <div className="flex-1"></div>
                  <button className="btn-primary !py-1.5 !px-5 !text-xs !font-bold active:scale-[0.98] transition-transform">Post</button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Posts */}
          <div className="space-y-5">
            {posts.map((post) => (
              <PostCard 
                key={post.id} 
                post={post} 
                onLike={handleLike}
              />
            ))}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="hidden xl:block w-[320px] shrink-0 space-y-5">
          
          {/* People you might match with */}
          <div className="card-premium p-5">
            <h3 className="font-bold text-[var(--text-primary)] mb-4 text-sm tracking-wide uppercase">People you might match with</h3>
            
            <div className="space-y-4">
              {[
                { name: 'Karthik R', city: 'Chennai', teaches: 'Python', wants: 'UI/UX', score: 95 },
                { name: 'Neha Gupta', city: 'Delhi', teaches: 'React', wants: 'Spanish', score: 88 },
                { name: 'Amit Patel', city: 'Mumbai', teaches: 'SEO', wants: 'Python', score: 82 }
              ].map((match, i) => (
                <div key={i} className="flex gap-3 items-center group">
                  <Avatar firstName={match.name.split(' ')[0]} lastName={match.name.split(' ')[1]} className="!w-9 !h-9 !rounded-full shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-[var(--text-primary)] truncate group-hover:text-[var(--accent-primary)] transition-colors">{match.name}</h4>
                    <p className="text-[11px] text-[var(--text-muted)] truncate">
                      Teaches <span className="text-[var(--text-secondary)] font-medium">{match.teaches}</span> • {match.city}
                    </p>
                  </div>
                  <div className="shrink-0 flex items-center justify-center w-9 h-9 rounded-full border border-dashed border-[rgba(52,211,153,0.3)] bg-[rgba(52,211,153,0.06)]">
                    <span className="text-[10px] font-bold text-[var(--accent-green)]">{match.score}%</span>
                  </div>
                </div>
              ))}
            </div>
            
            <button className="w-full mt-4 py-2 rounded-xl border border-[var(--border-default)] text-[var(--text-secondary)] text-xs font-semibold hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] transition-all duration-200">
              View all
            </button>
          </div>

          {/* Trending Skills */}
          <div className="card-premium p-5">
            <h3 className="font-bold text-[var(--text-primary)] mb-4 text-sm tracking-wide uppercase">Trending Skills</h3>
            <div className="space-y-3">
              {['Python', 'UI/UX Design', 'React.js', 'Video Editing', 'SEO Marketing'].map((skill, i) => (
                <div key={i} className="flex items-center justify-between py-1 group cursor-default">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center justify-center w-5 h-5 rounded bg-[var(--bg-secondary)] text-[var(--text-muted)] text-[11px] font-bold border border-[var(--border-default)]">
                      {i + 1}
                    </span>
                    <span className="text-sm font-medium text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors">{skill}</span>
                  </div>
                  <span className="text-[10px] text-[var(--text-muted)] bg-[var(--bg-secondary)] px-2 py-0.5 rounded-full border border-[var(--border-default)]">
                    {120 - i * 15} swaps
                  </span>
                </div>
              ))}
            </div>
          </div>
          
        </div>
      </div>
    </AppLayout>
  );
}
