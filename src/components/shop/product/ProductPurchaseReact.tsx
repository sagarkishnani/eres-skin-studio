import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { PiCheckLight, PiHandbagLight } from "react-icons/pi";
import { addToCart, checkoutUrl, fetchStock, requestCartOpen } from "../../../utils/wooClient";
import { discountPercent, formatPrice } from "../../../lib/woo/format";
import type { StockStatus, WooProduct, WooStock } from "../../../lib/woo/types";
import QuantityStepper from "./QuantityStepper";

interface ProductPurchaseProps {
  id: number;
  name: string;
  type: WooProduct["type"];
  permalink: string;
  thumb: string | null;
  price: string;
  regularPrice: string;
  salePrice: string;
  onSale: boolean;
  purchasable: boolean;
  stockStatus: StockStatus;
  stockQuantity: number | null;
  lowStockThreshold: number;
  shippingNote: string;
  description?: ReactNode;
}

type Status = "idle" | "loading" | "done" | "error";

const STOCK_BAR_SCALE = 30;
const MAX_QUANTITY_WITHOUT_STOCK = 99;
const FEEDBACK_MS = 1500;
const HEADER_CLEARANCE_PX = 72;
const CHECKOUT_AVAILABLE = Boolean(import.meta.env.PUBLIC_WOO_CHECKOUT_URL);

const addButtonClass =
  "btn-secondary h-[54px] w-full gap-2.5 whitespace-nowrap px-4 duration-[550ms] disabled:pointer-events-none disabled:opacity-40 max-[400px]:px-3 max-[400px]:tracking-[.08em] max-[400px]:[&>svg]:hidden";
const buyButtonClass =
  "btn-primary col-span-full h-[54px] w-full duration-[550ms] [transition-property:background-size,color,letter-spacing] hover:tracking-[.18em] disabled:pointer-events-none disabled:opacity-40";

type Availability = { kind: "out" } | { kind: "backorder" } | { kind: "low"; units: number } | { kind: "in" };

function availabilityOf(stock: WooStock, lowStockThreshold: number): Availability {
  if (stock.stock_status === "outofstock" || !stock.purchasable) return { kind: "out" };
  if (stock.stock_status === "onbackorder") return { kind: "backorder" };
  if (typeof stock.stock_quantity === "number" && stock.stock_quantity <= lowStockThreshold) {
    return { kind: "low", units: stock.stock_quantity };
  }
  return { kind: "in" };
}

function maxQuantity(stock: WooStock): number {
  return typeof stock.stock_quantity === "number" ? Math.max(1, stock.stock_quantity) : MAX_QUANTITY_WITHOUT_STOCK;
}

function StockNotice({ availability }: { availability: Availability }) {
  if (availability.kind === "out") return <p className="text-body-xs text-content-subtle">Agotado</p>;
  if (availability.kind === "backorder") return <p className="text-body-xs text-content">Bajo pedido</p>;
  if (availability.kind === "in") return <p className="text-body-xs text-content">En stock</p>;
  const fill = Math.min(100, (availability.units / STOCK_BAR_SCALE) * 100);
  return (
    <div className="flex flex-col gap-2.5">
      <p className="text-body-xs text-content">
        {availability.units === 1 ? "Solo queda " : "Solo quedan "}
        <strong className="font-semibold">{availability.units}</strong>
        {availability.units === 1 ? " unidad en stock." : " unidades en stock."}
      </p>
      <div className="h-0.5 max-w-[360px] bg-stone-150" aria-hidden="true">
        <div className="h-full bg-sage-500" style={{ width: `${fill}%` }} />
      </div>
    </div>
  );
}

function useBuyBlockPassed(enabled: boolean) {
  const buyBlockRef = useRef<HTMLDivElement>(null);
  const [passed, setPassed] = useState(false);

  useEffect(() => {
    const block = buyBlockRef.current;
    if (!enabled || !block) {
      setPassed(false);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => setPassed(!entry.isIntersecting && entry.boundingClientRect.bottom < HEADER_CLEARANCE_PX),
      { rootMargin: `-${HEADER_CLEARANCE_PX}px 0px 0px 0px` },
    );
    observer.observe(block);
    return () => observer.disconnect();
  }, [enabled]);

  useEffect(() => {
    const root = document.documentElement;
    if (passed) root.dataset.buyBar = "visible";
    else delete root.dataset.buyBar;
    return () => {
      delete root.dataset.buyBar;
    };
  }, [passed]);

  return { buyBlockRef, passed };
}

interface StickyBuyBarProps {
  visible: boolean;
  name: string;
  thumb: string | null;
  stock: WooStock;
  quantity: number;
  max: number;
  onQuantityChange: (value: number) => void;
  onAdd: () => void;
  addLabel: string;
  addDone: boolean;
  busy: boolean;
}

function StickyBuyBar({ visible, name, thumb, stock, quantity, max, onQuantityChange, onAdd, addLabel, addDone, busy }: StickyBuyBarProps) {
  const discount = discountPercent(stock);
  return (
    <div
      inert={!visible}
      aria-hidden={!visible}
      className={`fixed inset-x-0 bottom-0 z-[44] border-t border-stone-150 bg-surface-raised pb-[env(safe-area-inset-bottom)] shadow-up transition-transform duration-[650ms] ease-out-expo motion-reduce:transition-none [html[data-scroll-locked]_&]:translate-y-[110%] ${
        visible ? "translate-y-0" : "translate-y-[110%]"
      }`}
    >
      <div className="mx-auto flex max-w-container items-center gap-3 px-4 md:gap-4 py-2.5 md:px-gutter md:py-3">
        {thumb && <img src={thumb} alt="" loading="lazy" className="hidden h-14 w-14 shrink-0 bg-stone-100 object-cover lg:block" />}
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="truncate text-caption-md text-content md:text-body-sm">{name}</span>
          <span className="flex min-w-0 items-baseline gap-2 overflow-hidden whitespace-nowrap">
            <span className="text-body-md font-semibold">{formatPrice(stock.price)}</span>
            {discount !== null && (
              <span className="text-caption-md text-content-subtle line-through">{formatPrice(stock.regular_price)}</span>
            )}
          </span>
        </div>
        <QuantityStepper value={quantity} max={max} onChange={onQuantityChange} className="hidden h-12 lg:flex" />
        <button
          type="button"
          onClick={onAdd}
          disabled={busy}
          className="btn-primary h-12 shrink-0 gap-2.5 whitespace-nowrap px-4 text-caption-sm tracking-[.1em] duration-[550ms] disabled:pointer-events-none disabled:opacity-40 max-md:[&>svg]:hidden md:px-8 md:tracking-[.14em]"
        >
          {addDone ? <PiCheckLight size={18} aria-hidden /> : <PiHandbagLight size={18} aria-hidden />}
          {addLabel}
        </button>
      </div>
    </div>
  );
}

function PriceRow({ stock }: { stock: WooStock }) {
  const discount = discountPercent(stock);
  const saving = discount !== null ? parseFloat(stock.regular_price) - parseFloat(stock.price) : 0;
  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="text-[24px] font-semibold tracking-[-.01em]">{formatPrice(stock.price)}</span>
      {discount !== null && (
        <>
          <span className="text-body-lg leading-normal text-content-subtle line-through">
            <span className="sr-only">Antes </span>
            {formatPrice(stock.regular_price)}
          </span>
          <span className="bg-sage-100 px-2 py-[5px] text-caption-sm font-semibold leading-none text-accent">
            Ahorras {formatPrice(saving)}
          </span>
        </>
      )}
    </div>
  );
}

export default function ProductPurchaseReact(props: ProductPurchaseProps) {
  const [stock, setStock] = useState<WooStock>({
    id: props.id,
    price: props.price,
    regular_price: props.regularPrice,
    sale_price: props.salePrice,
    on_sale: props.onSale,
    purchasable: props.purchasable,
    stock_status: props.stockStatus,
    stock_quantity: props.stockQuantity,
  });
  const [quantity, setQuantity] = useState(1);
  const [addStatus, setAddStatus] = useState<Status>("idle");
  const [buyStatus, setBuyStatus] = useState<Status>("idle");

  useEffect(() => {
    fetchStock([props.id]).then((fresh) => {
      const latest = fresh.get(props.id);
      if (latest) setStock(latest);
    });
  }, [props.id]);

  useEffect(() => {
    if (addStatus !== "done") return;
    const timer = setTimeout(() => setAddStatus("idle"), FEEDBACK_MS);
    return () => clearTimeout(timer);
  }, [addStatus]);

  const availability = availabilityOf(stock, props.lowStockThreshold);
  const soldOut = availability.kind === "out";
  const max = maxQuantity(stock);
  const isSimple = props.type === "simple";
  const busy = addStatus === "loading" || buyStatus === "loading";
  const failed = addStatus === "error" || buyStatus === "error";

  const [mounted, setMounted] = useState(false);
  const showStickyBar = isSimple && !soldOut;
  const { buyBlockRef, passed } = useBuyBlockPassed(showStickyBar);

  useEffect(() => setMounted(true), []);

  const changeQuantity = (next: number) => setQuantity(Math.min(max, Math.max(1, next)));

  useEffect(() => {
    setQuantity((value) => Math.min(value, max));
  }, [max]);

  async function handleAdd() {
    if (busy) return;
    setAddStatus("loading");
    setBuyStatus("idle");
    const cart = await addToCart(props.id, quantity);
    if (!cart) {
      setAddStatus("error");
      return;
    }
    setAddStatus("done");
    requestCartOpen();
  }

  async function handleBuyNow() {
    if (busy) return;
    setBuyStatus("loading");
    setAddStatus("idle");
    const cart = await addToCart(props.id, quantity);
    const destination = cart ? checkoutUrl() : null;
    if (!destination) {
      setBuyStatus("error");
      return;
    }
    window.location.assign(destination);
  }

  const addLabel = { idle: "Añadir al carrito", loading: "Añadiendo…", done: "Añadido", error: "Añadir al carrito" }[addStatus];

  return (
    <div className="flex flex-col">
      <PriceRow stock={stock} />
      {props.shippingNote && <p className="mt-2.5 text-body-xs text-content-muted">{props.shippingNote}</p>}
      {props.description}

      <div className="mt-6">
        <StockNotice availability={availability} />
      </div>

      {isSimple ? (
        <div ref={buyBlockRef} className="mt-6 grid grid-cols-[auto_minmax(0,1fr)] gap-2.5">
          <QuantityStepper value={quantity} max={max} disabled={soldOut} onChange={changeQuantity} />
          <button type="button" onClick={handleAdd} disabled={soldOut || busy} className={addButtonClass}>
            {addStatus === "done" ? <PiCheckLight size={18} aria-hidden /> : <PiHandbagLight size={18} aria-hidden />}
            <span aria-live="polite">{addLabel}</span>
          </button>
          {CHECKOUT_AVAILABLE && (
            <button type="button" onClick={handleBuyNow} disabled={soldOut || busy} className={buyButtonClass}>
              {buyStatus === "loading" ? "Procesando…" : "Comprar ahora"}
            </button>
          )}
        </div>
      ) : (
        <a href={props.permalink} className={`${addButtonClass} mt-6`}>
          Ver opciones
        </a>
      )}

      {mounted &&
        showStickyBar &&
        createPortal(
          <StickyBuyBar
            visible={passed}
            name={props.name}
            thumb={props.thumb}
            stock={stock}
            quantity={quantity}
            max={max}
            onQuantityChange={changeQuantity}
            onAdd={handleAdd}
            addLabel={addLabel}
            addDone={addStatus === "done"}
            busy={busy}
          />,
          document.body,
        )}

      {failed && (
        <p role="alert" className="mt-3 text-body-xs text-semantics-error-dark">
          No se pudo añadir el producto. Intenta de nuevo en un momento.
        </p>
      )}
    </div>
  );
}
