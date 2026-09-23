import React, { useReducer, useEffect } from "react";
import { BorrowerCatalogItem } from "@/types";
import { CartState, CartContextValue, getInitialCartState, CartContext } from "./CartContext";

type CartAction =
  | { type: "ADD_ITEM"; item: BorrowerCatalogItem; quantity?: number }
  | { type: "UPDATE_QUANTITY"; itemId: string; quantity: number }
  | { type: "REMOVE_ITEM"; itemId: string }
  | { type: "CLEAR_CART" }
  | { type: "SET_NOTE"; note: string }
  | { type: "SET_RETURN_DATE"; date: string };

const CART_STORAGE_KEY = "ras_insat_cart_draft_v2";

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD_ITEM": {
      if (action.item.action !== "REQUEST") return state;
      const existing = state.items.find((i) => i.item.id === action.item.id);
      const addQty = Math.min(99, Math.max(1, action.quantity || 1));
      if (existing) {
        const newQty = Math.min(99, existing.quantity + addQty);
        return {
          ...state,
          items: state.items.map((i) =>
            i.item.id === action.item.id ? { ...i, quantity: newQty } : i
          ),
        };
      }
      return {
        ...state,
        items: [...state.items, { item: action.item, quantity: addQty }],
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
          i.item.id === action.itemId ? { ...i, quantity: Math.min(99, action.quantity) } : i
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
    case "SET_NOTE":
      return {
        ...state,
        note: action.note,
      };
    case "SET_RETURN_DATE":
      return {
        ...state,
        expectedReturnDate: action.date,
      };
    default:
      return state;
  }
}

export const BorrowCartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, undefined, () => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as CartState;
        if (Array.isArray(parsed.items)) {
          return {
            items: parsed.items.filter(
              (line) =>
                line.item?.action === "REQUEST" &&
                Number.isInteger(line.quantity) &&
                line.quantity > 0
            ),
            note: typeof parsed.note === "string" ? parsed.note : "",
            expectedReturnDate:
              parsed.expectedReturnDate || getInitialCartState().expectedReturnDate,
          };
        }
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

  const addItem = React.useCallback((item: BorrowerCatalogItem, quantity?: number) => {
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

  const setNote = React.useCallback((note: string) => {
    dispatch({ type: "SET_NOTE", note });
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
      setNote,
      setReturnDate,
      totalItemCount,
    }),
    [state, addItem, updateQuantity, removeItem, clearCart, setNote, setReturnDate, totalItemCount]
  );

  return <CartContext.Provider value={contextValue}>{children}</CartContext.Provider>;
};
