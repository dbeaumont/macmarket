import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { useAuth } from 'react-oidc-context';
import { useCartStore } from '@/stores/cart-store';
import type { SuggestedProduct } from '@/hooks/use-chat';

interface Props {
  readonly product: SuggestedProduct;
}

export function ProductSuggestion({ product }: Props) {
  const auth = useAuth();
  const addItem = useCartStore(s => s.addItem);

  function handleAddToCart(): void {
    if (!auth.isAuthenticated) {
      auth.signinRedirect();
      return;
    }
    addItem(product.slug, 1);
  }

  return (
    <div className="flex items-center gap-3 rounded-lg border bg-background p-2 hover:shadow-sm transition-shadow">
      <Link to={`/products/${product.slug}`} className="shrink-0">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="h-12 w-12 rounded-md object-cover"
        />
      </Link>
      <div className="min-w-0 flex-1">
        <Link
          to={`/products/${product.slug}`}
          className="block truncate text-sm font-medium hover:text-primary transition-colors"
        >
          {product.name}
        </Link>
        <p className="text-xs text-muted-foreground">{product.price}</p>
      </div>
      <button
        onClick={handleAddToCart}
        className="shrink-0 rounded-md bg-primary/10 p-1.5 text-primary hover:bg-primary/20 transition-colors"
        title="Ajouter au panier"
      >
        <ShoppingCart className="h-4 w-4" />
      </button>
    </div>
  );
}
