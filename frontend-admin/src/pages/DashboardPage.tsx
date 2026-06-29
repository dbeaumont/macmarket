import { useAuth } from 'react-oidc-context';
import { useQuery } from '@tanstack/react-query';
import { getUserRoles } from '@/lib/auth';
import { fetchDashboard } from '@/lib/api';
import type { DashboardData } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { StockBadge } from '@/components/shared/StockBadge';
import { ShoppingCart, Euro, AlertTriangle, Clock } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function formatCurrency(value: number): string {
  return value.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' });
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('fr-FR');
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="h-4 w-24 bg-slate-200 rounded animate-pulse" />
              <div className="h-4 w-4 bg-slate-200 rounded animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-16 bg-slate-200 rounded animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardContent>
          <div className="h-64 bg-slate-200 rounded animate-pulse" />
        </CardContent>
      </Card>
    </div>
  );
}

function DashboardContent({ data }: { readonly data: DashboardData }) {
  const pendingCount = data.ordersByStatus['PENDING_PAYMENT'] ?? 0;

  const kpis = [
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
    {
      title: 'Stock faible',
      value: String(data.lowStockCount),
      icon: AlertTriangle,
      color: 'text-orange-600',
    },
    {
      title: 'En attente',
      value: String(pendingCount),
      icon: Clock,
      color: 'text-purple-600',
    },
  ] as const;

  const chartData = data.revenueChart.map((point) => ({
    date: new Date(point.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
    montant: point.revenue,
  }));

  return (
    <>
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

      <Card>
        <CardHeader>
          <CardTitle>Revenus des 7 derniers jours</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
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
                labelStyle={{ color: '#475569' }}
              />
              <Area
                type="monotone"
                dataKey="montant"
                stroke="#3b82f6"
                fillOpacity={1}
                fill="url(#colorRevenue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Commandes recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-2 font-medium">N°</th>
                    <th className="pb-2 font-medium">Total</th>
                    <th className="pb-2 font-medium">Statut</th>
                    <th className="pb-2 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentOrders.map((order) => (
                    <tr key={order.id} className="border-b last:border-0">
                      <td className="py-2 font-mono text-xs">{order.id.slice(0, 8)}</td>
                      <td className="py-2">{formatCurrency(order.total)}</td>
                      <td className="py-2"><StatusBadge status={order.status} /></td>
                      <td className="py-2 text-muted-foreground">{formatDate(order.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {data.recentOrders.length === 0 && (
                <p className="text-center text-muted-foreground py-4">Aucune commande recente</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Stock faible</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.lowStockProducts.map((product) => (
                <div key={product.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">{product.name}</p>
                    <p className="text-xs text-muted-foreground">{product.category}</p>
                  </div>
                  <StockBadge quantity={product.availableQuantity} />
                </div>
              ))}
              {data.lowStockProducts.length === 0 && (
                <p className="text-center text-muted-foreground py-4">Aucun produit en stock faible</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

export function DashboardPage() {
  const auth = useAuth();
  const roles = getUserRoles(auth.user);

  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: fetchDashboard,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Bienvenue, {auth.user?.profile?.name || 'Gestionnaire'}
          <span className="ml-2 text-xs bg-muted px-2 py-0.5 rounded">
            {roles.filter((r) => !r.startsWith('default-')).join(', ')}
          </span>
        </p>
      </div>

      {isLoading || !data ? <LoadingSkeleton /> : <DashboardContent data={data} />}
    </div>
  );
}
