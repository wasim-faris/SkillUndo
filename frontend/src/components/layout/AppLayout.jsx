import TopNav from './TopNav';
import BottomNav from './BottomNav';
import FeedSidebar from '../feed/FeedSidebar';

export default function AppLayout({ children, onAddPost }) {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <TopNav />
      <div className="h-[72px]" />

      <main className="max-w-[1360px] mx-auto px-6 py-6 flex gap-6">
        <FeedSidebar />
        
        <div className="flex-1 min-w-0">
          {children}
        </div>
      </main>

      <BottomNav onAddPost={onAddPost} />
    </div>
  );
}
