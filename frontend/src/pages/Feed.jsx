import { useState } from 'react';
import { motion } from 'framer-motion';
import { HiOutlinePhotograph, HiOutlineSparkles, HiOutlineLightBulb, HiHeart, HiChat, HiShare, HiBookmark, HiDotsHorizontal } from 'react-icons/hi';
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
  return (
    <motion.div 
      className="post-card p-5"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <Avatar firstName={post.author.split(' ')[0]} lastName={post.author.split(' ')[1] || ''} className="!w-11 !h-11 !rounded-full ring-2 ring-[var(--accent-primary)] ring-offset-2 ring-offset-[var(--bg-card)]" />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-[var(--text-primary)]">{post.author}</span>
              <span className="text-xs bg-[var(--gradient-1)] px-2 py-0.5 rounded-full text-white font-medium">{post.authorRole}</span>
            </div>
            <span className="text-[12px] text-[var(--text-muted)]">{post.city} • {post.time}</span>
          </div>
        </div>
        <button className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
          <HiDotsHorizontal size={20} />
        </button>
      </div>

      <p className="text-[15px] text-[var(--text-secondary)] mb-4 whitespace-pre-wrap leading-relaxed">
        {post.content}
      </p>

      {post.skills && post.skills.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {post.skills.map(skill => (
            <span key={skill} className="skill-tag tag-coding text-[11px]">{skill}</span>
          ))}
        </div>
      )}

      <div className="flex items-center gap-6 border-t border-[var(--border-default)] pt-4 mt-2">
        <button 
          onClick={() => onLike(post.id)}
          className={`flex items-center gap-2 text-sm font-medium transition-colors ${post.isLiked ? 'text-[var(--accent-secondary)]' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}
        >
          <HiHeart size={20} className={post.isLiked ? 'fill-current' : ''} /> {post.likes}
        </button>
        <button className="flex items-center gap-2 text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
          <HiChat size={20} /> {post.comments}
        </button>
        <button className="flex items-center gap-2 text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
          <HiShare size={20} /> Share
        </button>
        <div className="flex-1"></div>
        <button className="flex items-center gap-2 text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
          <HiBookmark size={20} />
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

  return (
    <AppLayout>
      <div className="flex gap-6">
        
        {/* Main Feed */}
        <div className="flex-1 space-y-5 min-w-0 max-w-2xl">
          
          {/* Composer */}
          <div className="card-premium p-4">
            <div className="flex gap-4">
              <Avatar firstName={user?.name?.split(' ')[0] || 'U'} lastName={user?.name?.split(' ')[1] || 'S'} src={user?.photo} className="!w-12 !h-12 !rounded-full shrink-0" />
              <div className="flex-1">
                <input 
                  type="text" 
                  placeholder="Share a skill tip..." 
                  className="w-full bg-transparent border-none text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:ring-0 px-0 pt-2 pb-4 outline-none text-[15px]"
                />
                <div className="flex items-center gap-4 border-t border-[var(--border-default)] pt-3">
                  <button className="flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors font-medium">
                    <HiOutlinePhotograph size={20} className="text-[var(--accent-primary)]" /> Photo
                  </button>
                  <button className="flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors font-medium">
                    <HiOutlineSparkles size={20} className="text-[var(--accent-green)]" /> Skill
                  </button>
                  <button className="flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors font-medium">
                    <HiOutlineLightBulb size={20} className="text-[var(--accent-yellow)]" /> Tip
                  </button>
                  <div className="flex-1"></div>
                  <button className="btn-primary !py-1.5 !px-4 !text-sm">Post</button>
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
            <h3 className="font-bold text-[var(--text-primary)] mb-4">People you might match with</h3>
            
            {[
              { name: 'Karthik R', city: 'Chennai', teaches: 'Python', wants: 'UI/UX', score: 95 },
              { name: 'Neha Gupta', city: 'Delhi', teaches: 'React', wants: 'Spanish', score: 88 },
              { name: 'Amit Patel', city: 'Mumbai', teaches: 'SEO', wants: 'Python', score: 82 }
            ].map((match, i) => (
              <div key={i} className="flex gap-3 mb-4 last:mb-0 items-center">
                <Avatar firstName={match.name.split(' ')[0]} lastName={match.name.split(' ')[1]} className="!w-10 !h-10 !rounded-full" />
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-[var(--text-primary)] truncate">{match.name}</h4>
                  <p className="text-[11px] text-[var(--text-muted)] truncate">{match.city}</p>
                </div>
                <div className="shrink-0 flex items-center justify-center w-10 h-10 rounded-full border-2 border-[var(--accent-green)] relative">
                  <span className="text-[10px] font-bold text-[var(--text-primary)]">{match.score}%</span>
                </div>
              </div>
            ))}
            <button className="w-full mt-2 py-2 rounded-xl border border-[var(--border-default)] text-[var(--text-secondary)] text-sm font-medium hover:bg-[var(--bg-hover)] transition-colors">
              View all
            </button>
          </div>

          {/* Trending Skills */}
          <div className="card-premium p-5">
            <h3 className="font-bold text-[var(--text-primary)] mb-4">Trending Skills</h3>
            <div className="space-y-3">
              {['Python', 'UI/UX Design', 'React', 'Video Editing', 'Spoken English'].map((skill, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-sm font-bold text-[var(--text-muted)] w-4">{i + 1}.</span>
                  <span className="text-sm font-medium text-[var(--text-primary)]">{skill}</span>
                </div>
              ))}
            </div>
          </div>
          
        </div>
      </div>
    </AppLayout>
  );
}

