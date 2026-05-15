export default function SkeletonCard({ className = '', lines = 3 }) {
  return (
    <div className={`card-premium animate-pulse ${className}`}>
      <div className="flex items-center gap-4 mb-6">
        <div className="w-14 h-14 bg-coffee-500/5 rounded-2xl" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-2/3 bg-coffee-500/5 rounded-xl" />
          <div className="h-3 w-1/2 bg-coffee-500/5 rounded-lg" />
        </div>
      </div>
      <div className="space-y-3">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className="h-3 bg-coffee-500/5 rounded-lg"
            style={{ width: `${95 - i * 10}%` }}
          />
        ))}
      </div>
      <div className="mt-8 h-12 w-full bg-coffee-500/5 rounded-2xl" />
    </div>
  );
}

export function SkeletonLine({ className = '' }) {
  return <div className={`h-4 bg-coffee-500/5 rounded-xl animate-pulse ${className}`} />;
}

export function SkeletonStat({ className = '' }) {
  return (
    <div className={`card-premium animate-pulse flex items-center gap-5 ${className}`}>
      <div className="w-14 h-14 bg-coffee-500/5 rounded-2xl" />
      <div className="space-y-2">
        <div className="h-8 w-12 bg-coffee-500/5 rounded-xl" />
        <div className="h-3 w-20 bg-coffee-500/5 rounded-lg" />
      </div>
    </div>
  );
}

