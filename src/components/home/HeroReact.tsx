import { useTina, tinaField } from "tinacms/dist/react";
import { tField, localizeHref } from "../../utils/i18n";
import { mediaUrl } from "../../utils/mediaUrl";
import type { Locale } from "../../i18n/config";

interface Props {
  query: string;
  variables: object;
  data: any;
  locale: Locale;
}

export default function HeroReact({ query, variables, data: initialData, locale }: Props) {
  const { data } = useTina({ query, variables, data: initialData });
  const hero = data?.home?.hero;
  if (!hero) return <div hidden />;

  const onScrim = Boolean(hero.image);
  const buttons = (hero.buttons || []).filter(Boolean);

  return (
    <section className="relative flex min-h-[88vh] items-center overflow-hidden pt-[72px]">
      {hero.image && (
        <>
          <img
            src={mediaUrl(hero.image)}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-content via-content/85 to-content/40" />
        </>
      )}

      <div className={`container-xl relative ${onScrim ? "text-white" : ""}`}>
        <div className="max-w-3xl">
          {hero.eyebrow && (
            <p
              className="mb-4 text-body-sm uppercase tracking-[0.2em] text-accent"
              data-tina-field={tinaField(hero, "eyebrow")}
            >
              {tField(hero, "eyebrow", locale)}
            </p>
          )}

          <h1 className="text-heading-xxl" data-tina-field={tinaField(hero, "title")}>
            {tField(hero, "title", locale)}
          </h1>

          {hero.subtitle && (
            <p
              className={`mt-6 max-w-2xl text-body-lg ${onScrim ? "text-white/75" : "text-content-muted"}`}
              data-tina-field={tinaField(hero, "subtitle")}
            >
              {tField(hero, "subtitle", locale)}
            </p>
          )}

          {buttons.length > 0 && (
            <div className="mt-10 flex flex-wrap gap-4">
              {buttons.map((btn: any, i: number) => (
                <a
                  key={i}
                  href={localizeHref(btn.url, locale)}
                  className={btn.variant === "secondary" ? "btn-secondary" : "btn-primary"}
                >
                  {tField(btn, "text", locale)}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
