import { useSearchParams } from 'react-router-dom';
import { useProducts } from '@/hooks/use-products';
import { ProductGrid } from '@/components/product/ProductGrid';
import { ProductFilters } from '@/components/product/ProductFilters';
import { ProductGridSkeleton } from '@/components/ui/loading-skeleton';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export function ProductListPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const page = parseInt(searchParams.get('page') || '0');
  const size = parseInt(searchParams.get('size') || '12');
  const sort = searchParams.get('sort') || 'createdAt,desc';
  const category = searchParams.get('category') || '';
  const search = searchParams.get('search') || '';

  const apiParams = new URLSearchParams();
  apiParams.set('page', String(page));
  apiParams.set('size', String(size));
  apiParams.set('sort', sort);
  if (category) apiParams.set('category', category);
  if (search) apiParams.set('search', search);

  const { data, isLoading } = useProducts(apiParams);

  function updateParam(key: string, value: string) {
    const next = new URLSearchParams(searchParams);
    if (value) {
      next.set(key, value);
    } else {
      next.delete(key);
    }
    next.set('page', '0');
    setSearchParams(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function goToPage(p: number) {
    const next = new URLSearchParams(searchParams);
    next.set('page', String(p));
    setSearchParams(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function resetFilters() {
    setSearchParams({});
  }

  const totalPages = data?.totalPages ?? 0;
  const totalElements = data?.totalElements ?? 0;
  const from = page * size + 1;
  const to = Math.min((page + 1) * size, totalElements);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Catalogue Mac</h1>

      <ProductFilters
        search={search}
        category={category}
        sort={sort}
        onSearchChange={(v) => updateParam('search', v)}
        onCategoryChange={(v) => updateParam('category', v)}
        onSortChange={(v) => updateParam('sort', v)}
        onReset={resetFilters}
      />

      <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
        <span>
          {totalElements > 0
            ? `Affichage ${from}-${to} sur ${totalElements} produits`
            : 'Aucun produit'}
        </span>
        <Select value={String(size)} onValueChange={(v) => v && updateParam('size', v)}>
          <SelectTrigger className="w-[120px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="12">12 / page</SelectItem>
            <SelectItem value="24">24 / page</SelectItem>
            <SelectItem value="48">48 / page</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="mt-6">
        {isLoading ? (
          <ProductGridSkeleton count={size} />
        ) : (
          data && <ProductGrid products={data.content} />
        )}
      </div>

      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page === 0} onClick={() => goToPage(page - 1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          {Array.from({ length: totalPages }).map((_, i) => (
            <Button
              key={i}
              variant={i === page ? 'default' : 'outline'}
              size="sm"
              onClick={() => goToPage(i)}
              className="min-w-[36px]"
            >
              {i + 1}
            </Button>
          ))}
          <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => goToPage(page + 1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
