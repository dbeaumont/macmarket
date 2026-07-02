import { Link } from 'react-router-dom';
import type { Product } from '@/lib/api';
import { useCartStore } from '@/stores/cart-store';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';

const CATEGORY_LABELS: Record<string, string> = {
  MACBOOK_AIR: 'MacBook Air',
  MACBOOK_PRO: 'MacBook Pro',
  IMAC: 'iMac',
  MAC_MINI: 'Mac Mini',
  MAC_STUDIO: 'Mac Studio',
  MAC_PRO: 'Mac Pro',
};

export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCartStore();
  const available = product.stockQuantity - product.reservedQuantity;

  const handleAddToCart = () => {
    addItem(product.id, 1);
  };

  return (
    <Card className="group overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1">
      <Link to={`/products/${product.slug}`}>
        <div className="aspect-square overflow-hidden p-4" style={{ backgroundColor: '#F5F5F7' }}>
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-full w-full object-contain transition-transform group-hover:scale-105"
            loading="lazy"
          />
        </div>
      </Link>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <Badge variant="secondary" className="text-xs">
            {CATEGORY_LABELS[product.category] ?? product.category}
          </Badge>
          {available < 10 && available > 0 && (
            <Badge variant="destructive" className="text-xs">
              Plus que {available}
            </Badge>
          )}
        </div>
        <Link to={`/products/${product.slug}`}>
          <h3 className="mt-2 font-semibold text-sm line-clamp-2 hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>
        <p className="mt-1 text-xs text-muted-foreground line-clamp-1">
          {product.shortDesc}
        </p>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-lg font-bold">
            {product.price.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
          </span>
          <Button size="sm" variant="outline" disabled={available <= 0} onClick={handleAddToCart}>
            <ShoppingCart className="mr-1 h-4 w-4" />
            {available > 0 ? 'Ajouter' : 'Rupture'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
