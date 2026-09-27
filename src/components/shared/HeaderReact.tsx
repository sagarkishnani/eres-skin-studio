import { useEffect, useState } from "react";
import { useTina, tinaField } from "tinacms/dist/react";
import { FaBars, FaXmark } from "react-icons/fa6";
import { tField, localizeHref } from "../../utils/i18n";
import { mediaUrl } from "../../utils/mediaUrl";
import type { Locale } from "../../i18n/config";
import SearchOverlay from "./SearchOverlay";
import CartReact from "../shop/CartReact";

interface Props {
  query: string;
  variables: object;
  data: any;
  locale: Locale;
  theme?: "light" | "dark";
}

export default function HeaderReact({ query, variables, data: initialData, locale, theme = "dark" }: Props) {
  const { data } = useTina({ query, variables, data: initialData });
  const nav = data?.global?.nav;

  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const links = (nav?.links || []).filter(Boolean);
  const solid = theme === "light" || scrolled || open;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        solid ? "bg-surface/95 backdrop-blur border-b border-line" : "bg-transparent"
      }`}
    >
      <div className="container-xl flex h-[72px] items-center justify-between gap-6">
        <a href={localizeHref("/", locale)} className="flex items-center gap-3" aria-label="ERES Skin Studio">
          {nav?.logo ? (
            <img
              src={mediaUrl(nav.logo)}
              alt={nav?.logoAlt || "ERES Skin Studio"}
              className="h-8 w-auto"
              data-tina-field={tinaField(nav, "logo")}
            />
          ) : (
            <span className="font-heading text-subtitle-sm font-semibold tracking-tight">
              ERES Skin Studio
            </span>
          )}
        </a>

        <nav className="hidden items-center gap-8 lg:flex">
          {links.map((link: any, i: number) => (
            <a
              key={i}
              href={localizeHref(link.url, locale, link.external)}
              target={link.external ? "_blank" : undefined}
              rel={link.external ? "noopener noreferrer" : undefined}
              className="text-body-md text-content-muted transition-colors hover:text-content"
              data-tina-field={tinaField(link, "label")}
            >
              {tField(link, "label", locale)}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-4 lg:flex">
          <SearchOverlay locale={locale} />
          <CartReact />
          {nav?.cta?.label && (
            <a href={localizeHref(nav.cta.url, locale)} className="btn-primary !px-5 !py-2.5 text-body-sm">
              {tField(nav.cta, "label", locale)}
            </a>
          )}
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="lg:hidden p-2 text-content"
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={open}
        >
          {open ? <FaXmark size={22} /> : <FaBars size={22} />}
        </button>
      </div>

      {open && (
        <div className="lg:hidden border-t border-line bg-surface">
          <nav className="container-xl flex flex-col gap-1 py-4">
            {links.map((link: any, i: number) => (
              <a
                key={i}
                href={localizeHref(link.url, locale, link.external)}
                onClick={() => setOpen(false)}
                className="px-2 py-3 text-body-lg text-content-muted hover:bg-surface-raised hover:text-content"
              >
                {tField(link, "label", locale)}
              </a>
            ))}
            {nav?.cta?.label && (
              <a href={localizeHref(nav.cta.url, locale)} className="btn-primary mt-3">
                {tField(nav.cta, "label", locale)}
              </a>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
