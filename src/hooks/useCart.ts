import { useState, useCallback } from "react";
import { MenuItem } from "@/data/menuData";

export interface CartItem {
  item: MenuItem;
  quantity: number;
}

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = useCallback((item: MenuItem, qty = 1) => {
    setItems((prev) => {
      const existing = prev.find((ci) => ci.item.id === item.id);
      if (existing) {
        return prev.map((ci) =>
          ci.item.id === item.id ? { ...ci, quantity: ci.quantity + qty } : ci
        );
      }
      return [...prev, { item, quantity: qty }];
    });
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((ci) => ci.item.id !== id));
  }, []);

  const updateQuantity = useCallback((id: string, qty: number) => {
    if (qty <= 0) {
      setItems((prev) => prev.filter((ci) => ci.item.id !== id));
    } else {
      setItems((prev) =>
        prev.map((ci) => (ci.item.id === id ? { ...ci, quantity: qty } : ci))
      );
    }
  }, []);

  const totalItems = items.reduce((sum, ci) => sum + ci.quantity, 0);
  const totalPrice = items.reduce(
    (sum, ci) => sum + ci.item.price * ci.quantity,
    0
  );

  return { items, addItem, removeItem, updateQuantity, totalItems, totalPrice };
}
