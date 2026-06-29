import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchOrderStats } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PeriodSelector } from '@/components/shared/PeriodSelector';
import type { Period } from '@/components/shared/PeriodSelector';
import { ShoppingCart, Euro } from 'lucide-react';
import type { PieLabelRenderProps } from 'recharts';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';

function formatCurrency(value: number): string {
  return value.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' });
}

const COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
  '#ec4899', '#06b6d4', '#84cc16',
] as const;

function renderPieLabel(props: PieLabelRenderProps): string {
  const name = String(props.name ?? '');
  const percent = typeof props.percent === 'number' ? props.percent : 0;
  return `${name} (${(percent * 100).toFixed(0)}%)`;
}

interface StatusEntry {
  readonly name: string;
  readonly value: number;
}

export function OrderStatsPage() {
  const [period, setPeriod] = useState<Period>('30d');

  const { data, isLoading } = useQuery({
    queryKey: ['stats', 'orders', period],
    queryFn: () => fetchOrderStats(period),
  });

  const chartData = data?.chart.map((point) => ({
    date: new Date(point.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
    commandes: point.count,
  })) ?? [];

  const statusData: readonly StatusEntry[] = data
    ? Object.entries(data.byStatus).map(([name, value]) => ({ name, value }))
    : [];

  const kpis = data ? [
    {
      title: 'Total commandes',
      value: String(data.totalOrders),
      icon: ShoppingCart,
      color: 'text-blue-600',
    },
    {
      title: 'Chiffre d\'affaires',
      value: formatCurrency(data.totalRevenue),
      icon: Euro,
      color: 'text-green-600',
    },
  ] as const : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Statistiques Commandes</h1>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Volume de commandes par jour</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
                    <YAxis stroke="#94a3b8" fontSize={12} />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="commandes"
                      stroke="#8b5cf6"
                      fillOpacity={1}
                      fill="url(#colorOrders)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Repartition des statuts</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <PieChart>
                    <Pie
                      data={[...statusData]}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      dataKey="value"
                      nameKey="name"
                      label={renderPieLabel}
                    >
                      {statusData.map((_, index) => (
                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </>
      ) : null}
    </div>
  );
}
