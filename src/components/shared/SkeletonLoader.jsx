// Dark shimmer placeholder. `lines` controls how many bars to render.
export default function SkeletonLoader({ lines = 4, className = '' }) {
  return (
    <div className={['space-y-3', className].join(' ')} aria-busy="true" aria-live="polite">
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="h-3 rounded-full bg-arena-surface2 overflow-hidden relative">
          <span className="absolute inset-0 -translate-x-full animate-[shimmer_1.6s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent" />
        </div>
      ))}
    </div>
  )
}

export function PageSkeleton() {
  return (
    <div className="space-y-6">
      <SkeletonBlock className="h-10 w-2/3" />
      <SkeletonBlock className="h-4 w-1/2" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonBlock key={i} className="h-24 rounded-2xl" />
        ))}
      </div>
      <SkeletonBlock className="h-64 rounded-2xl" />
    </div>
  )
}

export function SkeletonBlock({ className = '' }) {
  return (
    <div className={['bg-arena-surface2 rounded-full overflow-hidden relative', className].join(' ')}>
      <span className="absolute inset-0 -translate-x-full animate-[shimmer_1.6s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent" />
    </div>
  )
}
