import React from 'react';

export default function PageSkeleton() {
  return (
    <div className="flex h-[calc(100vh-72px)] w-full flex-col p-6 max-w-7xl mx-auto space-y-6">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between animate-pulse">
        <div className="h-8 bg-[var(--bg-secondary)] rounded w-1/4"></div>
        <div className="h-8 bg-[var(--bg-secondary)] rounded w-16"></div>
      </div>

      {/* Grid or Main content Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse mt-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="card-premium h-48 flex flex-col space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[var(--bg-secondary)] rounded-full shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-[var(--bg-secondary)] rounded w-1/2" />
                <div className="h-3 bg-[var(--bg-secondary)] rounded w-1/3" />
              </div>
            </div>
            <div className="space-y-2 pt-2">
              <div className="h-3 bg-[var(--bg-secondary)] rounded w-full" />
              <div className="h-3 bg-[var(--bg-secondary)] rounded w-5/6" />
            </div>
            <div className="mt-auto flex justify-between pt-2">
              <div className="h-6 bg-[var(--bg-secondary)] rounded w-1/4" />
              <div className="h-6 bg-[var(--bg-secondary)] rounded w-1/4" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
