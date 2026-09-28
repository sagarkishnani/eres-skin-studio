import { useEffect, useState } from "react";
import { PiCheckLight, PiHandbagLight } from "react-icons/pi";
import { addToCart } from "../../utils/wooClient";

interface Props {
  productId: number;
  productName: string;
}

type Status = "idle" | "loading" | "done" | "error";

const FEEDBACK_MS = 1500;

export default function QuickAddReact({ productId, productName }: Props) {
  const [status, setStatus] = useState<Status>("idle");

  useEffect(() => {
    if (status !== "done" && status !== "error") return;
    const timer = setTimeout(() => setStatus("idle"), FEEDBACK_MS);
    return () => clearTimeout(timer);
  }, [status]);

  async function handleAdd() {
    if (status === "loading") return;
    setStatus("loading");
    const cart = await addToCart(productId, 1);
    setStatus(cart ? "done" : "error");
  }

  const busy = status === "loading";
  const barLabel = { idle: "Agregar al carrito", loading: "Agregando…", done: "Agregado", error: "No se pudo agregar" }[status];

  return (
    <>
      <button
        type="button"
        onClick={handleAdd}
        disabled={busy}
        data-woo-buy
        aria-label={`Agregar ${productName} al carrito`}
        className="absolute inset-x-0 bottom-0 z-10 hidden h-[50px] translate-y-[101%] items-center justify-center gap-2.5 bg-ink/[.92] text-caption-sm font-medium uppercase tracking-[.14em] text-content-inverse transition-[transform,background-color] duration-[600ms,350ms] ease-out-expo hover:bg-accent focus-visible:translate-y-0 group-hover:translate-y-0 group-focus-within:translate-y-0 lg:flex"
      >
        <span aria-live="polite">{barLabel}</span>
        {status === "done" ? (
          <PiCheckLight size={16} aria-hidden />
        ) : (
          <span aria-hidden="true" className="text-base font-light">+</span>
        )}
      </button>

      <button
        type="button"
        onClick={handleAdd}
        disabled={busy}
        data-woo-buy
        aria-label={`Agregar ${productName} al carrito`}
        className="absolute bottom-2 right-2 z-10 grid h-10 w-10 place-items-center bg-surface-raised text-ink shadow-sm transition-transform duration-200 active:scale-90 lg:hidden"
      >
        {status === "done" ? <PiCheckLight size={18} aria-hidden /> : <PiHandbagLight size={18} aria-hidden />}
      </button>
    </>
  );
}
