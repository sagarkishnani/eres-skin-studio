import { useTina, tinaField } from "tinacms/dist/react";
import { mediaUrl } from "../../utils/mediaUrl";

interface Props {
  query: string;
  variables: object;
  data: any;
  categoryName?: string;
}

const hoverUnderline =
  "bg-[length:0%_1px] bg-right-bottom bg-no-repeat transition-[background-size] duration-500 ease-out-expo [background-image:linear-gradient(currentColor,currentColor)] hover:bg-[length:100%_1px] hover:bg-left-bottom focus-visible:bg-[length:100%_1px] focus-visible:bg-left-bottom";

function Breadcrumb({ categoryName }: { categoryName?: string }) {
  return (
    <nav
      aria-label="Migas de pan"
      className="flex flex-wrap gap-2.5 text-caption-sm font-medium uppercase tracking-[.18em] text-content-muted"
    >
      <a href="/" className={hoverUnderline}>
        Home
      </a>
      <span aria-hidden="true">/</span>
      {categoryName ? (
        <>
          <a href="/productos" className={hoverUnderline}>
            Productos
          </a>
          <span aria-hidden="true">/</span>
          <span aria-current="page" className="text-content">
            {categoryName}
          </span>
        </>
      ) : (
        <span aria-current="page" className="text-content">
          Productos
        </span>
      )}
    </nav>
  );
}

export default function ShopBannerReact({ query, variables, data: initialData, categoryName }: Props) {
  const { data } = useTina({ query, variables, data: initialData });
  const hero = data?.shop?.hero;
  if (!hero) return <div hidden />;

  return (
    <section className="relative bg-surface">
      <div className="relative h-[220px] overflow-hidden bg-surface-sunken md:h-[clamp(420px,38vw,560px)]">
        {hero.image && (
          <img
            src={mediaUrl(hero.image)}
            alt={hero.imageAlt || ""}
            decoding="async"
            fetchPriority="high"
            className="absolute inset-0 h-full w-full object-cover [object-position:50%_62%]"
            data-tina-field={tinaField(hero, "image")}
          />
        )}
        <div className="absolute inset-0 hidden bg-gradient-to-t from-surface/55 to-transparent to-55% md:block" />
      </div>
      <div className="container-xl grid grid-cols-[repeat(auto-fit,minmax(min(100%,380px),1fr))] items-end gap-x-16 gap-y-4 pt-[clamp(28px,4vw,56px)] md:absolute md:inset-x-0 md:bottom-0 md:pb-[clamp(32px,4vw,56px)] md:pt-0">
        <div data-reveal="0" className="flex flex-col gap-4">
          <Breadcrumb categoryName={categoryName} />
          {categoryName ? (
            <h1 className="text-heading-xl [text-wrap:balance] md:text-heading-lg">{categoryName}</h1>
          ) : hero.titleMobile ? (
            <h1 className="whitespace-pre-line text-heading-xl [text-wrap:balance] md:text-heading-lg">
              <span className="md:hidden" data-tina-field={tinaField(hero, "titleMobile")}>
                {hero.titleMobile}
              </span>
              <span className="hidden md:inline" data-tina-field={tinaField(hero, "title")}>
                {hero.title}
              </span>
            </h1>
          ) : (
            <h1 className="whitespace-pre-line text-heading-xl [text-wrap:balance] md:text-heading-lg" data-tina-field={tinaField(hero, "title")}>
              {hero.title}
            </h1>
          )}
        </div>
        {hero.description && (
          <p
            data-reveal="120"
            className="hidden max-w-[480px] text-body-md leading-[1.65] text-content-muted [text-wrap:pretty] md:block md:justify-self-end"
            data-tina-field={tinaField(hero, "description")}
          >
            {hero.description}
          </p>
        )}
      </div>
    </section>
  );
}
