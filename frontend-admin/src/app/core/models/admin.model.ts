export interface RevenueChartPoint {
  readonly date: string;
  readonly revenue: number;
}

export interface OrderChartPoint {
  readonly date: string;
  readonly count: number;
}

export interface RecentOrder {
  readonly id: string;
  readonly userId: string;
  readonly status: string;
  readonly total: number;
  readonly itemCount: number;
  readonly createdAt: string;
}

export interface LowStockProduct {
  readonly id: string;
  readonly name: string;
  readonly category: string;
  readonly price: number;
  readonly stockQuantity: number;
  readonly reservedQuantity: number;
  readonly availableQuantity: number;
}

export interface DashboardData {
  readonly totalOrders: number;
  readonly totalRevenue: number;
  readonly totalCustomers: number;
  readonly activeProducts: number;
  readonly lowStockCount: number;
  readonly ordersByStatus: Readonly<Record<string, number>>;
  readonly revenueChart: readonly RevenueChartPoint[];
  readonly recentOrders: readonly RecentOrder[];
  readonly lowStockProducts: readonly LowStockProduct[];
}

export interface PageResponse<T> {
  readonly content: readonly T[];
  readonly totalElements: number;
  readonly totalPages: number;
  readonly size: number;
  readonly number: number;
}

export interface AdminOrder {
  readonly id: string;
  readonly userId: string;
  readonly status: string;
  readonly total: number;
  readonly itemCount: number;
  readonly shippingName: string;
  readonly shippingAddress: string;
  readonly shippingEmail: string;
  readonly createdAt: string;
}

export interface OrderItem {
  readonly productId: string;
  readonly productName: string;
  readonly productImage: string;
  readonly unitPrice: number;
  readonly quantity: number;
  readonly subtotal: number;
}

export interface AdminOrderDetail extends AdminOrder {
  readonly items: readonly OrderItem[];
}

export interface CustomerSummary {
  readonly userId: string;
  readonly orderCount: number;
  readonly totalSpent: number;
  readonly lastOrderDate: string;
}

export interface Product {
  readonly id: string;
  readonly name: string;
  readonly slug: string;
  readonly description: string;
  readonly shortDesc: string;
  readonly price: number;
  readonly category: string;
  readonly imageUrl: string;
  readonly stockQuantity: number;
  readonly reservedQuantity: number;
  readonly active: boolean;
  readonly specs: Readonly<Record<string, string>>;
  readonly promotionPercentage: number;
  readonly discountedPrice: number;
  readonly createdAt: string;
}

export interface CreateProductRequest {
  readonly name: string;
  readonly slug: string;
  readonly description: string;
  readonly shortDesc: string;
  readonly price: number;
  readonly category: string;
  readonly imageUrl: string;
  readonly stockQuantity: number;
  readonly specs: Readonly<Record<string, string>>;
}

export interface UpdateProductRequest extends CreateProductRequest {
  readonly promotionPercentage: number;
}

export interface RevenueStatsData {
  readonly totalRevenue: number;
  readonly averageOrderValue: number;
  readonly orderCount: number;
  readonly chart: readonly RevenueChartPoint[];
}

export interface ProductStatsData {
  readonly totalProducts: number;
  readonly activeProducts: number;
  readonly lowStockCount: number;
  readonly lowStockProducts: readonly LowStockProduct[];
}

export interface CustomerStatsData {
  readonly totalCustomers: number;
  readonly newCustomers: number;
  readonly averageSpentPerCustomer: number;
  readonly totalRevenue: number;
}

export interface OrderStatsData {
  readonly totalOrders: number;
  readonly totalRevenue: number;
  readonly byStatus: Readonly<Record<string, number>>;
  readonly chart: readonly OrderChartPoint[];
}

export const ORDER_STATUS_LABELS: Readonly<Record<string, string>> = {
  PENDING_PAYMENT: 'En attente de paiement',
  CONFIRMED: 'Confirmée',
  PROCESSING: 'En traitement',
  SHIPPED: 'Expédiée',
  DELIVERED: 'Livrée',
  CANCELLED: 'Annulée',
};

export const CATEGORY_LABELS: Readonly<Record<string, string>> = {
  MACBOOK_AIR: 'MacBook Air',
  MACBOOK_PRO: 'MacBook Pro',
  IMAC: 'iMac',
  MAC_MINI: 'Mac Mini',
  MAC_STUDIO: 'Mac Studio',
  MAC_PRO: 'Mac Pro',
};
