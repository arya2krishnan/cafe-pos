'use client';
import { create } from 'zustand';
import { CartItem, ItemData } from '@/types';

interface CartStore {
  items: CartItem[];
  addItem: (item: ItemData, selectedOptions: Record<string, string[]>, quantity: number) => void;
  removeItem: (index: number) => void;
  clearCart: () => void;
  updateQuantity: (index: number, quantity: number) => void;
}

export const useCartStore = create<CartStore>((set) => ({
  items: [],

  addItem: (item, selectedOptions, quantity) => {
    set((state) => ({
      items: [...state.items, { id: `${item.id}-${Date.now()}`, item, selectedOptions, quantity }],
    }));
  },

  removeItem: (index) => {
    set((state) => ({ items: state.items.filter((_, i) => i !== index) }));
  },

  clearCart: () => set({ items: [] }),

  updateQuantity: (index, quantity) => {
    set((state) => ({
      items: state.items.map((item, i) => (i === index ? { ...item, quantity } : item)),
    }));
  },
}));
