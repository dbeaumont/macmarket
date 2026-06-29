import { useCartStore } from '@/stores/cart-store';
import { CartItemRow } from './CartItemRow';
import { ShoppingCart, X, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Props {
  readonly open: boolean;
  readonly onClose: () => void;
}

export function CartDrawer({ open, onClose }: Props) {
  const { cart, clearCart } = useCartStore();

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/40 z-40 transition-opacity duration-300 ${open ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
        onClick={onClose}
      />
      <div
        className={`fixed right-0 top-0 bottom-0 w-full max-w-full sm:max-w-md bg-background z-50 shadow-2xl flex flex-col transition-transform duration-300 ${open ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="font-bold text-lg flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" /> Mon panier
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-auto p-4">
          {!cart || cart.items.length === 0 ? (
            <div className="text-center text-muted-foreground py-12">
              <ShoppingCart className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>Votre panier est vide</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.items.map(item => (
                <CartItemRow key={item.productId} item={item} />
              ))}
            </div>
          )}
        </div>

        {cart && cart.items.length > 0 && (
          <div className="border-t p-4 space-y-3">
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span>{cart.total.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</span>
            </div>
            <Link
              to="/checkout"
              onClick={onClose}
              className="block w-full text-center bg-primary text-primary-foreground py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
            >
              Passer commande
            </Link>
            <button
              onClick={() => clearCart()}
              className="flex items-center justify-center gap-1 w-full text-sm text-muted-foreground hover:text-destructive transition-colors"
            >
              <Trash2 className="h-3 w-3" /> Vider le panier
            </button>
          </div>
        )}
      </div>
    </>
  );
}
