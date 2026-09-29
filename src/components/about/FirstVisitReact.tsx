import { useTina, tinaField } from "tinacms/dist/react";

interface Props {
  query: string;
  variables: object;
  data: any;
  whatsappUrl: string;
}

export default function FirstVisitReact({ query, variables, data: initialData, whatsappUrl }: Props) {
  const { data } = useTina({ query, variables, data: initialData });
  const firstVisit = data?.about?.firstVisit;
  if (!firstVisit) return <div hidden />;

  return (
    <section className="bg-blush py-[clamp(64px,9vw,120px)]">
      <div className="container-xl grid grid-cols-[repeat(auto-fit,minmax(min(100%,420px),1fr))] items-center gap-x-20 gap-y-7">
        <div data-reveal="0" className="flex flex-col gap-5">
          {firstVisit.eyebrow && (
            <span className="eyebrow text-clay-800" data-tina-field={tinaField(firstVisit, "eyebrow")}>
              {firstVisit.eyebrow}
            </span>
          )}
          <h2
            className="whitespace-pre-line text-[length:clamp(38px,4.6vw,66px)] font-light italic leading-[1.04] tracking-[-.035em]"
            data-tina-field={tinaField(firstVisit, "title")}
          >
            {firstVisit.title}
          </h2>
        </div>
        <div data-reveal="120" className="flex max-w-[500px] flex-col items-start gap-7">
          {firstVisit.text && (
            <p
              className="text-body-md text-content-muted [text-wrap:pretty]"
              data-tina-field={tinaField(firstVisit, "text")}
            >
              {firstVisit.text}
            </p>
          )}
          {whatsappUrl && firstVisit.ctaLabel && (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-fill-dark"
              data-tina-field={tinaField(firstVisit, "ctaLabel")}
            >
              {firstVisit.ctaLabel} <span aria-hidden="true">→</span>
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
