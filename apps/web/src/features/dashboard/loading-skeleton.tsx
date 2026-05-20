export function LoadingSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className="animate-pulse space-y-3" aria-hidden>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-12 rounded-lg bg-slate-200"
          style={{ width: `${100 - i * 12}%` }}
        />
      ))}
    </div>
  );
}
