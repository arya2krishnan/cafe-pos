'use client';
import { ItemData, OrderData, StoreSession, CafeConfig, ApiResponse } from '@/types';

// Calls the Next.js API routes. Protected routes require an idToken.

async function apiFetch<T>(
  url: string,
  options: RequestInit = {},
  idToken?: string | null,
): Promise<ApiResponse<T>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (idToken) headers['Authorization'] = `Bearer ${idToken}`;

  try {
    const res = await fetch(url, { ...options, headers });
    const data = await res.json();
    if (!res.ok) return { success: false, error: data.error || `HTTP ${res.status}` };
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Network error' };
  }
}

export function createApiService(slug: string, getIdToken: () => Promise<string | null>) {
  const base = `/api/${slug}`;

  return {
    getCafeConfig: () => apiFetch<CafeConfig>(`${base}/config`),

    getShopStatus: () =>
      apiFetch<{ isOpen: boolean }>(`${base}/shop`),

    toggleShopStatus: async (isOpen: boolean) => {
      const token = await getIdToken();
      return apiFetch<{ isOpen: boolean }>(`${base}/shop`, {
        method: 'POST',
        body: JSON.stringify({ isOpen }),
      }, token);
    },

    getItems: (): Promise<ApiResponse<ItemData[]>> =>
      apiFetch<ItemData[]>(`${base}/items`).then((r) => {
        if (!r.success || !r.data) return r;
        const transformed = r.data.map((item: any) => ({
          ...item,
          title: item.name,
          soldOut: item.soldOut ?? false,
          displayOrder: item.displayOrder ?? 999,
          options: Array.isArray(item.options) ? item.options : [],
          category: item.category || 'misc',
        }));
        return { success: true, data: transformed };
      }),

    createItem: async (itemData: Partial<ItemData>) => {
      const token = await getIdToken();
      return apiFetch<{ itemId: string; item: ItemData }>(`${base}/items`, {
        method: 'POST',
        body: JSON.stringify(itemData),
      }, token);
    },

    updateItem: async (itemId: string, updates: Partial<ItemData>) => {
      const token = await getIdToken();
      return apiFetch<{ ok: boolean }>(`${base}/items/${itemId}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      }, token);
    },

    deleteItem: async (itemId: string) => {
      const token = await getIdToken();
      return apiFetch<{ message: string }>(`${base}/items/${itemId}`, { method: 'DELETE' }, token);
    },

    uploadItemImage: async (itemId: string, image: File) => {
      const token = await getIdToken();
      const base64Data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsDataURL(image);
      });
      return apiFetch<{ imageUrl: string }>(`${base}/upload`, {
        method: 'POST',
        body: JSON.stringify({ itemId, base64Data, filename: image.name, mimeType: image.type }),
      }, token);
    },

    submitOrder: (orderData: Partial<OrderData>) =>
      apiFetch<{ orderId: string; orderNumber: number }>(`${base}/orders`, {
        method: 'POST',
        body: JSON.stringify(orderData),
      }),

    getUnfinishedOrders: async () => {
      const token = await getIdToken();
      return apiFetch<OrderData[]>(`${base}/orders?type=unfinished`, {}, token);
    },

    getCompletedOrders: async () => {
      const token = await getIdToken();
      return apiFetch<OrderData[]>(`${base}/orders?type=completed`, {}, token);
    },

    finishOrder: async (orderId: string) => {
      const token = await getIdToken();
      return apiFetch<{ message: string; textOptIn?: boolean; textError?: boolean }>(
        `${base}/orders/${orderId}/finish`,
        { method: 'POST' },
        token,
      );
    },

    deleteOrder: async (orderId: string) => {
      const token = await getIdToken();
      return apiFetch<{ message: string }>(`${base}/orders/${orderId}`, { method: 'DELETE' }, token);
    },

    getStoreSessions: async () => {
      const token = await getIdToken();
      return apiFetch<StoreSession[]>(`${base}/sessions`, {}, token);
    },

    getOrdersByStore: async (storeNumber: number) => {
      const token = await getIdToken();
      return apiFetch<OrderData[]>(`${base}/sessions/${storeNumber}`, {}, token);
    },
  };
}
