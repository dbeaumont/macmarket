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

export interface PageResponse<T> {
  readonly content: readonly T[];
  readonly totalElements: number;
  readonly totalPages: number;
  readonly size: number;
  readonly number: number;
}

export interface CategoryCount {
  readonly category: string;
  readonly count: number;
}

export const CATEGORY_LABELS: Readonly<Record<string, string>> = {
  MACBOOK_AIR: 'MacBook Air',
  MACBOOK_PRO: 'MacBook Pro',
  IMAC: 'iMac',
  MAC_MINI: 'Mac Mini',
  MAC_STUDIO: 'Mac Studio',
  MAC_PRO: 'Mac Pro',
};
