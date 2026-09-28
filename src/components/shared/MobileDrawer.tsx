import { useEffect, useRef, useState } from "react";
import { tinaField } from "tinacms/dist/react";
import { PiCaretLeftLight, PiCaretRightLight, PiXLight } from "react-icons/pi";
import { localizeHref, tField } from "../../utils/i18n";
import { mediaUrl } from "../../utils/mediaUrl";
import type { Locale } from "../../i18n/config";
import { useFocusTrap } from "../../hooks/useFocusTrap";
import { hasSubmenu, presentLinks, type NavLink, type SimpleLink } from "./navTypes";
import { presentSocials, socialLabel, type Social } from "./socialLinks";
import { phoneHref, type Contact } from "./contactLinks";

interface Props {
  open: boolean;
  onClose: () => void;
  links: NavLink[];
  activeIndex: number;
  cta?: SimpleLink | null;
  contact?: Contact | null;
  socials: Social[];
  logo?: string | null;
  logoAlt?: string | null;
  locale: Locale;
}

const DESKTOP_QUERY = "(min-width: 1024px)";

export default function MobileDrawer({ open, onClose, links, activeIndex, cta, contact, socials, logo, logoAlt, locale }: Props) {
  const [submenuIndex, setSubmenuIndex] = useState<number | null>(null);
  const [lastSubmenuIndex, setLastSubmenuIndex] = useState(0);
  const drawerRef = useRef<HTMLElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useFocusTrap(drawerRef, open);

  useEffect(() => {
    if (!open) {
      setSubmenuIndex(null);
      return;
    }
    closeButtonRef.current?.focus({ preventScroll: true });
    const desktop = window.matchMedia(DESKTOP_QUERY);
    const closeOnDesktop = (event: MediaQueryListEvent) => event.matches && onClose();
    desktop.addEventListener("change", closeOnDesktop);
    return () => desktop.removeEventListener("change", closeOnDesktop);
  }, [open, onClose]);

  const openSubmenu = (index: number) => {
    setSubmenuIndex(index);
    setLastSubmenuIndex(index);
  };

  const submenuLink = links[lastSubmenuIndex];
  const submenuOpen = submenuIndex !== null;
  const visibleSocials = presentSocials(socials);

  return (
    <aside
      ref={drawerRef}
      role="dialog"
      aria-modal="true"
      aria-label="Menú"
      inert={!open}
      className={`fixed inset-y-0 left-0 z-[70] flex w-[min(88vw,420px)] flex-col bg-surface transition-transform duration-700 ease-out-expo lg:hidden ${
        open ? "translate-x-0" : "-translate-x-[102%]"
      }`}
    >
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-stone-150 pl-5 pr-2">
        {logo ? (
          <img src={mediaUrl(logo)} alt={logoAlt || "ERES Skin Studio"} className="block h-[30px] w-auto" />
        ) : (
          <span className="text-subtitle-sm font-medium">ERES Skin Studio</span>
        )}
        <button
          ref={closeButtonRef}
          type="button"
          onClick={onClose}
          aria-label="Cerrar menú"
          className="grid h-11 w-11 place-items-center text-content"
        >
          <PiXLight size={22} aria-hidden />
        </button>
      </div>

      <div className="relative flex-1 overflow-hidden">
        <div
          className={`flex h-full w-[200%] transition-transform duration-[600ms] ease-out-expo ${
            submenuOpen ? "-translate-x-1/2" : "translate-x-0"
          }`}
        >
          <div inert={submenuOpen} data-lenis-prevent className="flex h-full w-1/2 flex-col overflow-y-auto px-5 pb-8 pt-3">
            <nav aria-label="Principal" className="flex flex-col">
              {links.map((link, index) => {
                const withSubmenu = hasSubmenu(link);
                const itemClass = `flex min-h-[60px] items-center justify-between border-b border-stone-150 text-[22px] tracking-[-.015em] transition-[opacity,transform] ease-out-expo active:opacity-55 ${
                  index === activeIndex ? "text-sage-700" : "text-content"
                } ${open ? "translate-x-0 opacity-100" : "-translate-x-4 opacity-0"}`;
                const itemStyle = {
                  transitionDuration: "600ms, 800ms",
                  transitionDelay: open ? `${150 + index * 55}ms` : "0ms",
                };
                const label = tField(link, "label", locale);

                return withSubmenu ? (
                  <button
                    key={index}
                    type="button"
                    onClick={() => openSubmenu(index)}
                    className={`${itemClass} text-left`}
                    style={itemStyle}
                    data-tina-field={tinaField(link as any, "label")}
                  >
                    {label}
                    <PiCaretRightLight size={18} aria-hidden />
                  </button>
                ) : (
                  <a
                    key={index}
                    href={localizeHref(link.url, locale, link.external)}
                    target={link.external ? "_blank" : undefined}
                    rel={link.external ? "noopener noreferrer" : undefined}
                    aria-current={index === activeIndex ? "page" : undefined}
                    onClick={onClose}
                    className={itemClass}
                    style={itemStyle}
                    data-tina-field={tinaField(link as any, "label")}
                  >
                    {label}
                  </a>
                );
              })}
            </nav>

            {cta?.label && (
              <a href={localizeHref(cta.url, locale)} onClick={onClose} className="btn-primary mt-7 w-full">
                {tField(cta, "label", locale)} <span aria-hidden>→</span>
              </a>
            )}

            {(contact?.address || contact?.phone) && (
              <div className="mt-7 flex flex-col gap-2 text-body-xs text-content-muted">
                {contact.address && <p>{tField(contact, "address", locale)}</p>}
                {contact.phone && (
                  <a
                    href={phoneHref(contact)}
                    className="self-start bg-[linear-gradient(currentColor,currentColor)] bg-[length:100%_1px] bg-left-bottom bg-no-repeat"
                  >
                    {contact.phone}
                  </a>
                )}
              </div>
            )}

            {visibleSocials.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-5 text-caption-xs font-medium uppercase tracking-[.16em] text-content">
                {visibleSocials.map((social) => (
                  <a key={social.network} href={social.url!} target="_blank" rel="noopener noreferrer">
                    {socialLabel(social.network!)}
                  </a>
                ))}
              </div>
            )}
          </div>

          <div inert={!submenuOpen} data-lenis-prevent className="flex h-full w-1/2 flex-col gap-1.5 overflow-y-auto px-5 pb-8 pt-3">
            <button
              type="button"
              onClick={() => setSubmenuIndex(null)}
              className="flex items-center gap-2 self-start py-3 text-caption-sm font-medium uppercase tracking-[.16em] text-content-muted"
            >
              <PiCaretLeftLight size={14} aria-hidden />
              Volver
            </button>

            {submenuLink && (
              <>
                <a
                  href={localizeHref(submenuLink.url, locale, submenuLink.external)}
                  onClick={onClose}
                  className="mb-3 mt-1 text-[30px] tracking-[-.025em] text-content"
                >
                  {tField(submenuLink, "label", locale)}
                </a>

                {presentLinks(submenuLink.menu?.featured).map((item, index) => (
                  <a key={index} href={localizeHref(item.url, locale)} onClick={onClose} className="py-2.5 text-[19px] text-content active:opacity-55">
                    {tField(item, "label", locale)}
                  </a>
                ))}

                {(submenuLink.menu?.columns || []).filter(Boolean).map((column, index) => (
                  <div key={index} className="mt-[18px] flex flex-col gap-0.5 border-t border-stone-150 pt-[18px]">
                    {column?.title && (
                      <p className="mb-1.5 text-caption-xs uppercase tracking-[.18em] text-content-subtle">
                        {tField(column, "title", locale)}
                      </p>
                    )}
                    {presentLinks(column?.links).map((item, linkIndex) => (
                      <a key={linkIndex} href={localizeHref(item.url, locale)} onClick={onClose} className="py-[9px] text-body-md text-content active:opacity-55">
                        {tField(item, "label", locale)}
                      </a>
                    ))}
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
