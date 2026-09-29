import { useTina, tinaField } from "tinacms/dist/react";

interface Props {
  query: string;
  variables: object;
  data: any;
  instagramUrl: string;
}

const REVEAL_STEP_MS = 80;
const MOBILE_TILE_COUNT = 4;

function InstagramIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r=".8" fill="currentColor" />
    </svg>
  );
}

export default function InstagramGridReact({ query, variables, data: initialData, instagramUrl }: Props) {
  const { data } = useTina({ query, variables, data: initialData });
  const instagram = data?.about?.instagram;
  if (!instagram) return <div hidden />;
  const images = (instagram.images || []).filter((image: any) => image?.src);
  const externalLink = { href: instagramUrl, target: "_blank", rel: "noopener noreferrer" };

  return (
    <section className="bg-surface-raised py-[clamp(56px,8vw,112px)]">
      <div className="container-xl">
        <div
          data-reveal="0"
          className="mb-[clamp(28px,4vw,48px)] flex flex-wrap items-end justify-between gap-x-10 gap-y-5"
        >
          <div className="flex flex-col gap-4">
            {instagram.eyebrow && (
              <span className="eyebrow" data-tina-field={tinaField(instagram, "eyebrow")}>
                {instagram.eyebrow}
              </span>
            )}
            <h2
              className="text-heading-md font-light italic [text-wrap:balance]"
              data-tina-field={tinaField(instagram, "title")}
            >
              {instagram.title}
            </h2>
          </div>
          {instagram.ctaLabel && (
            <a {...externalLink} className="link-underline" data-tina-field={tinaField(instagram, "ctaLabel")}>
              {instagram.ctaLabel} <span aria-hidden="true">→</span>
            </a>
          )}
        </div>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-5 md:gap-3">
          {images.map((image: any, index: number) => (
            <a
              key={index}
              {...externalLink}
              aria-label="Ver en Instagram"
              data-reveal={index * REVEAL_STEP_MS}
              className={`group relative block aspect-[4/5] overflow-hidden bg-stone-150 max-md:![transition-delay:0ms] ${
                index >= MOBILE_TILE_COUNT ? "max-md:hidden" : ""
              }`}
              data-tina-field={tinaField(image)}
            >
              <img
                src={image.src}
                alt=""
                loading="lazy"
                decoding="async"
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1200ms] ease-out-expo lg:group-hover:scale-[1.06]"
                style={{ objectPosition: image.position || "50% 50%" }}
              />
              <span className="absolute inset-0 grid place-items-center bg-ink/40 text-content-inverse opacity-0 transition-opacity duration-500 ease-out lg:group-hover:opacity-100">
                <InstagramIcon />
              </span>
            </a>
          ))}
        </div>
        {instagram.handle && (
          <a
            {...externalLink}
            className="mx-auto mt-6 block w-max bg-[length:0%_1px] bg-right-bottom bg-no-repeat text-caption-md font-medium uppercase tracking-[.14em] transition-[background-size] duration-500 ease-out-expo [background-image:linear-gradient(currentColor,currentColor)] hover:bg-[length:100%_1px] hover:bg-left-bottom focus-visible:bg-[length:100%_1px] focus-visible:bg-left-bottom"
            data-tina-field={tinaField(instagram, "handle")}
          >
            {instagram.handle}
          </a>
        )}
      </div>
    </section>
  );
}
