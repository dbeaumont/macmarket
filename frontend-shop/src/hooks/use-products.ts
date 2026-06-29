import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { fetchProducts, fetchProduct, fetchCategories } from '@/lib/api';

export function useProducts(params: URLSearchParams) {
  return useQuery({
    queryKey: ['products', params.toString()],
    queryFn: () => fetchProducts(params),
    placeholderData: keepPreviousData,
  });
}

export function useProduct(slug: string) {
  return useQuery({
    queryKey: ['product', slug],
    queryFn: () => fetchProduct(slug),
    enabled: !!slug,
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
    staleTime: 60_000,
  });
}
