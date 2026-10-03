import { PiArrowRightLight } from "react-icons/pi";
import { useTina, tinaField } from "tinacms/dist/react";
import { mediaUrl } from "../../utils/mediaUrl";

interface Props {
  query: string;
  variables: object;
  data: any;
}

const REVEAL_STEP_MS = 110;

export default function ServicesReact({ query, variables, data: initialData }: Props) {
  const { data } = useTina({ query, variables, data: initialData });
  const services = data?.home?.services;
  if (!services) return <div hidden />;
  const items = (services.items || []).filter(Boolean);

  return (
    <section className="bg-sage-100 py-section">
      <div className="container-xl">
        <div
          data-reveal="0"
          className="mb-[clamp(32px,4vw,56px)] grid grid-cols-[repeat(auto-fit,minmax(min(100%,420px),1fr))] items-end gap-x-16 gap-y-5"
        >
          <div className="flex flex-col gap-4">
            {services.eyebrow && (
              <span className="eyebrow text-accent" data-tina-field={tinaField(services, "eyebrow")}>
                {services.eyebrow}
              </span>
            )}
            <h2 className="whitespace-pre-line text-heading-md" data-tina-field={tinaField(services, "title")}>
              {services.title}
            </h2>
          </div>
          {services.description && (
            <p
              className="max-w-[520px] justify-self-end text-body-md leading-[1.6] text-accent"
              data-tina-field={tinaField(services, "description")}
            >
              {services.description}
            </p>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-container">
        <div className="grid snap-x snap-mandatory auto-cols-[84%] grid-flow-col gap-3 overflow-x-auto scroll-px-gutter px-gutter [scrollbar-width:none] md:auto-cols-auto md:grid-flow-row md:grid-cols-3 md:gap-6 md:overflow-visible [&::-webkit-scrollbar]:hidden">
          {items.map((item: any, index: number) => (
            <div
              key={index}
              data-reveal={index * REVEAL_STEP_MS}
              className="snap-start max-md:!transform-none max-md:!opacity-100"
            >
              <a
                href={item.url || undefined}
                className="group flex h-full flex-col gap-5 bg-surface-raised p-5 md:p-7"
                data-tina-field={tinaField(item)}
              >
                <div className="relative aspect-[16/10] overflow-hidden">
                  {item.image && (
                    <img
                      src={mediaUrl(item.image)}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1200ms] ease-out-expo lg:group-hover:scale-105"
                    />
                  )}
                </div>
                <h3 className="mt-2 text-heading-xs">{item.title}</h3>
                <p className="flex-1 text-body-sm text-content-muted">{item.text}</p>
                <div className="flex items-center justify-between border-t border-line-strong pt-[18px] text-caption-sm font-medium uppercase tracking-[.16em]">
                  <span className="bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_1px] bg-right-bottom bg-no-repeat pb-0.5 transition-[background-size] duration-500 ease-out-expo max-lg:bg-[length:100%_1px] lg:group-hover:bg-[length:100%_1px] lg:group-hover:bg-left-bottom">
                    {services.ctaLabel}
                  </span>
                  <span aria-hidden="true" className="transition-transform duration-500 ease-out-expo lg:group-hover:translate-x-1.5">
                    <PiArrowRightLight size="1em" />
                  </span>
                </div>
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
