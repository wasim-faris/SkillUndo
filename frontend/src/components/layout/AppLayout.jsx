import TopNav from './TopNav';
import BottomNav from './BottomNav';

export default function AppLayout({ children, onAddPost }) {
  return (
    <div className="min-h-screen mesh-bg noise-overlay relative">
      {/* Ambient floating particles */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="ambient-particle w-[300px] h-[300px] top-[10%] left-[5%]" style={{ animationDelay: '0s' }} />
        <div className="ambient-particle w-[200px] h-[200px] top-[60%] right-[10%]" style={{ animationDelay: '-5s' }} />
        <div className="ambient-particle w-[250px] h-[250px] bottom-[10%] left-[40%]" style={{ animationDelay: '-10s' }} />
      </div>

      <TopNav />
      <div className="h-[72px]" />

      <main className="max-w-[1360px] mx-auto px-6 py-6 relative z-10">
        {children}
      </main>

      <BottomNav onAddPost={onAddPost} />
    </div>
  );
}
