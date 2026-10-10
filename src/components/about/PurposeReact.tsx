import { useTina, tinaField } from "tinacms/dist/react";
import { mediaUrl } from "../../utils/mediaUrl";

interface Props {
  query: string;
  variables: object;
  data: any;
}

export default function PurposeReact({ query, variables, data: initialData }: Props) {
  const { data } = useTina({ query, variables, data: initialData });
  const purpose = data?.about?.purpose;
  if (!purpose) return <div hidden />;
  const paragraphs = (purpose.paragraphs || []).filter(Boolean);

  return (
    <section className="bg-surface-raised py-[clamp(56px,8vw,120px)]">
      <div className="container-xl grid grid-cols-[repeat(auto-fit,minmax(min(100%,420px),1fr))] items-center gap-x-[clamp(40px,6vw,96px)] gap-y-10">
        <div data-reveal="0" className="group relative aspect-[4/3] overflow-hidden bg-stone-150">
          {purpose.image && (
            <img
              src={mediaUrl(purpose.image)}
              alt={purpose.imageAlt || ""}
              loading="lazy"
              decoding="async"
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1400ms] ease-out-expo lg:group-hover:scale-[1.04]"
              style={{ objectPosition: purpose.imagePosition || "50% 50%" }}
              data-tina-field={tinaField(purpose, "image")}
            />
          )}
        </div>
        <div data-reveal="120" className="flex max-w-[560px] flex-col gap-[18px]">
          {purpose.eyebrow && (
            <span className="eyebrow text-sage-700" data-tina-field={tinaField(purpose, "eyebrow")}>
              {purpose.eyebrow}
            </span>
          )}
          <h2
            className="mb-1.5 whitespace-pre-line text-heading-md [text-wrap:balance]"
            data-tina-field={tinaField(purpose, "title")}
          >
            {purpose.title}
          </h2>
          {paragraphs.map((paragraph: any, index: number) => (
            <p
              key={index}
              className="text-body-md text-content-muted [text-wrap:pretty]"
              data-tina-field={tinaField(paragraph, "text")}
            >
              {paragraph.text}
            </p>
          ))}
          {purpose.quote && (
            <figure className="mt-3 flex flex-col gap-3 border-t border-line pt-6">
              <blockquote
                className="text-subtitle-lg italic text-content [text-wrap:pretty]"
                data-tina-field={tinaField(purpose, "quote")}
              >
                {purpose.quote}
              </blockquote>
              {purpose.quoteAuthor && (
                <figcaption
                  className="text-caption-xs font-medium uppercase tracking-[.18em] text-content-subtle"
                  data-tina-field={tinaField(purpose, "quoteAuthor")}
                >
                  {purpose.quoteAuthor}
                </figcaption>
              )}
            </figure>
          )}
        </div>
      </div>
    </section>
  );
}
