import TopNav from './TopNav';
import BottomNav from './BottomNav';
import Sidebar from './Sidebar';

export default function AppLayout({ children }) {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <TopNav />
      <div className="h-[72px]" />

      <main className="mx-auto flex w-full max-w-[1360px] gap-4 px-4 py-4 pb-24 min-[480px]:px-5 min-[480px]:py-5 md:gap-6 md:px-6 md:py-6 md:pb-6">
        <Sidebar />

        <div className="min-w-0 flex-1">
          {children}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
