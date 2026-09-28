import { tinaField } from "tinacms/dist/react";
import { localizeHref, tField } from "../../utils/i18n";
import { mediaUrl } from "../../utils/mediaUrl";
import type { Locale } from "../../i18n/config";
import { presentLinks, type NavLink, type SimpleLink } from "./navTypes";

export const MEGA_MENU_ID = "header-mega-menu";

interface Props {
  link: NavLink | undefined;
  open: boolean;
  locale: Locale;
  onNavigate: () => void;
}

const underlineOnHover =
  "self-start bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_1px] bg-right-bottom bg-no-repeat pb-0.5 transition-[background-size] duration-500 ease-out-expo hover:bg-[length:100%_1px] hover:bg-left-bottom focus-visible:bg-[length:100%_1px]";

function MenuLink({ link, locale, className, onNavigate }: { link: SimpleLink; locale: Locale; className: string; onNavigate: () => void }) {
  return (
    <a
      href={localizeHref(link.url, locale)}
      onClick={onNavigate}
      className={`${underlineOnHover} ${className}`}
      data-tina-field={tinaField(link as any, "label")}
    >
      {tField(link, "label", locale)}
    </a>
  );
}

export default function MegaMenu({ link, open, locale, onNavigate }: Props) {
  const menu = link?.menu;
  const featured = presentLinks(menu?.featured);
  const columns = (menu?.columns || []).filter(Boolean);
  const card = menu?.card;
  const hasCard = Boolean(card?.title || card?.image);

  return (
    <div
      id={MEGA_MENU_ID}
      inert={!open}
      className={`absolute inset-x-0 top-full hidden border-t border-stone-150 bg-surface-raised shadow-lg transition-[opacity,transform,visibility] duration-[600ms] ease-out-expo lg:block ${
        open ? "visible translate-y-0 opacity-100" : "pointer-events-none invisible -translate-y-2.5 opacity-0"
      }`}
    >
      <div className="mx-auto grid max-w-container grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.15fr)] px-gutter pb-14 pt-12">
        <div className="flex flex-col gap-[18px] pr-10">
          {featured.map((item, index) => (
            <MenuLink key={index} link={item} locale={locale} onNavigate={onNavigate} className="text-heading-xs text-content" />
          ))}
        </div>

        {[0, 1].map((slot) => {
          const column = columns[slot];
          return (
            <div key={slot} className={`flex flex-col gap-3.5 px-10 ${column ? "border-l border-stone-150" : ""}`}>
              {column && (
                <>
                  <p className="mb-1.5 text-caption-sm uppercase tracking-[.16em] text-content-subtle" data-tina-field={tinaField(column as any, "title")}>
                    {tField(column, "title", locale)}
                  </p>
                  {presentLinks(column.links).map((item, index) => (
                    <MenuLink key={index} link={item} locale={locale} onNavigate={onNavigate} className="text-body-md text-content" />
                  ))}
                </>
              )}
            </div>
          );
        })}

        <div className="border-l border-stone-150 pl-10">
          {hasCard && card && (
            <a href={localizeHref(card.url, locale)} onClick={onNavigate} className="group flex flex-col gap-3.5">
              <div className="aspect-[4/3] overflow-hidden bg-[repeating-linear-gradient(135deg,theme(colors.clay.100)_0_12px,theme(colors.blush)_12px_24px)]">
                {card.image && (
                  <img
                    src={mediaUrl(card.image)}
                    alt=""
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-[1400ms] ease-out-expo group-hover:scale-105"
                    data-tina-field={tinaField(card as any, "image")}
                  />
                )}
              </div>
              {card.eyebrow && (
                <span className="text-caption-xs uppercase tracking-[.18em] text-content-subtle" data-tina-field={tinaField(card as any, "eyebrow")}>
                  {tField(card, "eyebrow", locale)}
                </span>
              )}
              {card.title && (
                <span className="text-[18px] leading-[1.3] text-content" data-tina-field={tinaField(card as any, "title")}>
                  {tField(card, "title", locale)}
                </span>
              )}
              {card.ctaLabel && (
                <span className="flex items-center gap-2.5 text-caption-sm font-medium uppercase tracking-[.14em] text-content">
                  {tField(card, "ctaLabel", locale)}
                  <span aria-hidden className="transition-transform duration-400 group-hover:translate-x-1">→</span>
                </span>
              )}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
