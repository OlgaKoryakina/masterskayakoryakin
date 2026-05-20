import { useEffect, useState, useCallback } from "react";

export type CartItem = {
  product_id: string;
  slug: string;
  title: string;
  image?: string;
  category: "belt" | "buckle";
  note?: string;
};

const KEY = "mk_cart_v1";

function read(): CartItem[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; }
}

function write(items: CartItem[]) {
  localStorage.setItem(KEY, JSON.stringify(items));
  window.dispatchEvent(new Event("mk-cart-change"));
}

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    setItems(read());
    const handler = () => setItems(read());
    window.addEventListener("mk-cart-change", handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener("mk-cart-change", handler);
      window.removeEventListener("storage", handler);
    };
  }, []);

  const add = useCallback((item: CartItem) => {
    const cur = read();
    if (cur.find((i) => i.product_id === item.product_id)) return;
    write([...cur, item]);
  }, []);

  const remove = useCallback((id: string) => {
    write(read().filter((i) => i.product_id !== id));
  }, []);

  const updateNote = useCallback((id: string, note: string) => {
    write(read().map((i) => (i.product_id === id ? { ...i, note } : i)));
  }, []);

  const clear = useCallback(() => write([]), []);

  return { items, add, remove, updateNote, clear, count: items.length };
}
