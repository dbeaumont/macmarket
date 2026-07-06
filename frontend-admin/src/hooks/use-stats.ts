import { useQuery } from '@tanstack/react-query';
import { fetchCustomerStats, fetchProductStats, fetchRevenueStats, fetchOrderStats } from '@/lib/api';
import type { Period } from '@/components/shared/PeriodSelector';

export function useCustomerStats(period: Period) {
  return useQuery({
    queryKey: ['stats', 'customers', period],
    queryFn: () => fetchCustomerStats(period),
  });
}

export function useProductStats(period: Period) {
  return useQuery({
    queryKey: ['stats', 'products', period],
    queryFn: () => fetchProductStats(period),
  });
}

export function useRevenueStats(period: Period) {
  return useQuery({
    queryKey: ['stats', 'revenue', period],
    queryFn: () => fetchRevenueStats(period),
  });
}

export function useOrderStats(period: Period) {
  return useQuery({
    queryKey: ['stats', 'orders', period],
    queryFn: () => fetchOrderStats(period),
  });
}
