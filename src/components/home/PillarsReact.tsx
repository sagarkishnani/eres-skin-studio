import { useTina, tinaField } from "tinacms/dist/react";

interface Props {
  query: string;
  variables: object;
  data: any;
}

const REVEAL_STEP_MS = 110;

export default function PillarsReact({ query, variables, data: initialData }: Props) {
  const { data } = useTina({ query, variables, data: initialData });
  const pillars = data?.home?.pillars;
  if (!pillars) return <div hidden />;
  const items = (pillars.items || []).filter(Boolean);

  return (
    <section className="border-t border-stone-150 bg-surface-raised py-[clamp(64px,9vw,120px)]">
      <div className="container-xl">
        <h2
          data-reveal="0"
          className="mb-[clamp(36px,5vw,64px)] text-heading-md"
          data-tina-field={tinaField(pillars, "title")}
        >
          {pillars.title}
        </h2>
        <div className="grid grid-cols-1 gap-7 md:grid-cols-2 md:gap-x-8 md:gap-y-10 lg:grid-cols-4">
          {items.map((item: any, index: number) => (
            <div
              key={index}
              data-reveal={index * REVEAL_STEP_MS}
              className="flex flex-col gap-3 border-t border-stone-800 pt-5 max-md:![transition-delay:0ms]"
              data-tina-field={tinaField(item)}
            >
              <span className="text-caption-sm tabular-nums tracking-[.14em] text-content-subtle">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-2 text-heading-xs">{item.title}</h3>
              <p className="text-body-sm text-content-muted">{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
