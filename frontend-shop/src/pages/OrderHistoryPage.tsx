import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchOrders } from '@/lib/api';
import { OrderListSkeleton } from '@/components/ui/loading-skeleton';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Package } from 'lucide-react';

const STATUS_LABELS: Readonly<Record<string, string>> = {
  PENDING_PAYMENT: 'En attente',
  PAID: 'Payee',
  PROCESSING: 'En preparation',
  SHIPPED: 'Expediee',
  DELIVERED: 'Livree',
  CANCELLED: 'Annulee',
} as const;

export function OrderHistoryPage() {
  const { data: orders, isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: fetchOrders,
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="text-2xl font-bold mb-6">Mes commandes</h1>
        <OrderListSkeleton />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Mes commandes</h1>

      {!orders || orders.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Package className="h-16 w-16 mx-auto mb-4 opacity-30" />
          <p className="text-lg">Aucune commande</p>
          <p className="text-sm mt-1">Vos commandes apparaitront ici.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map(order => (
            <Link key={order.id} to={`/orders/${order.id}`}>
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Commande #{order.id.substring(0, 8)}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString('fr-FR')} — {order.items.length} article(s)
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{order.total.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</p>
                      <Badge variant={order.status === 'CANCELLED' ? 'destructive' : 'secondary'} className="text-xs">
                        {STATUS_LABELS[order.status] ?? order.status}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
