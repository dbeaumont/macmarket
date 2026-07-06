import { useQuery } from '@tanstack/react-query';
import { fetchCustomerOrders } from '@/lib/api';

export function useCustomerOrders(userId: string | undefined) {
  return useQuery({
    queryKey: ['customer-orders', userId],
    queryFn: () => fetchCustomerOrders(userId!),
    enabled: Boolean(userId),
  });
}
