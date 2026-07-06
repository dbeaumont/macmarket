import { useCartStore, type CartItem } from '@/stores/cart-store';
import { Minus, Plus, Trash2 } from 'lucide-react';

interface CartItemRowProps {
  readonly item: CartItem;
}

export function CartItemRow({ item }: CartItemRowProps) {
  const { updateQuantity, removeItem } = useCartStore();

  return (
    <div className="flex gap-3">
      <img
        src={item.productImage}
        alt={item.productName}
        className="h-16 w-16 rounded-lg object-contain bg-muted/30 p-1"
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{item.productName}</p>
        <p className="text-sm text-muted-foreground">
          {item.unitPrice.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <button
            onClick={() => item.quantity > 1 ? updateQuantity(item.productId, item.quantity - 1) : removeItem(item.productId)}
            className="h-6 w-6 rounded bg-muted flex items-center justify-center hover:bg-muted-foreground/20 transition-colors"
          >
            <Minus className="h-3 w-3" />
          </button>
          <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
          <button
            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
            className="h-6 w-6 rounded bg-muted flex items-center justify-center hover:bg-muted-foreground/20 transition-colors"
          >
            <Plus className="h-3 w-3" />
          </button>
          <button
            onClick={() => removeItem(item.productId)}
            className="ml-auto text-muted-foreground hover:text-destructive transition-colors"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="text-sm font-semibold">
        {item.subtotal.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
      </div>
    </div>
  );
}
