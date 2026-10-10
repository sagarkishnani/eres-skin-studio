import { PiArrowRightLight } from "react-icons/pi";
import { useTina, tinaField } from "tinacms/dist/react";

interface Props {
  query: string;
  variables: object;
  data: any;
  whatsappUrl: string;
}

function ToggleIcon() {
  return (
    <span aria-hidden="true" className="relative block h-3.5 w-3.5 shrink-0">
      <span className="absolute inset-x-0 top-1/2 h-[1.5px] -translate-y-1/2 bg-ink" />
      <span className="absolute inset-y-0 left-1/2 w-[1.5px] -translate-x-1/2 bg-ink transition-transform duration-[450ms] ease-out-expo group-open:scale-y-0" />
    </span>
  );
}

export default function FaqReact({ query, variables, data: initialData, whatsappUrl }: Props) {
  const { data } = useTina({ query, variables, data: initialData });
  const faq = data?.services?.faq;
  if (!faq) return <div hidden />;
  const items = (faq.items || []).filter(Boolean);

  return (
    <section id="preguntas-frecuentes" className="bg-surface py-[clamp(64px,8vw,120px)]">
      <div className="container-xl grid grid-cols-1 items-start gap-x-20 gap-y-9 lg:grid-cols-[minmax(0,.8fr)_minmax(0,1.4fr)]">
        <div data-reveal="0" className="flex flex-col gap-[18px] lg:sticky lg:top-[160px]">
          {faq.eyebrow && (
            <span className="eyebrow" data-tina-field={tinaField(faq, "eyebrow")}>
              {faq.eyebrow}
            </span>
          )}
          <h2 className="text-heading-md [text-wrap:balance]" data-tina-field={tinaField(faq, "title")}>
            {faq.title}
          </h2>
          {faq.helpText && (
            <span className="mt-1.5 text-body-sm text-content-muted" data-tina-field={tinaField(faq, "helpText")}>
              {faq.helpText}
            </span>
          )}
          {whatsappUrl && faq.ctaLabel && (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="link-underline"
              data-tina-field={tinaField(faq, "ctaLabel")}
            >
              {faq.ctaLabel} <PiArrowRightLight size="1em" aria-hidden />
            </a>
          )}
        </div>
        <div data-reveal="100" className="border-t border-line">
          {items.map((item: any, index: number) => (
            <details
              key={index}
              name="faq"
              open={index === 0}
              className="faq-item group border-b border-line"
              data-tina-field={tinaField(item)}
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 text-body-md tracking-[-.01em] text-content md:py-6 md:text-body-lg [&::-webkit-details-marker]:hidden">
                {item.question}
                <ToggleIcon />
              </summary>
              <p className="pb-6 pr-10 text-body-sm leading-[1.7] text-content-muted [text-wrap:pretty]">{item.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
