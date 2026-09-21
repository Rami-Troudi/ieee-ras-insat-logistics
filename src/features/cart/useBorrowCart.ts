import { useContext } from "react";
import { CartContext, fallbackCartValue, CartContextValue } from "./CartContext";

export function useBorrowCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) {
    return fallbackCartValue;
  }
  return ctx;
}
