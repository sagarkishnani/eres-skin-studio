import { useTina, tinaField } from "tinacms/dist/react";
import { FaTruck, FaShieldHalved, FaCreditCard, FaRotateLeft, FaHeadset } from "react-icons/fa6";
import type { IconType } from "react-icons";
import { tField } from "../../utils/i18n";
import { mediaUrl } from "../../utils/mediaUrl";
import type { Locale } from "../../i18n/config";

const ICONS: Record<string, IconType> = {
  truck: FaTruck,
  shield: FaShieldHalved,
  card: FaCreditCard,
  returns: FaRotateLeft,
  support: FaHeadset,
};

interface Props {
  query: string;
  variables: object;
  data: any;
  locale: Locale;
}

export default function ShopHeroReact({ query, variables, data: initialData, locale }: Props) {
  const { data } = useTina({ query, variables, data: initialData });
  const hero = data?.shop?.hero;
  if (!hero) return <div hidden />;

  const badges = (hero.badges || []).filter(Boolean);
  const image = mediaUrl(hero.image);

  return (
    <section className="section pb-0">
      <div className="container-xl">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            {hero.eyebrow && (
              <p
                className="text-sm font-semibold uppercase tracking-widest text-brand-primary"
                data-tina-field={tinaField(hero, "eyebrow")}
              >
                {tField(hero, "eyebrow", locale)}
              </p>
            )}

            <h1 className="mt-3 text-heading-xl" data-tina-field={tinaField(hero, "title")}>
              {tField(hero, "title", locale)}
            </h1>

            {hero.description && (
              <p
                className="mt-4 max-w-xl text-body-lg text-content-muted"
                data-tina-field={tinaField(hero, "description")}
              >
                {tField(hero, "description", locale)}
              </p>
            )}

            {badges.length > 0 && (
              <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-3">
                {badges.map((badge: any, i: number) => {
                  const Icon = ICONS[badge.icon];
                  return (
                    <li
                      key={i}
                      className="flex items-center gap-2 text-sm text-content-muted"
                      data-tina-field={tinaField(badge, "label")}
                    >
                      {Icon && <Icon className="h-4 w-4 text-brand-primary" aria-hidden />}
                      {tField(badge, "label", locale)}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {image && (
            <div className="overflow-hidden rounded-2xl" data-tina-field={tinaField(hero, "image")}>
              <img
                src={image}
                alt={tField(hero, "title", locale) || ""}
                width="800"
                height="600"
                className="h-full w-full object-cover"
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
