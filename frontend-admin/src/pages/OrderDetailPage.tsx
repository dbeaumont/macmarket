import { useParams, useNavigate } from 'react-router-dom';
import { useOrderDetail } from '@/hooks/use-order-detail';
import { useInvoiceDownload } from '@/hooks/use-invoice-download';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { ArrowLeft, FileDown, Loader2 } from 'lucide-react';

const INVOICE_ELIGIBLE_STATUSES = new Set(['PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED']);

function formatCurrency(value: number): string {
  return value.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' });
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('fr-FR');
}

const ORDER_STATUSES = [
  'PENDING_PAYMENT',
  'PAID',
  'PROCESSING',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
] as const;

export function OrderDetailPage() {
  const { id } = useParams<{ readonly id: string }>();
  const navigate = useNavigate();
  const { order, isLoading, newStatus, setNewStatus, statusMutation } = useOrderDetail(id);
  const invoiceDownload = useInvoiceDownload();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-slate-200 rounded animate-pulse" />
        <div className="h-64 bg-slate-200 rounded animate-pulse" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Commande introuvable</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/orders')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Commande</h1>
            <p className="text-sm text-muted-foreground font-mono">{order.id}</p>
          </div>
        </div>
        {INVOICE_ELIGIBLE_STATUSES.has(order.status) && (
          <Button
            variant="outline"
            size="sm"
            disabled={invoiceDownload.isPending}
            onClick={() => invoiceDownload.mutate(order.id)}
          >
            {invoiceDownload.isPending
              ? <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              : <FileDown className="mr-2 h-4 w-4" />}
            {invoiceDownload.isPending ? 'Téléchargement...' : 'Facture PDF'}
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Articles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-2 font-medium">Produit</th>
                    <th className="pb-2 font-medium">Prix unitaire</th>
                    <th className="pb-2 font-medium">Quantite</th>
                    <th className="pb-2 font-medium text-right">Sous-total</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item) => (
                    <tr key={item.productId} className="border-b last:border-0">
                      <td className="py-3">
                        <div className="flex items-center gap-3">
                          {item.productImage && (
                            <img
                              src={item.productImage}
                              alt={item.productName}
                              className="h-10 w-10 rounded object-cover"
                            />
                          )}
                          <span className="font-medium">{item.productName}</span>
                        </div>
                      </td>
                      <td className="py-3">{formatCurrency(item.unitPrice)}</td>
                      <td className="py-3">{item.quantity}</td>
                      <td className="py-3 text-right font-medium">{formatCurrency(item.subtotal)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2">
                    <td colSpan={3} className="py-3 font-bold text-right">Total</td>
                    <td className="py-3 text-right font-bold">{formatCurrency(order.total)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Statut</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Actuel :</span>
                <StatusBadge status={order.status} />
              </div>
              <div className="space-y-2">
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-3 py-2 text-sm border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">Changer le statut...</option>
                  {ORDER_STATUSES.filter((s) => s !== order.status).map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <Button
                  className="w-full"
                  size="sm"
                  disabled={!newStatus || statusMutation.isPending}
                  onClick={() => statusMutation.mutate(newStatus)}
                >
                  {statusMutation.isPending ? 'Mise a jour...' : 'Confirmer'}
                </Button>
                {statusMutation.error && (
                  <p className="text-xs text-red-600">{statusMutation.error.message}</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Livraison</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div>
                <span className="text-muted-foreground">Nom : </span>
                <span className="font-medium">{order.shippingName}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Adresse : </span>
                <span className="font-medium">{order.shippingAddress}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Email : </span>
                <span className="font-medium">{order.shippingEmail}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Date : </span>
                <span className="font-medium">{formatDate(order.createdAt)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
