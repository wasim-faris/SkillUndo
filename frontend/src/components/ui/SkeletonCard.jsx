/**
 * SkeletonCard — shimmer placeholder for loading states.
 * Pass height/className to customize shape.
 */
export default function SkeletonCard({ className = '', lines = 3 }) {
  return (
    <div className={`card animate-pulse ${className}`}>
      <div className="flex items-center gap-3 mb-4">
        <div className="skeleton w-10 h-10 rounded-full" />
        <div className="flex-1 space-y-2">
          <div className="skeleton h-3.5 w-2/3 rounded" />
          <div className="skeleton h-3 w-1/2 rounded" />
        </div>
      </div>
      <div className="space-y-2.5">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className="skeleton h-3 rounded"
            style={{ width: `${90 - i * 15}%` }}
          />
        ))}
      </div>
    </div>
  );
}

export function SkeletonLine({ className = '' }) {
  return <div className={`skeleton h-4 rounded ${className}`} />;
}

export function SkeletonStat({ className = '' }) {
  return (
    <div className={`card animate-pulse ${className}`}>
      <div className="skeleton h-8 w-16 rounded mb-3" />
      <div className="skeleton h-4 w-24 rounded" />
    </div>
  );
}
