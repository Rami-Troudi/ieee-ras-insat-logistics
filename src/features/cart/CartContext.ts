import { createContext } from "react";
import { BorrowerCatalogItem } from "@/types";

export interface CartLineItem {
  item: BorrowerCatalogItem;
  quantity: number;
}

export interface CartState {
  items: CartLineItem[];
  note: string;
  expectedReturnDate: string;
}

export interface CartContextValue {
  state: CartState;
  addItem: (item: BorrowerCatalogItem, quantity?: number) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  removeItem: (itemId: string) => void;
  clearCart: () => void;
  setNote: (note: string) => void;
  setReturnDate: (date: string) => void;
  totalItemCount: number;
}

export const defaultReturnDate = () => {
  const d = new Date();
  d.setDate(d.getDate() + 14);
  return d.toISOString().split("T")[0];
};

export const getInitialCartState = (): CartState => ({
  items: [],
  note: "",
  expectedReturnDate: defaultReturnDate(),
});

export const initialCartState: CartState = getInitialCartState();

export const fallbackCartValue: CartContextValue = {
  state: initialCartState,
  addItem: () => {},
  updateQuantity: () => {},
  removeItem: () => {},
  clearCart: () => {},
  setNote: () => {},
  setReturnDate: () => {},
  totalItemCount: 0,
};

export const CartContext = createContext<CartContextValue | null>(null);
