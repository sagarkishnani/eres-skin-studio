import { useTina, tinaField } from "tinacms/dist/react";

interface Props {
  query: string;
  variables: object;
  data: any;
}

const REVEAL_STEP_MS = 110;

export default function ExperienceReact({ query, variables, data: initialData }: Props) {
  const { data } = useTina({ query, variables, data: initialData });
  const experience = data?.services?.experience;
  if (!experience) return <div hidden />;
  const steps = (experience.steps || []).filter(Boolean);

  return (
    <section className="bg-surface-raised py-[clamp(64px,9vw,128px)]">
      <div className="container-xl">
        <div
          data-reveal="0"
          className="mx-auto mb-[clamp(40px,6vw,80px)] flex max-w-container-text flex-col items-center gap-[18px] text-center"
        >
          {experience.eyebrow && (
            <span className="eyebrow" data-tina-field={tinaField(experience, "eyebrow")}>
              {experience.eyebrow}
            </span>
          )}
          <h2 className="text-heading-md [text-wrap:balance]" data-tina-field={tinaField(experience, "title")}>
            {experience.title}
          </h2>
          {experience.text && (
            <p
              className="max-w-[560px] text-body-md text-content-muted [text-wrap:pretty]"
              data-tina-field={tinaField(experience, "text")}
            >
              {experience.text}
            </p>
          )}
        </div>
        <ol className="grid grid-cols-1 gap-7 md:grid-cols-2 md:gap-x-8 md:gap-y-10 lg:grid-cols-4">
          {steps.map((step: any, index: number) => (
            <li
              key={index}
              data-reveal={index * REVEAL_STEP_MS}
              className="flex flex-col gap-3 border-t border-stone-800 pt-5 max-md:![transition-delay:0ms]"
              data-tina-field={tinaField(step)}
            >
              <span className="text-caption-sm tabular-nums tracking-[.14em] text-content-subtle">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-2 text-subtitle-lg font-normal">{step.title}</h3>
              <p className="text-body-sm text-content-muted [text-wrap:pretty]">{step.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
