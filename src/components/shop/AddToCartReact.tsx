import { useState } from "react";
import { FaCartShopping, FaCheck } from "react-icons/fa6";
import { addToCart } from "../../utils/wooClient";

interface Props {
  productId: number;
  disabled?: boolean;
  label?: string;
}

type State = "idle" | "loading" | "done" | "error";

export default function AddToCartReact({ productId, disabled = false, label = "Agregar al carrito" }: Props) {
  const [qty, setQty] = useState(1);
  const [state, setState] = useState<State>("idle");

  async function handleAdd() {
    setState("loading");
    const cart = await addToCart(productId, qty);
    if (!cart) {
      setState("error");
      return;
    }
    setState("done");
    setTimeout(() => setState("idle"), 2000);
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <label htmlFor="qty" className="sr-only">Cantidad</label>
        <input
          id="qty"
          type="number"
          min={1}
          max={99}
          value={qty}
          onChange={(e) => setQty(Math.min(99, Math.max(1, Number(e.target.value) || 1)))}
          className="w-20 rounded-lg border border-line bg-surface-raised px-3 py-2.5 text-center"
          disabled={disabled}
        />

        <button
          type="button"
          onClick={handleAdd}
          disabled={disabled || state === "loading"}
          data-woo-buy
          className="btn-primary flex-1 disabled:pointer-events-none disabled:opacity-40"
        >
          {state === "done" ? (
            <><FaCheck className="h-4 w-4" aria-hidden /> Agregado</>
          ) : (
            <><FaCartShopping className="h-4 w-4" aria-hidden /> {state === "loading" ? "Agregando…" : label}</>
          )}
        </button>
      </div>

      {state === "error" && (
        <p role="alert" className="text-sm text-red-400">
          No se pudo agregar el producto. Intenta de nuevo en un momento.
        </p>
      )}
    </div>
  );
}
