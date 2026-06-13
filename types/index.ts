export interface CartItem {
  id: string;
  item: ItemData;
  selectedOptions: Record<string, string[]>;
  quantity: number;
  specialRequests?: string;
}

export interface ItemData {
  id?: string | number;
  name: string;
  description?: string;
  imageUrl?: string;
  options?: ItemOption[];
  title?: string;
  category?: string;
  soldOut?: boolean;
  displayOrder?: number;
  archived?: boolean;
  allowSpecialRequests?: boolean;
}

export interface ItemOption {
  name: string;
  values: string[];
  isMultiple: boolean;
  defaultValue?: string;
}

export interface OptionTemplate {
  id: string;
  name: string;
  values: string[];
  isMultiple: boolean;
  createdAt: string;
}

export interface OrderData {
  id?: string | number;
  orderNumber: number;
  customerName: string;
  customerPhone: string;
  textOptIn: boolean;
  items: CartItem[];
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
  isTemporary?: boolean;
}

export interface CafeConfig {
  name: string;
  slug: string;
  logoUrl: string;
  venmoUsername: string;
  userId: string;
  customSmsMessage?: string;
  accentColor?: string;
  tipsEnabled?: boolean;
  tipButtonEnabled?: boolean; // controls the floating "Leave a tip" button
  // Per-cafe Twilio — never sent to the browser, server-only
  twilioAccountSid?: string;
  twilioAuthToken?: string;
  twilioPhoneNumber?: string;
  // Safe flag the settings page can read
  hasTwilioCreds?: boolean;
}

export interface CategoryData {
  name: string;        // also the Firestore doc ID
  displayOrder: number;
  createdAt: string;
  archived?: boolean;
}

export interface ApiResponse<T = Record<string, unknown>> {
  success: boolean;
  data?: T;
  error?: string;
}
