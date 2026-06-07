export interface CartItem {
  id: string;
  item: ItemData;
  selectedOptions: Record<string, string[]>;
  quantity: number;
}

export interface ItemData {
  id?: string | number;
  name: string;
  price: number;
  description?: string;
  imageUrl?: string;
  options?: ItemOption[];
  title?: string;
  category?: string;
  soldOut?: boolean;
  displayOrder?: number;
}

export interface ItemOption {
  name: string;
  values: string[];
  isMultiple: boolean;
}

export interface OrderData {
  id?: string | number;
  orderNumber: number;
  customerName: string;
  customerPhone: string;
  textOptIn: boolean;
  items: CartItem[];
  totalAmount: number;
  orderDate: string;
  donation: { donated: boolean; amount?: number };
  storeNumber?: number;
  finished?: boolean;
  createdAt?: string;
}

export interface ShopStatus {
  isOpen: boolean;
}

export interface StoreSession {
  id: string;
  storeNumber: number;
  startTime: string;
  endTime?: string;
  isActive: boolean;
  orderCount: number;
  totalRevenue: number;
  isTemporary?: boolean;
}

export interface CafeConfig {
  name: string;
  slug: string;
  logoUrl: string;
  venmoUsername: string;
  userId: string;
  customSmsMessage?: string;
}

export interface ApiResponse<T = Record<string, unknown>> {
  success: boolean;
  data?: T;
  error?: string;
}
