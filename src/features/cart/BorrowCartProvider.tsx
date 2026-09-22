import React, { useReducer, useEffect } from "react";
import { InventoryItemSummary } from "@/types";
import { CartState, CartContextValue, getInitialCartState, CartContext } from "./CartContext";

type CartAction =
  | { type: "ADD_ITEM"; item: InventoryItemSummary; quantity?: number }
  | { type: "UPDATE_QUANTITY"; itemId: string; quantity: number }
  | { type: "REMOVE_ITEM"; itemId: string }
  | { type: "CLEAR_CART" }
  | { type: "SET_PROJECT"; projectId?: string }
  | { type: "SET_PURPOSE"; purpose: string }
  | { type: "SET_RETURN_DATE"; date: string }
  | { type: "LOAD_STATE"; state: CartState };

const CART_STORAGE_KEY = "ras_insat_cart_draft_v1";

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD_ITEM": {
      const existing = state.items.find((i) => i.item.id === action.item.id);
      const addQty = action.quantity || 1;
      if (existing) {
        const newQty = Math.min(existing.quantity + addQty, action.item.availableQuantity);
        return {
          ...state,
          items: state.items.map((i) =>
            i.item.id === action.item.id ? { ...i, quantity: newQty } : i
          ),
        };
      }
      return {
        ...state,
        items: [
          ...state.items,
          { item: action.item, quantity: Math.min(addQty, action.item.availableQuantity) },
        ],
      };
    }
    case "UPDATE_QUANTITY": {
      if (action.quantity <= 0) {
        return {
          ...state,
          items: state.items.filter((i) => i.item.id !== action.itemId),
        };
      }
      return {
        ...state,
        items: state.items.map((i) =>
          i.item.id === action.itemId
            ? { ...i, quantity: Math.min(action.quantity, i.item.availableQuantity) }
            : i
        ),
      };
    }
    case "REMOVE_ITEM":
      return {
        ...state,
        items: state.items.filter((i) => i.item.id !== action.itemId),
      };
    case "CLEAR_CART":
      return getInitialCartState();
    case "SET_PROJECT":
      return {
        ...state,
        projectId: action.projectId,
      };
    case "SET_PURPOSE":
      return {
        ...state,
        purpose: action.purpose,
      };
    case "SET_RETURN_DATE":
      return {
        ...state,
        expectedReturnDate: action.date,
      };
    case "LOAD_STATE":
      return action.state;
    default:
      return state;
  }
}

export const BorrowCartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, undefined, () => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // ignore
    }
    return getInitialCartState();
  });

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn("Failed to persist cart state", e);
    }
  }, [state]);

  const addItem = React.useCallback((item: InventoryItemSummary, quantity?: number) => {
    dispatch({ type: "ADD_ITEM", item, quantity });
  }, []);

  const updateQuantity = React.useCallback((itemId: string, quantity: number) => {
    dispatch({ type: "UPDATE_QUANTITY", itemId, quantity });
  }, []);

  const removeItem = React.useCallback((itemId: string) => {
    dispatch({ type: "REMOVE_ITEM", itemId });
  }, []);

  const clearCart = React.useCallback(() => {
    dispatch({ type: "CLEAR_CART" });
  }, []);

  const setProject = React.useCallback((projectId?: string) => {
    dispatch({ type: "SET_PROJECT", projectId });
  }, []);

  const setPurpose = React.useCallback((purpose: string) => {
    dispatch({ type: "SET_PURPOSE", purpose });
  }, []);

  const setReturnDate = React.useCallback((date: string) => {
    dispatch({ type: "SET_RETURN_DATE", date });
  }, []);

  const totalItemCount = state.items.reduce((sum, item) => sum + item.quantity, 0);

  const contextValue = React.useMemo<CartContextValue>(
    () => ({
      state,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
      setProject,
      setPurpose,
      setReturnDate,
      totalItemCount,
    }),
    [
      state,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
      setProject,
      setPurpose,
      setReturnDate,
      totalItemCount,
    ]
  );

  return <CartContext.Provider value={contextValue}>{children}</CartContext.Provider>;
};
