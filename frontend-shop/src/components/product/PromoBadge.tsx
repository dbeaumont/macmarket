interface PromoBadgeProps {
  readonly percentage: number;
}

export function PromoBadge({ percentage }: PromoBadgeProps) {
  if (percentage <= 0) {
    return null;
  }

  return (
    <div className="absolute left-0 top-0 z-10 rounded-tl-xl rounded-br-lg bg-gradient-to-br from-red-600 to-red-500 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-white shadow-lg">
      -{percentage}%
    </div>
  );
}
