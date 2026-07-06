import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchProducts, createProduct, updateProduct } from '@/lib/api';
import type { Product, CreateProductRequest, UpdateProductRequest } from '@/lib/api';

export interface SpecEntry {
  readonly key: string;
  readonly value: string;
}

export function toSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function useEditableProduct(id: string | undefined) {
  const isEdit = Boolean(id);
  const { data: productsPage, isLoading } = useQuery({
    queryKey: ['product-edit', id],
    queryFn: () => {
      const params = new URLSearchParams();
      params.set('size', '1000');
      return fetchProducts(params);
    },
    enabled: isEdit,
  });

  const existingProduct: Product | undefined = productsPage?.content.find((p) => p.id === id);

  return { isEdit, isLoading: isEdit && isLoading, existingProduct };
}

export function useProductFormMutations(id: string | undefined) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data: CreateProductRequest) => createProduct(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      navigate('/inventory');
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: UpdateProductRequest) => updateProduct(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      navigate('/inventory');
    },
  });

  return {
    createMutation,
    updateMutation,
    isSubmitting: createMutation.isPending || updateMutation.isPending,
    error: createMutation.error || updateMutation.error,
  };
}

export function useSpecEntries(initial: readonly SpecEntry[] = []) {
  const [specs, setSpecs] = useState<readonly SpecEntry[]>(initial);

  function addSpec(): void {
    setSpecs([...specs, { key: '', value: '' }]);
  }

  function removeSpec(index: number): void {
    setSpecs([...specs.slice(0, index), ...specs.slice(index + 1)]);
  }

  function updateSpec(index: number, field: 'key' | 'value', newValue: string): void {
    setSpecs(specs.map((entry, i) => (i === index ? { ...entry, [field]: newValue } : entry)));
  }

  return { specs, setSpecs, addSpec, removeSpec, updateSpec };
}
