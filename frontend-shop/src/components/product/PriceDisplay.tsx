interface PriceDisplayProps {
  readonly price: number;
  readonly discountedPrice: number;
  readonly promotionPercentage: number;
  readonly size?: 'sm' | 'lg';
}

function formatPrice(value: number): string {
  return value.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' });
}

export function PriceDisplay({ price, discountedPrice, promotionPercentage, size = 'sm' }: PriceDisplayProps) {
  const priceClass = size === 'lg' ? 'text-4xl font-bold' : 'text-lg font-bold';

  if (promotionPercentage <= 0) {
    return <span className={priceClass}>{formatPrice(price)}</span>;
  }

  const originalClass = size === 'lg' ? 'text-lg' : 'text-sm';

  return (
    <span className="flex items-baseline gap-2">
      <span className={`${priceClass} text-red-600`}>{formatPrice(discountedPrice)}</span>
      <span className={`${originalClass} text-muted-foreground line-through`}>{formatPrice(price)}</span>
    </span>
  );
}
