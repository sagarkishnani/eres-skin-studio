import { useEffect, useState } from "react";

const ORDER_PARAM = "pedido";
const ORDER_NUMBER_PATTERN = /^[A-Za-z0-9-]{1,32}$/;
const ORDER_KEY_PARAM = "clave";
const ORDER_KEY_PATTERN = /^wc_order_[A-Za-z0-9]{1,40}$/;

export function readOrderNumber(search: string): string | null {
  const value = new URLSearchParams(search).get(ORDER_PARAM);
  return value && ORDER_NUMBER_PATTERN.test(value) ? value : null;
}

export function useOrderNumber(): string | null {
  const [orderNumber, setOrderNumber] = useState<string | null>(null);

  useEffect(() => setOrderNumber(readOrderNumber(window.location.search)), []);

  return orderNumber;
}

function takeOrderKeyFromUrl(): string | null {
  const url = new URL(window.location.href);
  const value = url.searchParams.get(ORDER_KEY_PARAM);
  if (value === null) return null;

  url.searchParams.delete(ORDER_KEY_PARAM);
  window.history.replaceState(window.history.state, "", `${url.pathname}${url.search}${url.hash}`);
  return ORDER_KEY_PATTERN.test(value) ? value : null;
}

export function useOrderKey(): string | null {
  const [orderKey, setOrderKey] = useState<string | null>(null);

  useEffect(() => setOrderKey(takeOrderKeyFromUrl()), []);

  return orderKey;
}
