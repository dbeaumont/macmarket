export interface OrderItem {
  readonly productId: string;
  readonly productName: string;
  readonly productImage: string;
  readonly unitPrice: number;
  readonly quantity: number;
  readonly subtotal: number;
}

export interface OrderResponse {
  readonly id: string;
  readonly userId: string;
  readonly status: string;
  readonly items: readonly OrderItem[];
  readonly total: number;
  readonly shippingName: string;
  readonly shippingAddress: string;
  readonly shippingEmail: string;
  readonly createdAt: string;
}

export interface PaymentResponse {
  readonly id: string;
  readonly orderId: string;
  readonly amount: number;
  readonly status: string;
  readonly transactionRef: string;
  readonly failureReason: string;
  readonly createdAt: string;
}

export interface PlaceOrderRequest {
  readonly shippingName: string;
  readonly shippingAddress: string;
  readonly shippingEmail: string;
}

export const ORDER_STATUS_LABELS: Readonly<Record<string, string>> = {
  PENDING_PAYMENT: 'En attente de paiement',
  CONFIRMED: 'Confirmée',
  PROCESSING: 'En traitement',
  SHIPPED: 'Expédiée',
  DELIVERED: 'Livrée',
  CANCELLED: 'Annulée',
};
