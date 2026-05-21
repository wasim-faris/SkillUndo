export default function SkeletonCard({ className = '', lines = 3 }) {
  return (
    <div className={`card-premium animate-pulse ${className}`}>
      <div className="flex items-center gap-4 mb-6">
        <div className="w-14 h-14 bg-[var(--bg-secondary)] rounded-2xl" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-2/3 bg-[var(--bg-secondary)] rounded-xl" />
          <div className="h-3 w-1/2 bg-[var(--bg-secondary)] rounded-lg" />
        </div>
      </div>
      <div className="space-y-3">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className="h-3 bg-[var(--bg-secondary)] rounded-lg"
            style={{ width: `${95 - i * 10}%` }}
          />
        ))}
      </div>
      <div className="mt-8 h-12 w-full bg-[var(--bg-secondary)] rounded-2xl" />
    </div>
  );
}

export function SkeletonLine({ className = '' }) {
  return <div className={`h-4 bg-[var(--bg-secondary)] rounded-xl animate-pulse ${className}`} />;
}

export function SkeletonStat({ className = '' }) {
  return (
    <div className={`card-premium animate-pulse flex items-center gap-5 ${className}`}>
      <div className="w-14 h-14 bg-[var(--bg-secondary)] rounded-2xl" />
      <div className="space-y-2">
        <div className="h-8 w-12 bg-[var(--bg-secondary)] rounded-xl" />
        <div className="h-3 w-20 bg-[var(--bg-secondary)] rounded-lg" />
      </div>
    </div>
  );
}


