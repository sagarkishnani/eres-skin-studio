import { useCallback, useEffect, useRef, useState } from "react";
import { getCart, updateCartItem, removeCartItem, CART_UPDATED } from "../utils/wooClient";
import type { WooCart } from "../lib/woo/types";

const BUMP_MS = 350;

export function useCart() {
  const [cart, setCart] = useState<WooCart | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [busy, setBusy] = useState(false);
  const [bumping, setBumping] = useState(false);
  const previousCount = useRef<number | null>(null);

  useEffect(() => {
    getCart().finally(() => setLoaded(true));
    const onUpdate = (event: Event) => setCart((event as CustomEvent<WooCart>).detail);
    window.addEventListener(CART_UPDATED, onUpdate);
    return () => window.removeEventListener(CART_UPDATED, onUpdate);
  }, []);

  const count = cart?.items_count ?? 0;

  useEffect(() => {
    const grew = previousCount.current !== null && count > previousCount.current;
    previousCount.current = count;
    if (!grew) return;
    setBumping(true);
    const timer = setTimeout(() => setBumping(false), BUMP_MS);
    return () => clearTimeout(timer);
  }, [count]);

  const changeQuantity = useCallback(async (key: string, quantity: number) => {
    setBusy(true);
    await (quantity <= 0 ? removeCartItem(key) : updateCartItem(key, quantity));
    setBusy(false);
  }, []);

  return { cart, loaded, count, busy, bumping, changeQuantity };
}
