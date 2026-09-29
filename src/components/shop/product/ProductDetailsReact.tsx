import { useId, useState } from "react";
import type { DetailKey, ProductDetail } from "../../../lib/woo/productPage";

interface Props {
  details: ProductDetail[];
}

function ToggleIcon({ open }: { open: boolean }) {
  return (
    <span aria-hidden="true" className="relative block h-3.5 w-3.5 shrink-0">
      <span className="absolute inset-x-0 top-1/2 h-[1.5px] -translate-y-1/2 bg-ink" />
      <span
        className={`absolute inset-y-0 left-1/2 w-[1.5px] -translate-x-1/2 bg-ink transition-transform duration-[450ms] ease-out-expo motion-reduce:transition-none ${
          open ? "scale-y-0" : "scale-y-100"
        }`}
      />
    </span>
  );
}

export default function ProductDetailsReact({ details }: Props) {
  const [openKey, setOpenKey] = useState<DetailKey | null>(details[0]?.key ?? null);
  const idPrefix = useId();

  if (!details.length) return null;

  return (
    <div className="mt-8 border-t border-line">
      {details.map((detail) => {
        const open = openKey === detail.key;
        const panelId = `${idPrefix}-${detail.key}`;
        return (
          <div key={detail.key} className="border-b border-line">
            <h2>
              <button
                type="button"
                onClick={() => setOpenKey(open ? null : detail.key)}
                aria-expanded={open}
                aria-controls={panelId}
                className="flex w-full items-center justify-between gap-4 py-[22px] text-left text-[18px] tracking-[-.01em] text-content"
              >
                {detail.title}
                <ToggleIcon open={open} />
              </button>
            </h2>
            <div
              id={panelId}
              role="region"
              aria-label={detail.title}
              inert={!open}
              className={`grid transition-[grid-template-rows] duration-[550ms] ease-out-expo motion-reduce:transition-none ${
                open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
              }`}
            >
              <div className="overflow-hidden">
                {detail.isHtml ? (
                  <div
                    className="prose max-w-none pb-6 text-body-sm leading-[1.7] [text-wrap:pretty]"
                    dangerouslySetInnerHTML={{ __html: detail.body }}
                  />
                ) : (
                  <p className="whitespace-pre-line pb-6 text-body-sm leading-[1.7] text-content-muted [text-wrap:pretty]">
                    {detail.body}
                  </p>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
