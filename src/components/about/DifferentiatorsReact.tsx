import { useTina, tinaField } from "tinacms/dist/react";

interface Props {
  query: string;
  variables: object;
  data: any;
}

const REVEAL_STEP_MS = 110;
const HIGHLIGHTED_INDEX = 1;

function DifferentiatorIcon({ name }: { name?: string | null }) {
  const common = {
    width: 20,
    height: 20,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.5,
    "aria-hidden": true,
  } as const;

  if (name === "check") {
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="9" />
        <path d="M8 12.5l2.8 2.8L16.5 9" />
      </svg>
    );
  }
  if (name === "drop") {
    return (
      <svg {...common} strokeLinejoin="round">
        <path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </svg>
  );
}

export default function DifferentiatorsReact({ query, variables, data: initialData }: Props) {
  const { data } = useTina({ query, variables, data: initialData });
  const differentiators = data?.about?.differentiators;
  if (!differentiators) return <div hidden />;
  const items = (differentiators.items || []).filter(Boolean);

  return (
    <section className="bg-surface-raised pb-[clamp(64px,9vw,128px)]">
      <div className="container-xl">
        <div
          data-reveal="0"
          className="mb-[clamp(32px,4vw,56px)] grid grid-cols-[repeat(auto-fit,minmax(min(100%,420px),1fr))] items-end gap-x-20 gap-y-5"
        >
          <div className="flex flex-col gap-4">
            {differentiators.eyebrow && (
              <span className="eyebrow text-sage-700" data-tina-field={tinaField(differentiators, "eyebrow")}>
                {differentiators.eyebrow}
              </span>
            )}
            <h2
              className="whitespace-pre-line text-heading-md [text-wrap:balance]"
              data-tina-field={tinaField(differentiators, "title")}
            >
              {differentiators.title}
            </h2>
          </div>
          {differentiators.text && (
            <p
              className="max-w-[460px] justify-self-end text-body-md text-content-muted [text-wrap:pretty]"
              data-tina-field={tinaField(differentiators, "text")}
            >
              {differentiators.text}
            </p>
          )}
        </div>
      </div>
      <div className="mx-auto max-w-container">
        <div className="grid snap-x snap-mandatory auto-cols-[84%] grid-flow-col gap-3 overflow-x-auto scroll-px-gutter px-gutter pt-2 [scrollbar-width:none] md:auto-cols-[46%] md:gap-6 lg:auto-cols-auto lg:grid-flow-row lg:grid-cols-3 lg:overflow-visible [&::-webkit-scrollbar]:hidden">
          {items.map((item: any, index: number) => {
            const highlighted = index === HIGHLIGHTED_INDEX;
            return (
              <div
                key={index}
                data-reveal={index * REVEAL_STEP_MS}
                className="snap-start max-lg:![transition-delay:0ms]"
              >
                <div
                  className={`flex h-full min-h-[340px] flex-col gap-3.5 p-[clamp(24px,3vw,40px)] transition-[transform,box-shadow] duration-[600ms] ease-out-expo md:min-h-[400px] lg:hover:-translate-y-1.5 lg:hover:shadow-[0_24px_40px_-28px_theme(colors.ink/45%)] ${
                    highlighted ? "bg-sage-700 text-content-inverse" : "bg-blush text-content"
                  }`}
                  data-tina-field={tinaField(item)}
                >
                  <span
                    className={`mb-auto grid h-12 w-12 place-items-center rounded-full ${
                      highlighted ? "bg-ink text-content-inverse" : "bg-surface-raised text-content"
                    }`}
                  >
                    <DifferentiatorIcon name={item.icon} />
                  </span>
                  <span className="mt-8 text-caption-sm tabular-nums tracking-[.14em]">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h3 className="text-heading-xs [text-wrap:balance]">{item.title}</h3>
                  <p className={`text-body-sm [text-wrap:pretty] ${highlighted ? "" : "text-content-muted"}`}>
                    {item.text}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
