import { useState } from 'react';
import { motion } from 'framer-motion';
import AppLayout from '../components/layout/AppLayout';
import FeedSidebar from '../components/feed/FeedSidebar';
import SuggestionsSidebar from '../components/feed/SuggestionsSidebar';
import PostCard from '../components/feed/PostCard';
import PostBar from '../components/feed/PostBar';
import ProfileOverlay from '../components/feed/ProfileOverlay';

const INITIAL_POSTS = [
  {
    id: 1,
    author: 'Alex Rivera',
    authorRole: 'Senior Frontend Engineer',
    content: 'Just finished a deep dive into React Server Components. The performance gains are mind-blowing! Anyone interested in a quick swap session? I want to learn more about Go backends.',
    time: '2h ago',
    likes: 24,
    comments: 5,
    skills: ['React', 'Next.js', 'Go'],
    photo: null
  },
  {
    id: 2,
    author: 'Sarah Chen',
    authorRole: 'Product Designer',
    content: "I've been experimenting with Framer Motion for micro-interactions. If you're a developer looking to level up your UI game, let's talk! I need help with TypeScript fundamentals.",
    time: '5h ago',
    likes: 42,
    comments: 12,
    skills: ['Framer Motion', 'Figma', 'TypeScript'],
    photo: null
  }
];

export default function Feed() {
  const [posts, setPosts] = useState(INITIAL_POSTS);
  const [selectedUser, setSelectedUser] = useState(null);

  const handleCreatePost = (content) => {
    const newPost = {
      id: Date.now(),
      author: 'You',
      authorRole: 'Skill Explorer',
      content,
      time: 'Just now',
      likes: 0,
      comments: 0,
      skills: ['New']
    };
    setPosts([newPost, ...posts]);
  };

  const handleUserClick = (user) => {
    setSelectedUser(user);
  };

  return (
    <AppLayout onAddPost={() => document.getElementById('post-input')?.focus()}>
      <div className="w-full flex gap-6">
        
        {/* Left Sidebar */}
        <div className="hidden lg:block w-[280px] shrink-0">
          <div className="sticky top-[92px]">
            <FeedSidebar />
          </div>
        </div>

        {/* Main Feed */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex-1 space-y-3 min-w-0"
        >
          <PostBar onOpenModal={() => document.getElementById('post-input')?.focus()} />
          
          <div className="space-y-3">
            {posts.map((post) => (
              <PostCard 
                key={post.id} 
                post={post} 
                onUserClick={() => handleUserClick(post)}
              />
            ))}
          </div>
        </motion.div>

        {/* Right Sidebar */}
        <div className="hidden xl:block w-[300px] shrink-0">
          <div className="sticky top-[92px]">
            <SuggestionsSidebar />
          </div>
        </div>
      </div>

      {/* Profile Overlay */}
      <ProfileOverlay 
        user={selectedUser} 
        isOpen={!!selectedUser} 
        onClose={() => setSelectedUser(null)} 
      />
    </AppLayout>

  );
}

