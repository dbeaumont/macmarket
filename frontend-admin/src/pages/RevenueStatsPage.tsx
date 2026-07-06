import { useState } from 'react';
import { useRevenueStats } from '@/hooks/use-stats';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PeriodSelector } from '@/components/shared/PeriodSelector';
import type { Period } from '@/components/shared/PeriodSelector';
import { Euro, ShoppingCart, TrendingUp } from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts';

function formatCurrency(value: number): string {
  return value.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' });
}

export function RevenueStatsPage() {
  const [period, setPeriod] = useState<Period>('30d');

  const { data, isLoading } = useRevenueStats(period);

  const chartData = data?.chart.map((point) => ({
    date: new Date(point.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
    montant: point.revenue,
  })) ?? [];

  const kpis = data ? [
    {
      title: 'Chiffre d\'affaires total',
      value: formatCurrency(data.totalRevenue),
      icon: Euro,
      color: 'text-green-600',
    },
    {
      title: 'Panier moyen',
      value: formatCurrency(data.averageOrderValue),
      icon: TrendingUp,
      color: 'text-blue-600',
    },
    {
      title: 'Nombre de commandes',
      value: String(data.orderCount),
      icon: ShoppingCart,
      color: 'text-purple-600',
    },
  ] as const : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Statistiques Revenus</h1>
        <PeriodSelector value={period} onChange={setPeriod} />
      </div>

      {isLoading ? (
        <div className="space-y-6">
          {[1, 2].map((i) => (
            <Card key={i}>
              <CardContent>
                <div className="h-64 bg-slate-200 rounded animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : data ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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

          <Card>
            <CardHeader>
              <CardTitle>Chiffre d'affaires journalier</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorCA" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
                  <YAxis stroke="#94a3b8" fontSize={12} />
                  <Tooltip
                    formatter={(value: number | string | ReadonlyArray<number | string> | undefined) =>
                      [formatCurrency(Number(value ?? 0)), 'CA']
                    }
                  />
                  <Area
                    type="monotone"
                    dataKey="montant"
                    stroke="#3b82f6"
                    fillOpacity={1}
                    fill="url(#colorCA)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </>
      ) : null}
    </div>
  );
}
