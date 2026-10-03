import { PiArrowRightLight } from "react-icons/pi";
import { useTina, tinaField } from "tinacms/dist/react";

interface Props {
  query: string;
  variables: object;
  data: any;
}

export default function EssenceReact({ query, variables, data: initialData }: Props) {
  const { data } = useTina({ query, variables, data: initialData });
  const essence = data?.home?.essence;
  if (!essence) return <div hidden />;
  const paragraphs = (essence.paragraphs || []).filter(Boolean);

  return (
    <section className="bg-surface-raised py-[clamp(64px,9vw,128px)]">
      <div className="container-xl grid grid-cols-[repeat(auto-fit,minmax(min(100%,380px),1fr))] gap-x-20 gap-y-8">
        <div data-reveal="0" className="flex flex-col gap-4">
          {essence.eyebrow && (
            <span className="eyebrow" data-tina-field={tinaField(essence, "eyebrow")}>
              {essence.eyebrow}
            </span>
          )}
          <h2 className="whitespace-pre-line text-heading-lg" data-tina-field={tinaField(essence, "title")}>
            {essence.title}
          </h2>
        </div>
        <div data-reveal="120" className="flex flex-col gap-[18px] md:pt-11">
          {paragraphs.map((paragraph: any, index: number) => (
            <p key={index} className="text-body-md text-content-muted" data-tina-field={tinaField(paragraph, "text")}>
              {paragraph.text}
            </p>
          ))}
          {essence.cta?.label && essence.cta?.url && (
            <a href={essence.cta.url} className="link-underline mt-3.5" data-tina-field={tinaField(essence, "cta")}>
              {essence.cta.label} <PiArrowRightLight size="1em" aria-hidden />
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
