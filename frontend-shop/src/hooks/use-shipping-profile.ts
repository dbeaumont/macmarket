import { useQuery } from '@tanstack/react-query';
import { useAuth } from 'react-oidc-context';
import { fetchShippingProfile } from '@/lib/api';

export function useShippingProfile() {
  const auth = useAuth();

  return useQuery({
    queryKey: ['shipping-profile'],
    queryFn: fetchShippingProfile,
    enabled: auth.isAuthenticated,
  });
}
