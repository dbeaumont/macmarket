import { useQuery } from '@tanstack/react-query';
import { fetchAdminOrders } from '@/lib/api';

export function useAdminOrders(page: number, statusFilter: string) {
  const params = new URLSearchParams();
  params.set('page', String(page));
  params.set('size', '10');
  if (statusFilter) {
    params.set('status', statusFilter);
  }

  return useQuery({
    queryKey: ['admin-orders', page, statusFilter],
    queryFn: () => fetchAdminOrders(params),
  });
}
