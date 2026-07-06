import { useQuery } from '@tanstack/react-query';
import { fetchProducts } from '@/lib/api';

export function useInventory(page: number, search: string) {
  const params = new URLSearchParams();
  params.set('page', String(page));
  params.set('size', '10');
  if (search) {
    params.set('search', search);
  }

  return useQuery({
    queryKey: ['products', page, search],
    queryFn: () => fetchProducts(params),
  });
}
