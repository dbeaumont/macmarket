import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useCartStore } from '@/stores/cart-store';
import type { ShippingProfile } from '@/lib/api';
import { useShippingProfile } from '@/hooks/use-shipping-profile';
import { usePlaceOrder } from '@/hooks/use-place-order';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingCart, Loader2 } from 'lucide-react';

interface ShippingFormProps {
  readonly initialProfile: ShippingProfile | null | undefined;
  readonly total: number;
}

function ShippingForm({ initialProfile, total }: ShippingFormProps) {
  const { clearCart, fetchCart } = useCartStore();
  const navigate = useNavigate();
  const placeOrderMutation = usePlaceOrder();
  const [form, setForm] = useState({
    shippingName: initialProfile?.name ?? '',
    shippingAddress: initialProfile?.address ?? '',
    shippingEmail: initialProfile?.email ?? '',
  });

  const updateField = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    placeOrderMutation.mutate(form, {
      onSuccess: async (order) => {
        await clearCart();
        toast.success('Commande passee avec succes');
        navigate(`/orders/${order.id}`, { state: { justPlaced: true } });
      },
      onError: async () => {
        toast.error('Erreur de paiement');
        await fetchCart();
      },
    });
  };

  return (
    <form onSubmit={handleSubmit} className="md:col-span-3 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Informations de livraison</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <label className="text-sm font-medium">Nom complet</label>
            <Input value={form.shippingName} onChange={e => updateField('shippingName', e.target.value)} required />
          </div>
          <div>
            <label className="text-sm font-medium">Adresse</label>
            <Input value={form.shippingAddress} onChange={e => updateField('shippingAddress', e.target.value)} required />
          </div>
          <div>
            <label className="text-sm font-medium">Email</label>
            <Input type="email" value={form.shippingEmail} onChange={e => updateField('shippingEmail', e.target.value)} required />
          </div>
        </CardContent>
      </Card>

      {placeOrderMutation.error && (
        <p className="text-sm text-destructive">{placeOrderMutation.error.message}</p>
      )}

      <Button type="submit" size="lg" className="w-full" disabled={placeOrderMutation.isPending}>
        {placeOrderMutation.isPending ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
        {placeOrderMutation.isPending ? 'Traitement...' : `Payer ${total.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}`}
      </Button>
    </form>
  );
}

export function CheckoutPage() {
  const { cart } = useCartStore();
  const { data: shippingProfile, isLoading: profileLoading } = useShippingProfile();

  if (!cart || cart.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <ShoppingCart className="h-16 w-16 mx-auto mb-4 text-muted-foreground/30" />
        <h1 className="text-2xl font-bold">Panier vide</h1>
        <p className="text-muted-foreground mt-2">Ajoutez des produits avant de passer commande.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">Finaliser la commande</h1>

      <div className="grid md:grid-cols-5 gap-6">
        {!profileLoading && (
          <ShippingForm key={shippingProfile ? 'prefilled' : 'empty'} initialProfile={shippingProfile} total={cart.total} />
        )}

        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recapitulatif</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {cart.items.map(item => (
                <div key={item.productId} className="flex justify-between text-sm">
                  <span className="truncate flex-1">{item.productName} x{item.quantity}</span>
                  <span className="font-medium ml-2">{item.subtotal.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</span>
                </div>
              ))}
              <div className="border-t pt-3 flex justify-between font-bold">
                <span>Total</span>
                <span>{cart.total.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
