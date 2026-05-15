import { useState } from 'react';
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
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-8">
        
        {/* Left Sidebar - Profile Summary */}
        <FeedSidebar />

        {/* Main Content - Feed */}
        <div className="flex-1 space-y-6 max-w-2xl mx-auto w-full">
          <PostBar onOpenModal={() => document.getElementById('post-input')?.focus()} />
          
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard 
                key={post.id} 
                post={post} 
                onUserClick={() => handleUserClick(post)}
              />
            ))}
          </div>
        </div>

        {/* Right Sidebar - Suggestions */}
        <SuggestionsSidebar />

        {/* Profile Overlay */}
        <ProfileOverlay 
          user={selectedUser} 
          isOpen={!!selectedUser} 
          onClose={() => setSelectedUser(null)} 
        />
      </div>
    </AppLayout>
  );
}
