import { useEffect, useState, useCallback } from "react";
import { FaCartShopping, FaXmark, FaTrash } from "react-icons/fa6";
import { getCart, updateCartItem, removeCartItem, checkoutUrl, CART_UPDATED } from "../../utils/wooClient";
import type { WooCart } from "../../lib/woo/types";
import { formatPrice } from "../../lib/woo/format";

export default function CartReact() {
  const [cart, setCart] = useState<WooCart | null>(null);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    getCart();
    const onUpdate = (e: Event) => setCart((e as CustomEvent<WooCart>).detail);
    window.addEventListener(CART_UPDATED, onUpdate);
    return () => window.removeEventListener(CART_UPDATED, onUpdate);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  const changeQuantity = useCallback(async (key: string, quantity: number) => {
    setBusy(true);
    await (quantity <= 0 ? removeCartItem(key) : updateCartItem(key, quantity));
    setBusy(false);
  }, []);

  const count = cart?.items_count ?? 0;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="relative inline-flex h-10 w-10 items-center justify-center rounded-lg transition-colors hover:bg-surface-raised"
        aria-label={`Carrito, ${count} ${count === 1 ? "producto" : "productos"}`}
      >
        <FaCartShopping className="h-5 w-5" aria-hidden />
        {count > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-[11px] font-semibold text-white">
            {count}
          </span>
        )}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setOpen(false)}
            aria-hidden
          />

          <aside
            role="dialog"
            aria-modal="true"
            aria-label="Carrito de compras"
            className="relative flex h-full w-full max-w-md flex-col bg-surface shadow-2xl"
          >
            <header className="flex items-center justify-between border-b border-line px-5 py-4">
              <h2 className="text-body-lg font-semibold">Tu carrito</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg hover:bg-surface-raised"
                aria-label="Cerrar carrito"
              >
                <FaXmark className="h-5 w-5" aria-hidden />
              </button>
            </header>

            <div className="flex-1 overflow-y-auto px-5 py-4">
              {!cart ? (
                <p className="text-content-subtle">Cargando…</p>
              ) : cart.items.length === 0 ? (
                <p className="py-12 text-center text-content-subtle">Tu carrito está vacío.</p>
              ) : (
                <ul className="flex flex-col gap-4">
                  {cart.items.map((item) => (
                    <li key={item.key} className="flex gap-3">
                      {item.image && (
                        <img
                          src={item.image}
                          alt=""
                          width="64"
                          height="64"
                          className="h-16 w-16 shrink-0 rounded-lg object-cover"
                        />
                      )}

                      <div className="flex-1">
                        <p className="text-sm font-medium leading-snug">{item.name}</p>

                        <div className="mt-2 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => changeQuantity(item.key, item.quantity - 1)}
                            disabled={busy}
                            className="h-7 w-7 rounded border border-line disabled:opacity-40"
                            aria-label="Quitar una unidad"
                          >−</button>
                          <span className="w-8 text-center text-sm">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => changeQuantity(item.key, item.quantity + 1)}
                            disabled={busy}
                            className="h-7 w-7 rounded border border-line disabled:opacity-40"
                            aria-label="Agregar una unidad"
                          >+</button>

                          <button
                            type="button"
                            onClick={() => changeQuantity(item.key, 0)}
                            disabled={busy}
                            className="ml-auto text-content-subtle transition-colors hover:text-red-400 disabled:opacity-40"
                            aria-label={`Eliminar ${item.name}`}
                          >
                            <FaTrash className="h-3.5 w-3.5" aria-hidden />
                          </button>
                        </div>
                      </div>

                      <p className="text-sm font-semibold">
                        {/* La Store API devuelve totales en la unidad menor (céntimos). */}
                        {item.totals
                          ? formatPrice(Number(item.totals.line_total) / 10 ** item.totals.currency_minor_unit)
                          : ""}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {cart && cart.items.length > 0 && (
              <footer className="border-t border-line px-5 py-4">
                <div className="mb-4 flex items-baseline justify-between">
                  <span className="text-content-muted">Total</span>
                  <span className="text-heading-sm font-semibold">
                    {cart.totals
                      ? formatPrice(Number(cart.totals.total_price) / 10 ** cart.totals.currency_minor_unit)
                      : ""}
                  </span>
                </div>

                <a href={checkoutUrl()} className="btn-primary w-full justify-center">
                  Finalizar compra
                </a>
                <p className="mt-2 text-center text-xs text-content-subtle">
                  El pago se completa de forma segura en nuestra tienda.
                </p>
              </footer>
            )}
          </aside>
        </div>
      )}
    </>
  );
}
