import { Button } from '@/components/ui/button';

export type Period = '7d' | '30d' | '90d' | '12m';

interface PeriodOption {
  readonly value: Period;
  readonly label: string;
}

const PERIOD_OPTIONS = [
  { value: '7d', label: '7j' },
  { value: '30d', label: '30j' },
  { value: '90d', label: '90j' },
  { value: '12m', label: '12m' },
] as const satisfies readonly PeriodOption[];

interface PeriodSelectorProps {
  readonly value: Period;
  readonly onChange: (period: Period) => void;
}

export function PeriodSelector({ value, onChange }: PeriodSelectorProps) {
  return (
    <div className="flex gap-2">
      {PERIOD_OPTIONS.map((option) => (
        <Button
          key={option.value}
          variant={value === option.value ? 'default' : 'outline'}
          size="sm"
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </Button>
      ))}
    </div>
  );
}
