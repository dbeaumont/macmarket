import { useMutation } from '@tanstack/react-query';
import { placeOrder } from '@/lib/api';
import type { OrderResponse } from '@/lib/api';

export interface PlaceOrderInput {
  readonly shippingName: string;
  readonly shippingAddress: string;
  readonly shippingEmail: string;
}

export function usePlaceOrder() {
  return useMutation<OrderResponse, Error, PlaceOrderInput>({
    mutationFn: placeOrder,
  });
}
