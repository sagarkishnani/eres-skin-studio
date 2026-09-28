import { useRef } from "react";
import { PiHandbagLight, PiMinusLight, PiPlusLight, PiTrashLight, PiXLight } from "react-icons/pi";
import { checkoutUrl } from "../../utils/wooClient";
import type { WooCart, WooCartItem } from "../../lib/woo/types";
import { formatPrice } from "../../lib/woo/format";
import { useFocusTrap } from "../../hooks/useFocusTrap";

interface CartButtonProps {
  count: number;
  bumping: boolean;
  expanded: boolean;
  onOpen: () => void;
}

export function CartButton({ count, bumping, expanded, onOpen }: CartButtonProps) {
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-expanded={expanded}
      aria-label={`Carrito, ${count} ${count === 1 ? "producto" : "productos"}`}
      className="relative grid h-11 w-11 place-items-center text-content transition-opacity duration-300 hover:opacity-60"
    >
      <PiHandbagLight size={20} aria-hidden />
      {count > 0 && (
        <span
          aria-hidden
          className={`absolute right-1 top-1.5 grid h-4 min-w-4 place-items-center bg-accent px-1 text-[10px] font-semibold leading-none text-content-inverse transition-transform duration-[350ms] ease-spring ${
            bumping ? "scale-[1.35]" : "scale-100"
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );
}

function fromMinorUnits(amount: string, minorUnit: number): string {
  return formatPrice(Number(amount) / 10 ** minorUnit);
}

interface CartLineProps {
  item: WooCartItem;
  busy: boolean;
  onChangeQuantity: (key: string, quantity: number) => void;
}

function CartLine({ item, busy, onChangeQuantity }: CartLineProps) {
  const stepButton = "grid h-[34px] w-9 place-items-center text-content disabled:opacity-40";
  return (
    <li className="grid grid-cols-[84px_minmax(0,1fr)] gap-4 border-b border-stone-150 py-5">
      {item.image ? (
        <img src={item.image} alt="" width="84" height="84" loading="lazy" className="h-[84px] w-[84px] bg-stone-100 object-cover" />
      ) : (
        <span aria-hidden className="h-[84px] w-[84px] bg-stone-100" />
      )}

      <div className="flex min-w-0 flex-col gap-1.5">
        <div className="flex items-start justify-between gap-3">
          <p className="text-[14.5px] font-medium leading-[1.3] text-content">{item.name}</p>
          <button
            type="button"
            onClick={() => onChangeQuantity(item.key, 0)}
            disabled={busy}
            aria-label={`Eliminar ${item.name}`}
            className="-mr-1 grid h-8 w-8 shrink-0 place-items-center text-content-subtle transition-colors hover:text-content disabled:opacity-40"
          >
            <PiTrashLight size={16} aria-hidden />
          </button>
        </div>

        <div className="mt-1.5 flex items-center justify-between">
          <div className="flex h-9 items-center border border-line-strong">
            <button
              type="button"
              onClick={() => onChangeQuantity(item.key, item.quantity - 1)}
              disabled={busy}
              aria-label="Quitar una unidad"
              className={stepButton}
            >
              <PiMinusLight size={14} aria-hidden />
            </button>
            <span className="min-w-6 text-center text-caption-md tabular-nums">{item.quantity}</span>
            <button
              type="button"
              onClick={() => onChangeQuantity(item.key, item.quantity + 1)}
              disabled={busy}
              aria-label="Agregar una unidad"
              className={stepButton}
            >
              <PiPlusLight size={14} aria-hidden />
            </button>
          </div>
          <span className="text-body-xs font-semibold text-content">
            {item.totals ? fromMinorUnits(item.totals.line_total, item.totals.currency_minor_unit) : ""}
          </span>
        </div>
      </div>
    </li>
  );
}

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
  cart: WooCart | null;
  count: number;
  busy: boolean;
  onChangeQuantity: (key: string, quantity: number) => void;
}

export function CartDrawer({ open, onClose, cart, count, busy, onChangeQuantity }: CartDrawerProps) {
  const drawerRef = useRef<HTMLElement>(null);
  useFocusTrap(drawerRef, open);

  const checkout = open ? checkoutUrl() : null;
  const hasItems = Boolean(cart && cart.items.length > 0);

  return (
    <aside
      ref={drawerRef}
      role="dialog"
      aria-modal="true"
      aria-label="Carrito de compras"
      inert={!open}
      className={`fixed inset-y-0 right-0 z-[70] flex w-[min(92vw,440px)] flex-col bg-surface-raised transition-transform duration-700 ease-out-expo ${
        open ? "translate-x-0" : "translate-x-[102%]"
      }`}
    >
      <div className="flex h-[72px] shrink-0 items-center justify-between border-b border-stone-150 pl-6 pr-3">
        <h2 className="text-[18px] tracking-[-.01em] text-content">
          Tu carrito <span className="text-content-subtle">({count})</span>
        </h2>
        <button type="button" onClick={onClose} aria-label="Cerrar carrito" className="grid h-11 w-11 place-items-center text-content">
          <PiXLight size={22} aria-hidden />
        </button>
      </div>

      <div data-lenis-prevent className="flex-1 overflow-y-auto px-6 py-2">
        {!cart ? (
          <p className="py-16 text-body-sm text-content-subtle">Cargando…</p>
        ) : !hasItems ? (
          <div className="flex flex-col items-start gap-5 py-16">
            <p className="text-[22px] tracking-[-.02em] text-content">Tu carrito está vacío.</p>
            <button type="button" onClick={onClose} className="btn-secondary">
              Seguir comprando
            </button>
          </div>
        ) : (
          <ul>
            {cart.items.map((item) => (
              <CartLine key={item.key} item={item} busy={busy} onChangeQuantity={onChangeQuantity} />
            ))}
          </ul>
        )}
      </div>

      {cart && hasItems && (
        <div className="flex flex-col gap-3.5 border-t border-stone-150 px-6 pb-6 pt-5">
          <div className="flex justify-between text-body-sm text-content">
            <span>Subtotal</span>
            <span className="font-semibold">
              {cart.totals ? fromMinorUnits(cart.totals.total_price, cart.totals.currency_minor_unit) : ""}
            </span>
          </div>
          <p className="text-caption-md text-content-subtle">Envío calculado al finalizar la compra.</p>
          {checkout && (
            <a href={checkout} className="btn-primary h-[54px] w-full">
              Finalizar compra <span aria-hidden>→</span>
            </a>
          )}
        </div>
      )}
    </aside>
  );
}
