import { useQuery } from '@tanstack/react-query';
import { fetchCustomers } from '@/lib/api';

export function useCustomers(page: number) {
  const params = new URLSearchParams();
  params.set('page', String(page));
  params.set('size', '10');

  return useQuery({
    queryKey: ['customers', page],
    queryFn: () => fetchCustomers(params),
  });
}
