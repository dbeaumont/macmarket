import { cn } from '@/lib/utils';

const STATUS_STYLES: Readonly<Record<string, string>> = {
  PENDING_PAYMENT: 'bg-blue-100 text-blue-800',
  PAID: 'bg-green-100 text-green-800',
  PROCESSING: 'bg-yellow-100 text-yellow-800',
  SHIPPED: 'bg-purple-100 text-purple-800',
  DELIVERED: 'bg-emerald-100 text-emerald-800',
  CANCELLED: 'bg-red-100 text-red-800',
};

const STATUS_LABELS: Readonly<Record<string, string>> = {
  PENDING_PAYMENT: 'En attente',
  PAID: 'Paye',
  PROCESSING: 'En traitement',
  SHIPPED: 'Expedie',
  DELIVERED: 'Livre',
  CANCELLED: 'Annule',
};

interface StatusBadgeProps {
  readonly status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const style = STATUS_STYLES[status] ?? 'bg-gray-100 text-gray-800';
  const label = STATUS_LABELS[status] ?? status;

  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium', style)}>
      {label}
    </span>
  );
}
