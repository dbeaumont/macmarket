import type { Product } from '@/lib/api';
import { ProductCard } from './ProductCard';

export function ProductGrid({ products }: { readonly products: readonly Product[] }) {
  if (products.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <p className="text-lg">Aucun produit trouve.</p>
        <p className="text-sm mt-1">Essayez de modifier vos filtres.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
