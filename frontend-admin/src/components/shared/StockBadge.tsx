import { cn } from '@/lib/utils';

interface StockBadgeProps {
  readonly quantity: number;
}

export function StockBadge({ quantity }: StockBadgeProps) {
  const style = quantity > 20
    ? 'bg-green-100 text-green-800'
    : quantity >= 5
      ? 'bg-orange-100 text-orange-800'
      : 'bg-red-100 text-red-800';

  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium', style)}>
      {quantity}
    </span>
  );
}
