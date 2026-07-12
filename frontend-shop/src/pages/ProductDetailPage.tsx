import { useParams, Link } from 'react-router-dom';
import { useProduct } from '@/hooks/use-products';
import { useCartStore } from '@/stores/cart-store';
import { ProductDetailSkeleton } from '@/components/ui/loading-skeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, ArrowLeft } from 'lucide-react';

const CATEGORY_LABELS: Record<string, string> = {
  MACBOOK_AIR: 'MacBook Air',
  MACBOOK_PRO: 'MacBook Pro',
  IMAC: 'iMac',
  MAC_MINI: 'Mac Mini',
  MAC_STUDIO: 'Mac Studio',
  MAC_PRO: 'Mac Pro',
};

export function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { addItem } = useCartStore();
  const { data: product, isLoading } = useProduct(slug!);

  const handleAddToCart = () => {
    if (product) addItem(product.id, 1);
  };

  if (isLoading) {
    return <ProductDetailSkeleton />;
  }

  if (!product) return null;

  const available = product.stockQuantity - product.reservedQuantity;

  return (
    <div className="container mx-auto px-4 py-8">
      <Link to="/products" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
        <ArrowLeft className="h-4 w-4" /> Retour au catalogue
      </Link>

      <div className="grid md:grid-cols-2 gap-12">
        <div
          className="aspect-square overflow-hidden rounded-xl p-8"
          style={{ backgroundColor: product.backgroundColor }}
        >
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-full w-full object-contain"
          />
        </div>

        <div>
          <Badge variant="secondary">
            {CATEGORY_LABELS[product.category] ?? product.category}
          </Badge>
          <h1 className="mt-3 text-3xl font-bold">{product.name}</h1>
          <p className="mt-2 text-muted-foreground">{product.shortDesc}</p>

          <div className="mt-6">
            <span className="text-4xl font-bold">
              {product.price.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
            </span>
          </div>

          <div className="mt-4 text-sm">
            {available > 10 ? (
              <span className="text-green-600">En stock</span>
            ) : available > 0 ? (
              <span className="text-orange-600">Plus que {available} en stock</span>
            ) : (
              <span className="text-red-600">Rupture de stock</span>
            )}
          </div>

          <Button size="lg" className="mt-6 w-full md:w-auto" disabled={available <= 0} onClick={handleAddToCart}>
            <ShoppingCart className="mr-2 h-5 w-5" />
            {available > 0 ? 'Ajouter au panier' : 'Indisponible'}
          </Button>

          {product.description && (
            <div className="mt-8">
              <h2 className="text-lg font-semibold mb-2">Description</h2>
              <p className="text-muted-foreground">{product.description}</p>
            </div>
          )}

          {Object.keys(product.specs).length > 0 && (
            <div className="mt-8">
              <h2 className="text-lg font-semibold mb-3">Specifications</h2>
              <div className="border rounded-lg divide-y">
                {Object.entries(product.specs).map(([key, value]) => (
                  <div key={key} className="flex justify-between py-3 px-4 text-sm">
                    <span className="font-medium capitalize">{key}</span>
                    <span className="text-muted-foreground">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
