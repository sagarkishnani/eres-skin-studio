import { useTina, tinaField } from "tinacms/dist/react";
import { formatCount } from "../../utils/countUp";

interface Props {
  query: string;
  variables: object;
  data: any;
}

export default function ResultsReact({ query, variables, data: initialData }: Props) {
  const { data } = useTina({ query, variables, data: initialData });
  const results = data?.home?.results;
  if (!results) return <div hidden />;
  const paragraphs = (results.paragraphs || []).filter(Boolean);
  const stats = (results.stats || []).filter(Boolean);

  return (
    <div data-reveal="0" className="flex flex-col gap-[18px]">
      {results.eyebrow && (
        <span className="eyebrow text-clay-800" data-tina-field={tinaField(results, "eyebrow")}>
          {results.eyebrow}
        </span>
      )}
      <h2 className="mb-2 text-heading-lg" data-tina-field={tinaField(results, "title")}>
        {results.title}
      </h2>
      {paragraphs.map((paragraph: any, index: number) => (
        <p key={index} className="text-body-md text-content-muted" data-tina-field={tinaField(paragraph, "text")}>
          {paragraph.text}
        </p>
      ))}
      {stats.length > 0 && (
        <div data-count className="mt-5 flex flex-wrap gap-14 border-t border-clay-300 pt-7">
          {stats.map((stat: any, index: number) => (
            <div key={index} className="flex flex-col gap-1.5" data-tina-field={tinaField(stat)}>
              <span
                data-count-to={stat.value ?? 0}
                data-count-prefix={stat.prefix || ""}
                data-count-suffix={stat.suffix || ""}
                className="text-[length:clamp(36px,3.4vw,48px)] font-light leading-none tracking-[-.03em] text-sage-700 tabular-nums"
              >
                {formatCount(stat.value ?? 0, stat.prefix || "", stat.suffix || "")}
              </span>
              <span className="text-caption-sm uppercase tracking-[.16em] text-content-muted">{stat.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
