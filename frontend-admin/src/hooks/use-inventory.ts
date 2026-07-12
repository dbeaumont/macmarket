import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchProducts, updateProduct } from '@/lib/api';
import type { Product } from '@/lib/api';

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

interface UpdatePromotionParams {
  readonly product: Product;
  readonly promotionPercentage: number;
}

export function useUpdatePromotion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ product, promotionPercentage }: UpdatePromotionParams) =>
      updateProduct(product.id, {
        name: product.name,
        slug: product.slug,
        description: product.description,
        shortDesc: product.shortDesc,
        price: product.price,
        category: product.category,
        imageUrl: product.imageUrl,
        stockQuantity: product.stockQuantity,
        specs: product.specs,
        promotionPercentage,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}
