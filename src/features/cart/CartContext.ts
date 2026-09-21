import { createContext } from "react";
import { InventoryItemSummary } from "@/types";

export interface CartLineItem {
  item: InventoryItemSummary;
  quantity: number;
}

export interface CartState {
  items: CartLineItem[];
  projectId?: string;
  purpose: string;
  expectedReturnDate: string;
}

export interface CartContextValue {
  state: CartState;
  addItem: (item: InventoryItemSummary, quantity?: number) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  removeItem: (itemId: string) => void;
  clearCart: () => void;
  setProject: (projectId?: string) => void;
  setPurpose: (purpose: string) => void;
  setReturnDate: (date: string) => void;
  totalItemCount: number;
}

export const defaultReturnDate = () => {
  const d = new Date();
  d.setDate(d.getDate() + 14);
  return d.toISOString().split("T")[0];
};

export const initialCartState: CartState = {
  items: [],
  purpose: "",
  expectedReturnDate: defaultReturnDate(),
};

export const fallbackCartValue: CartContextValue = {
  state: initialCartState,
  addItem: () => {},
  updateQuantity: () => {},
  removeItem: () => {},
  clearCart: () => {},
  setProject: () => {},
  setPurpose: () => {},
  setReturnDate: () => {},
  totalItemCount: 0,
};

export const CartContext = createContext<CartContextValue | null>(null);
