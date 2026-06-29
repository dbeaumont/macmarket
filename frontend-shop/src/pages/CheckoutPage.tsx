import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useCartStore } from '@/stores/cart-store';
import { placeOrder } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingCart, Loader2 } from 'lucide-react';

export function CheckoutPage() {
  const { cart, clearCart } = useCartStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    shippingName: '',
    shippingAddress: '',
    shippingEmail: '',
  });

  const updateField = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const order = await placeOrder(form);
      clearCart();
      toast.success('Commande passee avec succes');
      navigate(`/orders/${order.id}`, { state: { justPlaced: true } });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erreur lors de la commande';
      toast.error('Erreur de paiement');
      setError(message);
    } finally {
      setLoading(false);
    }
  };

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

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button type="submit" size="lg" className="w-full" disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
            {loading ? 'Traitement...' : `Payer ${cart.total.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}`}
          </Button>
        </form>

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
