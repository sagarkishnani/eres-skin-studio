import { useTina, tinaField } from "tinacms/dist/react";
import { FaBolt, FaShieldHalved, FaChartLine, FaClock, FaUsers, FaCheck } from "react-icons/fa6";
import type { IconType } from "react-icons";
import { tField } from "../../utils/i18n";
import type { Locale } from "../../i18n/config";

// Keep in sync with the icon options in tina/collections/home.ts.
const ICONS: Record<string, IconType> = {
  bolt: FaBolt,
  shield: FaShieldHalved,
  chart: FaChartLine,
  clock: FaClock,
  users: FaUsers,
  check: FaCheck,
};

interface Props {
  query: string;
  variables: object;
  data: any;
  locale: Locale;
}

export default function FeaturesReact({ query, variables, data: initialData, locale }: Props) {
  const { data } = useTina({ query, variables, data: initialData });
  const features = data?.home?.features;
  const items = (features?.items || []).filter(Boolean);
  if (!features || items.length === 0) return <div hidden />;

  return (
    <section id="features" className="section">
      <div className="container-xl">
        <div className="max-w-2xl">
          <h2 className="text-heading-lg" data-tina-field={tinaField(features, "title")}>
            {tField(features, "title", locale)}
          </h2>
          {features.description && (
            <p
              className="mt-4 text-body-lg text-content-muted"
              data-tina-field={tinaField(features, "description")}
            >
              {tField(features, "description", locale)}
            </p>
          )}
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item: any, i: number) => {
            const Icon = ICONS[item.icon];
            return (
              <article key={i} className="card" data-tina-field={tinaField(item, "title")}>
                {Icon && (
                  <span className="mb-5 flex h-11 w-11 items-center justify-center rounded-lg bg-accent/15 text-accent">
                    <Icon size={19} />
                  </span>
                )}
                <h3 className="text-subtitle-sm">{tField(item, "title", locale)}</h3>
                <p className="mt-2 text-body-sm text-content-muted">
                  {tField(item, "description", locale)}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
