import { useTina, tinaField } from "tinacms/dist/react";
import { tField, localizeHref } from "../../utils/i18n";
import type { Locale } from "../../i18n/config";

interface Props {
  query: string;
  variables: object;
  data: any;
  locale: Locale;
}

export default function CTAReact({ query, variables, data: initialData, locale }: Props) {
  const { data } = useTina({ query, variables, data: initialData });
  const cta = data?.home?.cta;
  if (!cta?.title) return <div hidden />;

  return (
    <section id="cta" className="section">
      <div className="container-xl">
        {/* text-white is intentional: the brand gradient is dark in both themes. */}
        <div className="rounded-2xl bg-gradient-to-br from-ink via-ink to-accent px-8 py-14 text-center text-white md:px-16">
          <h2 className="text-heading-md" data-tina-field={tinaField(cta, "title")}>
            {tField(cta, "title", locale)}
          </h2>
          {cta.description && (
            <p className="mx-auto mt-4 max-w-xl text-body-lg text-white/75">
              {tField(cta, "description", locale)}
            </p>
          )}
          {cta.buttonText && (
            <a
              href={localizeHref(cta.buttonUrl, locale)}
              className="btn mt-8 bg-white text-accent hover:bg-white/90"
            >
              {tField(cta, "buttonText", locale)}
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
