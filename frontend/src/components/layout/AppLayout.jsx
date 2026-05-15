import TopNav from './TopNav';
import BottomNav from './BottomNav';

export default function AppLayout({ children, onAddPost }) {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <TopNav />
      
      {/* Spacer for TopNav */}
      <div className="h-[var(--nav-height)]" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 pb-24 md:pb-8">
        {children}
      </main>

      <BottomNav onAddPost={onAddPost} />
    </div>
  );
}
