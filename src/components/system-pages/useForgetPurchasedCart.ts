import { useEffect } from "react";
import { forgetCart } from "../../utils/wooClient";
import { insideTinaEditor } from "../../utils/reveal";

export function useForgetPurchasedCart(orderNumber: string | null): void {
  useEffect(() => {
    if (orderNumber && !insideTinaEditor()) forgetCart();
  }, [orderNumber]);
}
