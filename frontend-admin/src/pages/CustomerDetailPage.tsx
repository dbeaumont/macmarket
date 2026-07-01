import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchCustomerOrders } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { ArrowLeft, Eye, User, Mail, MapPin } from 'lucide-react';

function formatCurrency(value: number): string {
  return value.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' });
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('fr-FR');
}

export function CustomerDetailPage() {
  const { userId } = useParams<{ readonly userId: string }>();
  const navigate = useNavigate();

  const { data: orders, isLoading } = useQuery({
    queryKey: ['customer-orders', userId],
    queryFn: () => fetchCustomerOrders(userId!),
    enabled: Boolean(userId),
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-slate-200 rounded animate-pulse" />
        <div className="h-64 bg-slate-200 rounded animate-pulse" />
      </div>
    );
  }

  if (!orders) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Client introuvable</p>
      </div>
    );
  }

  const orderCount = orders.length;
  const totalSpent = orders.reduce((sum, o) => sum + o.total, 0);
  const latestOrder = orders.reduce<(typeof orders)[number] | null>(
    (latest, o) => (!latest || o.createdAt > latest.createdAt ? o : latest),
    null,
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/customers')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Client</h1>
          <p className="text-sm text-muted-foreground font-mono">{userId}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Nb commandes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{orderCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Total depense</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(totalSpent)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Derniere commande</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{latestOrder ? formatDate(latestOrder.createdAt) : '—'}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Coordonnees</CardTitle>
        </CardHeader>
        <CardContent>
          {latestOrder ? (
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{latestOrder.shippingName}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{latestOrder.shippingEmail}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{latestOrder.shippingAddress}</span>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground">Aucune coordonnee disponible</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Commandes</CardTitle>
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
                  <th className="pb-2 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b last:border-0">
                    <td className="py-3 font-mono text-xs">{order.id.slice(0, 8)}</td>
                    <td className="py-3">{formatCurrency(order.total)}</td>
                    <td className="py-3"><StatusBadge status={order.status} /></td>
                    <td className="py-3">{formatDate(order.createdAt)}</td>
                    <td className="py-3">
                      <Link to={`/orders/${order.id}`}>
                        <Button variant="ghost" size="icon-xs">
                          <Eye className="h-3 w-3" />
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {orders.length === 0 && (
              <p className="text-center text-muted-foreground py-8">Aucune commande trouvee</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
