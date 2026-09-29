import { useTina, tinaField } from "tinacms/dist/react";

interface Props {
  query: string;
  variables: object;
  data: any;
  whatsappUrl: string;
}

const LIGHT_THEME = {
  section: "bg-blush text-content",
  eyebrow: "text-clay-800",
  paragraph: "text-content-muted",
  button: "btn-fill-dark",
  image: "",
};

const GREEN_THEME = {
  section: "bg-sage-700 text-content-inverse",
  eyebrow: "text-content-inverse",
  paragraph: "text-content-inverse",
  button: "btn-outline-light",
  image: "lg:order-2",
};

function themeForPosition(index: number) {
  return index % 2 === 1 ? GREEN_THEME : LIGHT_THEME;
}

export default function ServiceBlocksReact({ query, variables, data: initialData, whatsappUrl }: Props) {
  const { data } = useTina({ query, variables, data: initialData });
  const blocks = data?.services?.blocks;
  if (!blocks) return <div hidden />;
  const items = (blocks.items || []).filter(Boolean);

  return (
    <>
      {items.map((service: any, index: number) => {
        const theme = themeForPosition(index);
        const number = String(index + 1).padStart(2, "0");
        const paragraphs = (service.paragraphs || []).filter(Boolean);

        return (
          <section
            key={index}
            id={service.slug || undefined}
            className={`py-[clamp(40px,6vw,96px)] ${theme.section}`}
            data-tina-field={tinaField(service)}
          >
            <div className="container-xl grid grid-cols-1 items-center gap-[clamp(28px,5vw,88px)] lg:grid-cols-2">
              <div
                data-reveal="0"
                className={`group relative aspect-[4/3] overflow-hidden bg-stone-150 md:aspect-[5/4] ${theme.image}`}
              >
                {service.image && (
                  <img
                    src={service.image}
                    alt={service.name || ""}
                    loading={index === 0 ? "eager" : "lazy"}
                    decoding="async"
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1400ms] ease-out-expo lg:group-hover:scale-[1.04]"
                    data-tina-field={tinaField(service, "image")}
                  />
                )}
              </div>
              <div data-reveal="120" className="flex max-w-[560px] flex-col gap-[18px]">
                <span className={`eyebrow ${theme.eyebrow}`} data-tina-field={tinaField(service, "name")}>
                  — {number} / {service.name}
                </span>
                <h2
                  className="mb-1.5 whitespace-pre-line text-heading-md [text-wrap:balance]"
                  data-tina-field={tinaField(service, "title")}
                >
                  {service.title}
                </h2>
                {paragraphs.map((paragraph: any, paragraphIndex: number) => (
                  <p
                    key={paragraphIndex}
                    className={`text-body-md [text-wrap:pretty] ${theme.paragraph}`}
                    data-tina-field={tinaField(paragraph, "text")}
                  >
                    {paragraph.text}
                  </p>
                ))}
                {whatsappUrl && blocks.ctaLabel && (
                  <div className="mt-3.5 flex">
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={theme.button}
                      data-tina-field={tinaField(blocks, "ctaLabel")}
                    >
                      {blocks.ctaLabel} <span aria-hidden="true">→</span>
                    </a>
                  </div>
                )}
              </div>
            </div>
          </section>
        );
      })}
    </>
  );
}
