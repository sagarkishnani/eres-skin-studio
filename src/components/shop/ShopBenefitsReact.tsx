import { useTina, tinaField } from "tinacms/dist/react";
import { PiChatCircleLight, PiCheckLight, PiDropLight, PiTruckLight } from "react-icons/pi";
import type { IconType } from "react-icons";

interface Props {
  query: string;
  variables: object;
  data: any;
}

const ICONS: Record<string, IconType> = {
  check: PiCheckLight,
  drop: PiDropLight,
  truck: PiTruckLight,
  chat: PiChatCircleLight,
};

const REVEAL_STEP_MS = 90;

export default function ShopBenefitsReact({ query, variables, data: initialData }: Props) {
  const { data } = useTina({ query, variables, data: initialData });
  const benefits = (data?.shop?.benefits || []).filter((benefit: any) => benefit?.title);
  if (benefits.length === 0) return <div hidden />;

  return (
    <section className="bg-sage-100 py-[clamp(40px,5vw,64px)]">
      <div className="container-xl grid grid-cols-2 gap-x-4 gap-y-8 md:gap-8 lg:grid-cols-4">
        {benefits.map((benefit: any, index: number) => {
          const Icon = ICONS[benefit.icon] || PiCheckLight;
          return (
            <div
              key={index}
              data-reveal={index * REVEAL_STEP_MS}
              className="flex min-w-0 flex-col items-start gap-3.5 border-sage-300 md:flex-row md:max-lg:even:border-l md:max-lg:even:pl-8 lg:[&:not(:first-child)]:border-l lg:[&:not(:first-child)]:pl-8"
            >
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-surface-raised text-accent">
                <Icon size={20} aria-hidden />
              </span>
              <div className="flex min-w-0 flex-col gap-1 [overflow-wrap:anywhere]">
                <span className="text-[18px] tracking-[-.01em] text-content" data-tina-field={tinaField(benefit, "title")}>
                  {benefit.title}
                </span>
                {benefit.text && (
                  <span className="text-body-xs text-accent" data-tina-field={tinaField(benefit, "text")}>
                    {benefit.text}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
