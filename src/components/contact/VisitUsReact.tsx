import { useTina, tinaField } from "tinacms/dist/react";

interface Props {
  query: string;
  variables: object;
  data: any;
}

function MapConsentPlaceholder({ visit }: { visit: any }) {
  return (
    <div data-map-placeholder className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center">
      {visit.consentText && (
        <p className="max-w-[320px] text-body-sm text-accent" data-tina-field={tinaField(visit, "consentText")}>
          {visit.consentText}
        </p>
      )}
      {visit.consentCtaLabel && (
        <button
          type="button"
          data-open-consent
          className="btn-link text-accent"
          data-tina-field={tinaField(visit, "consentCtaLabel")}
        >
          {visit.consentCtaLabel}
        </button>
      )}
    </div>
  );
}

export default function VisitUsReact({ query, variables, data: initialData }: Props) {
  const { data } = useTina({ query, variables, data: initialData });
  const visit = data?.contact?.visit;
  if (!visit) return <div hidden />;

  return (
    <section className="bg-sage-100 py-[clamp(56px,8vw,112px)]">
      <div className="container-xl grid grid-cols-[repeat(auto-fit,minmax(min(100%,420px),1fr))] items-center gap-x-[clamp(40px,6vw,96px)] gap-y-9">
        <div data-reveal="0" className="flex max-w-[540px] flex-col gap-5">
          {visit.eyebrow && (
            <span className="eyebrow text-accent" data-tina-field={tinaField(visit, "eyebrow")}>
              {visit.eyebrow}
            </span>
          )}
          <h2 className="mb-1.5 whitespace-pre-line text-heading-md [text-wrap:balance]" data-tina-field={tinaField(visit, "title")}>
            {visit.title}
          </h2>
          {visit.text && (
            <p className="text-body-md text-accent [text-wrap:pretty]" data-tina-field={tinaField(visit, "text")}>
              {visit.text}
            </p>
          )}
          {visit.mapsUrl && visit.ctaLabel && (
            <a
              href={visit.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-fill-dark mt-2.5 self-start"
              data-tina-field={tinaField(visit, "ctaLabel")}
            >
              {visit.ctaLabel}
            </a>
          )}
        </div>
        {visit.embedUrl && (
          <div
            data-reveal="120"
            data-consent-map
            data-embed-url={visit.embedUrl}
            data-map-title={visit.mapTitle || ""}
            className="relative h-[320px] overflow-hidden bg-sage-300 md:h-[480px]"
          >
            <MapConsentPlaceholder visit={visit} />
          </div>
        )}
      </div>
    </section>
  );
}
