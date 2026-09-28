import { useTina, tinaField } from "tinacms/dist/react";
import { PiCaretDownLight, PiListLight } from "react-icons/pi";
import { tField, localizeHref } from "../../utils/i18n";
import { mediaUrl } from "../../utils/mediaUrl";
import type { Locale } from "../../i18n/config";
import SearchOverlay from "./SearchOverlay";
import CartReact from "../shop/CartReact";
import AnnouncementBar from "./AnnouncementBar";
import { activeLinkIndex, hasSubmenu, presentLinks, type NavLink } from "./navTypes";

interface Props {
  query: string;
  variables: object;
  data: any;
  locale: Locale;
  currentPath: string;
}

const iconButton =
  "grid h-11 w-11 place-items-center text-content transition-opacity duration-300 hover:opacity-60";

function underline(on: boolean): string {
  return on
    ? "bg-[length:100%_1px] bg-left-bottom"
    : "bg-[length:0%_1px] bg-right-bottom group-hover:bg-[length:100%_1px] group-hover:bg-left-bottom";
}

export default function HeaderReact({ query, variables, data: initialData, locale, currentPath }: Props) {
  const { data } = useTina({ query, variables, data: initialData });
  const global = data?.global;
  const nav = global?.nav;

  const links = presentLinks<NavLink>(nav?.links);
  const activeIndex = activeLinkIndex(links, currentPath);

  return (
    <>
      <AnnouncementBar announcement={global?.announcement} locale={locale} />

      <header className="sticky top-0 z-50 bg-surface-raised shadow-[0_1px_0_theme(colors.line.DEFAULT)]">
        <div className="mx-auto grid h-16 max-w-container grid-cols-[1fr_auto_1fr] items-center px-2 lg:h-[88px] lg:px-gutter">
          <button type="button" className={`${iconButton} col-start-1 row-start-1 justify-self-start lg:hidden`} aria-label="Abrir menú">
            <PiListLight size={24} aria-hidden />
          </button>

          <a
            href={localizeHref("/", locale)}
            className="col-start-2 row-start-1 flex items-center justify-self-center lg:col-start-1 lg:justify-self-start"
            aria-label="ERES Skin Studio, inicio"
          >
            {nav?.logo ? (
              <img
                src={mediaUrl(nav.logo)}
                alt={nav?.logoAlt || "ERES Skin Studio"}
                className="block h-[34px] w-auto lg:h-10"
                data-tina-field={tinaField(nav, "logo")}
              />
            ) : (
              <span className="text-subtitle-sm font-medium tracking-tight">ERES Skin Studio</span>
            )}
          </a>

          <nav className="col-start-2 row-start-1 hidden h-full items-center gap-9 lg:flex" aria-label="Principal">
            {links.map((link, index) => {
              const isActive = index === activeIndex;
              return (
                <a
                  key={index}
                  href={localizeHref(link.url, locale, link.external)}
                  target={link.external ? "_blank" : undefined}
                  rel={link.external ? "noopener noreferrer" : undefined}
                  aria-current={isActive ? "page" : undefined}
                  className={`group flex h-full items-center gap-1.5 text-body-md font-medium tracking-[.01em] transition-colors duration-300 ${
                    isActive ? "text-sage-700" : "text-content"
                  }`}
                  data-tina-field={tinaField(link as any, "label")}
                >
                  <span
                    className={`bg-[linear-gradient(currentColor,currentColor)] bg-no-repeat pb-[3px] transition-[background-size] duration-500 ease-out-expo ${underline(isActive)}`}
                  >
                    {tField(link, "label", locale)}
                  </span>
                  {hasSubmenu(link) && <PiCaretDownLight size={12} aria-hidden />}
                </a>
              );
            })}
          </nav>

          <div className="col-start-3 row-start-1 flex items-center gap-2 justify-self-end">
            <SearchOverlay locale={locale} />
            <CartReact />
          </div>
        </div>
      </header>
    </>
  );
}
