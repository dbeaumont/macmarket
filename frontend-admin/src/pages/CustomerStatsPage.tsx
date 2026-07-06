import { useState } from 'react';
import { useCustomerStats } from '@/hooks/use-stats';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PeriodSelector } from '@/components/shared/PeriodSelector';
import type { Period } from '@/components/shared/PeriodSelector';
import { Users, UserPlus, Euro, TrendingUp } from 'lucide-react';

function formatCurrency(value: number): string {
  return value.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' });
}

export function CustomerStatsPage() {
  const [period, setPeriod] = useState<Period>('30d');

  const { data, isLoading } = useCustomerStats(period);

  const kpis = data ? [
    {
      title: 'Total clients',
      value: String(data.totalCustomers),
      icon: Users,
      color: 'text-blue-600',
    },
    {
      title: 'Nouveaux clients',
      value: String(data.newCustomers),
      icon: UserPlus,
      color: 'text-green-600',
    },
    {
      title: 'Depense moyenne / client',
      value: formatCurrency(data.averageSpentPerCustomer),
      icon: TrendingUp,
      color: 'text-purple-600',
    },
    {
      title: 'Chiffre d\'affaires total',
      value: formatCurrency(data.totalRevenue),
      icon: Euro,
      color: 'text-orange-600',
    },
  ] as const : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Statistiques Clients</h1>
        <PeriodSelector value={period} onChange={setPeriod} />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent>
                <div className="h-24 bg-slate-200 rounded animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : data ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((kpi) => (
            <Card key={kpi.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{kpi.title}</CardTitle>
                <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
              </CardHeader>
              <CardContent>
                <span className="text-2xl font-bold">{kpi.value}</span>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : null}
    </div>
  );
}
