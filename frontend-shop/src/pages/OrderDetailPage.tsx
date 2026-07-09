import { useParams, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchOrder, fetchPaymentStatus } from '@/lib/api';
import { useInvoiceDownload } from '@/hooks/use-invoice-download';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, Clock, Loader2, FileDown } from 'lucide-react';

const INVOICE_ELIGIBLE_STATUSES = new Set(['PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED']);

const STATUS_CONFIG: Record<string, { readonly label: string; readonly variant: 'default' | 'secondary' | 'destructive'; readonly icon: typeof CheckCircle }> = {
  PENDING_PAYMENT: { label: 'En attente de paiement', variant: 'secondary', icon: Clock },
  PAID: { label: 'Payee', variant: 'default', icon: CheckCircle },
  PROCESSING: { label: 'En preparation', variant: 'default', icon: Loader2 },
  SHIPPED: { label: 'Expediee', variant: 'default', icon: CheckCircle },
  DELIVERED: { label: 'Livree', variant: 'default', icon: CheckCircle },
  CANCELLED: { label: 'Annulee', variant: 'destructive', icon: XCircle },
} as const;

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const justPlaced = (location.state as { justPlaced?: boolean } | null)?.justPlaced;

  const { data: order, isLoading } = useQuery({
    queryKey: ['order', id],
    queryFn: () => fetchOrder(id!),
    enabled: !!id,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status === 'PENDING_PAYMENT' ? 2000 : false;
    },
  });

  const { data: payment } = useQuery({
    queryKey: ['payment', id],
    queryFn: () => fetchPaymentStatus(id!),
    enabled: !!id && order?.status !== 'PENDING_PAYMENT',
    retry: false,
  });

  const invoiceDownload = useInvoiceDownload();

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="h-8 w-48 bg-muted animate-pulse rounded mb-6" />
        <div className="h-64 bg-muted animate-pulse rounded-lg" />
      </div>
    );
  }

  if (!order) return null;

  const statusInfo = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.PENDING_PAYMENT;
  const StatusIcon = statusInfo.icon;
  const canDownloadInvoice = INVOICE_ELIGIBLE_STATUSES.has(order.status);

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      {justPlaced && (
        <div className="mb-6 rounded-lg bg-green-50 border border-green-200 p-4 text-green-800">
          <p className="font-semibold">Commande passee avec succes !</p>
          <p className="text-sm mt-1">Le paiement est en cours de traitement...</p>
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Commande</h1>
        <div className="flex items-center gap-3">
          <Badge variant={statusInfo.variant} className="flex items-center gap-1.5 px-3 py-1">
            <StatusIcon className="h-4 w-4" />
            {statusInfo.label}
          </Badge>
          {canDownloadInvoice && (
            <Button
              variant="outline"
              size="sm"
              disabled={invoiceDownload.isPending}
              onClick={() => invoiceDownload.mutate(order.id)}
            >
              {invoiceDownload.isPending
                ? <Loader2 className="h-4 w-4 animate-spin" />
                : <FileDown className="h-4 w-4" />}
              <span className="ml-1.5">
                {invoiceDownload.isPending ? 'Téléchargement...' : 'Facture PDF'}
              </span>
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <Card>
          <CardHeader><CardTitle className="text-lg">Articles</CardTitle></CardHeader>
          <CardContent>
            <div className="divide-y">
              {order.items.map(item => (
                <div key={item.productId} className="flex items-center gap-3 py-3">
                  <img src={item.productImage} alt={item.productName} className="h-12 w-12 rounded object-contain bg-muted/30 p-1" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.productName}</p>
                    <p className="text-xs text-muted-foreground">{item.unitPrice.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })} x {item.quantity}</p>
                  </div>
                  <span className="font-semibold text-sm">{item.subtotal.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</span>
                </div>
              ))}
            </div>
            <div className="border-t pt-3 mt-3 flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>{order.total.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</span>
            </div>
          </CardContent>
        </Card>

        {order.shippingName && (
          <Card>
            <CardHeader><CardTitle className="text-lg">Livraison</CardTitle></CardHeader>
            <CardContent className="text-sm space-y-1">
              <p className="font-medium">{order.shippingName}</p>
              <p className="text-muted-foreground">{order.shippingAddress}</p>
              <p className="text-muted-foreground">{order.shippingEmail}</p>
            </CardContent>
          </Card>
        )}

        {payment && (
          <Card>
            <CardHeader><CardTitle className="text-lg">Paiement</CardTitle></CardHeader>
            <CardContent className="text-sm space-y-1">
              <p>Statut : <Badge variant={payment.status === 'COMPLETED' ? 'default' : 'destructive'}>{payment.status}</Badge></p>
              {payment.transactionRef && <p>Reference : <span className="font-mono">{payment.transactionRef}</span></p>}
              {payment.failureReason && <p className="text-destructive">Raison : {payment.failureReason}</p>}
            </CardContent>
          </Card>
        )}

        <p className="text-xs text-muted-foreground text-center">
          Commande #{order.id.substring(0, 8)} — {new Date(order.createdAt).toLocaleString('fr-FR')}
        </p>
      </div>
    </div>
  );
}
