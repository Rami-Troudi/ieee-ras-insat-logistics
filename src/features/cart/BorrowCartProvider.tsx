import React, { useReducer, useEffect } from "react";
import { InventoryItemSummary } from "@/types";
import { CartState, initialCartState, CartContext } from "./CartContext";

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
      return {
        ...state,
        items: [],
        purpose: "",
      };
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
  const [state, dispatch] = useReducer(cartReducer, initialCartState);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        dispatch({ type: "LOAD_STATE", state: parsed });
      }
    } catch (e) {
      console.warn("Failed to parse stored cart state", e);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn("Failed to persist cart state", e);
    }
  }, [state]);

  const addItem = (item: InventoryItemSummary, quantity?: number) => {
    dispatch({ type: "ADD_ITEM", item, quantity });
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    dispatch({ type: "UPDATE_QUANTITY", itemId, quantity });
  };

  const removeItem = (itemId: string) => {
    dispatch({ type: "REMOVE_ITEM", itemId });
  };

  const clearCart = () => {
    dispatch({ type: "CLEAR_CART" });
  };

  const setProject = (projectId?: string) => {
    dispatch({ type: "SET_PROJECT", projectId });
  };

  const setPurpose = (purpose: string) => {
    dispatch({ type: "SET_PURPOSE", purpose });
  };

  const setReturnDate = (date: string) => {
    dispatch({ type: "SET_RETURN_DATE", date });
  };

  const totalItemCount = state.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        state,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        setProject,
        setPurpose,
        setReturnDate,
        totalItemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
