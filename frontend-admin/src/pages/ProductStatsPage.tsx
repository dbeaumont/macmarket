import { useState } from 'react';
import { useProductStats } from '@/hooks/use-stats';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PeriodSelector } from '@/components/shared/PeriodSelector';
import type { Period } from '@/components/shared/PeriodSelector';
import { StockBadge } from '@/components/shared/StockBadge';
import { Package, CheckCircle, AlertTriangle } from 'lucide-react';

function formatCurrency(value: number): string {
  return value.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' });
}

export function ProductStatsPage() {
  const [period, setPeriod] = useState<Period>('30d');

  const { data, isLoading } = useProductStats(period);

  const kpis = data ? [
    {
      title: 'Total produits',
      value: String(data.totalProducts),
      icon: Package,
      color: 'text-blue-600',
    },
    {
      title: 'Produits actifs',
      value: String(data.activeProducts),
      icon: CheckCircle,
      color: 'text-green-600',
    },
    {
      title: 'Stock faible',
      value: String(data.lowStockCount),
      icon: AlertTriangle,
      color: 'text-orange-600',
    },
  ] as const : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Statistiques Produits</h1>
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
              <CardTitle>Produits en stock faible</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-muted-foreground">
                      <th className="pb-2 font-medium">Produit</th>
                      <th className="pb-2 font-medium">Categorie</th>
                      <th className="pb-2 font-medium">Prix</th>
                      <th className="pb-2 font-medium">Stock</th>
                      <th className="pb-2 font-medium">Reserve</th>
                      <th className="pb-2 font-medium">Disponible</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.lowStockProducts.map((product) => (
                      <tr key={product.id} className="border-b last:border-0">
                        <td className="py-2 font-medium">{product.name}</td>
                        <td className="py-2 text-muted-foreground">{product.category}</td>
                        <td className="py-2">{formatCurrency(product.price)}</td>
                        <td className="py-2">{product.stockQuantity}</td>
                        <td className="py-2">{product.reservedQuantity}</td>
                        <td className="py-2"><StockBadge quantity={product.availableQuantity} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {data.lowStockProducts.length === 0 && (
                  <p className="text-center text-muted-foreground py-4">Aucun produit en stock faible</p>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      ) : null}
    </div>
  );
}
