import { useEffect, useState } from "react";

const ORDER_PARAM = "pedido";
const ORDER_NUMBER_PATTERN = /^[A-Za-z0-9-]{1,32}$/;

export function readOrderNumber(search: string): string | null {
  const value = new URLSearchParams(search).get(ORDER_PARAM);
  return value && ORDER_NUMBER_PATTERN.test(value) ? value : null;
}

export function useOrderNumber(): string | null {
  const [orderNumber, setOrderNumber] = useState<string | null>(null);

  useEffect(() => setOrderNumber(readOrderNumber(window.location.search)), []);

  return orderNumber;
}
