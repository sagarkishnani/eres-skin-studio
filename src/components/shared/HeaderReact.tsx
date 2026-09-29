import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from "react";
import { useTina, tinaField } from "tinacms/dist/react";
import { PiCaretDownLight, PiListLight, PiMagnifyingGlassLight } from "react-icons/pi";
import { tField, localizeHref } from "../../utils/i18n";
import { mediaUrl } from "../../utils/mediaUrl";
import type { Locale } from "../../i18n/config";
import SearchOverlay from "./SearchOverlay";
import { CartButton, CartDrawer } from "../shop/CartReact";
import { useCart } from "../../hooks/useCart";
import AnnouncementBar from "./AnnouncementBar";
import { useHeaderScroll } from "../../hooks/useHeaderScroll";
import MegaMenu, { MEGA_MENU_ID } from "./MegaMenu";
import MobileDrawer from "./MobileDrawer";
import HeaderOverlay from "./HeaderOverlay";
import { lockScroll, unlockScroll } from "../../utils/scrollLock";

type OpenPanel = null | "drawer" | "search" | "cart";
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

  const [megaMenuIndex, setMegaMenuIndex] = useState<number | null>(null);
  const [lastMegaMenuIndex, setLastMegaMenuIndex] = useState(0);
  const navItemRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const megaOpen = megaMenuIndex !== null;
  const [openPanel, setOpenPanel] = useState<OpenPanel>(null);
  const closePanel = useCallback(() => setOpenPanel(null), []);

  const cart = useCart();
  const scroll = useHeaderScroll();
  const hidden = scroll.hidden && !megaOpen && openPanel === null;
  const elevated = scroll.scrolled || megaOpen;

  useEffect(() => {
    document.documentElement.dataset.header = hidden ? "hidden" : scroll.scrolled ? "compact" : "full";
  }, [hidden, scroll.scrolled]);

  const openMegaMenu = (index: number) => {
    setMegaMenuIndex(index);
    setLastMegaMenuIndex(index);
  };
  const closeMegaMenu = () => setMegaMenuIndex(null);

  const toggleMegaMenuFromKeyboard = (event: KeyboardEvent, index: number) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    megaMenuIndex === index ? closeMegaMenu() : openMegaMenu(index);
  };

  const openPanelExclusively = (panel: Exclude<OpenPanel, null>) => {
    closeMegaMenu();
    setOpenPanel(panel);
  };

  const closeEverything = () => {
    closeMegaMenu();
    closePanel();
  };

  useEffect(() => {
    const toggleSearchShortcut = (event: globalThis.KeyboardEvent) => {
      if (!(event.metaKey || event.ctrlKey) || event.key.toLowerCase() !== "k") return;
      event.preventDefault();
      closeMegaMenu();
      setOpenPanel((panel) => (panel === "search" ? null : "search"));
    };
    window.addEventListener("keydown", toggleSearchShortcut);
    return () => window.removeEventListener("keydown", toggleSearchShortcut);
  }, []);

  useEffect(() => {
    if (openPanel === null) return;
    lockScroll();
    const onKeyDown = (event: globalThis.KeyboardEvent) => event.key === "Escape" && closePanel();
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      unlockScroll();
    };
  }, [openPanel, closePanel]);

  useEffect(() => {
    if (megaMenuIndex === null) return;
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key !== "Escape") return;
      navItemRefs.current[megaMenuIndex]?.focus();
      closeMegaMenu();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [megaMenuIndex]);

  return (
    <>
      <AnnouncementBar announcement={global?.announcement} locale={locale} />

      <header
        onMouseLeave={closeMegaMenu}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) closeMegaMenu();
        }}
        className={`sticky top-0 z-50 bg-surface-raised transition-[transform,box-shadow] duration-[600ms] ease-out-expo ${
          hidden ? "-translate-y-full" : "translate-y-0"
        } ${elevated ? "shadow-header-raised" : "shadow-header"}`}
      >
        <div
          className={`mx-auto grid h-16 max-w-container grid-cols-[1fr_auto_1fr] items-center px-2 transition-[height] duration-[450ms] ease-out-expo lg:px-gutter ${
            scroll.scrolled ? "lg:h-[72px]" : "lg:h-[88px]"
          }`}
        >
          <button
            type="button"
            onClick={() => openPanelExclusively("drawer")}
            className={`${iconButton} col-start-1 row-start-1 justify-self-start lg:hidden`}
            aria-label="Abrir menú"
            aria-expanded={openPanel === "drawer"}
          >
            <PiListLight size={24} aria-hidden />
          </button>

          <a
            href={localizeHref("/", locale)}
            onMouseEnter={closeMegaMenu}
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
              const withSubmenu = hasSubmenu(link);
              const isOpen = megaMenuIndex === index;
              const isActive = index === activeIndex;
              return (
                <a
                  key={index}
                  ref={(element) => {
                    navItemRefs.current[index] = element;
                  }}
                  onMouseEnter={() => (withSubmenu ? openMegaMenu(index) : closeMegaMenu())}
                  onKeyDown={withSubmenu ? (event) => toggleMegaMenuFromKeyboard(event, index) : undefined}
                  aria-expanded={withSubmenu ? isOpen : undefined}
                  aria-controls={withSubmenu ? MEGA_MENU_ID : undefined}
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
                    className={`bg-[linear-gradient(currentColor,currentColor)] bg-no-repeat pb-[3px] transition-[background-size] duration-500 ease-out-expo ${underline(isActive || isOpen)}`}
                  >
                    {tField(link, "label", locale)}
                  </span>
                  {withSubmenu && (
                    <PiCaretDownLight
                      size={12}
                      aria-hidden
                      className={`transition-transform duration-400 ease-out-expo ${isOpen ? "rotate-180" : ""}`}
                    />
                  )}
                </a>
              );
            })}
          </nav>

          <div onMouseEnter={closeMegaMenu} className="col-start-3 row-start-1 flex items-center justify-self-end lg:gap-2">
            <button
              type="button"
              onClick={() => openPanelExclusively("search")}
              className={iconButton}
              aria-label="Buscar"
              aria-expanded={openPanel === "search"}
            >
              <PiMagnifyingGlassLight size={20} aria-hidden />
            </button>
            <CartButton
              count={cart.count}
              bumping={cart.bumping}
              expanded={openPanel === "cart"}
              onOpen={() => openPanelExclusively("cart")}
            />
          </div>
        </div>

        <MegaMenu link={links[lastMegaMenuIndex]} open={megaOpen} locale={locale} onNavigate={closeMegaMenu} />
      </header>

      <HeaderOverlay panelOpen={openPanel !== null} megaMenuOpen={megaOpen} onClose={closeEverything} />

      <MobileDrawer
        open={openPanel === "drawer"}
        onClose={closePanel}
        links={links}
        activeIndex={activeIndex}
        cta={nav?.cta}
        contact={global?.contact}
        socials={(global?.footer?.social || []).filter(Boolean)}
        logo={nav?.logo}
        logoAlt={nav?.logoAlt}
        locale={locale}
      />

      <SearchOverlay
        open={openPanel === "search"}
        onClose={closePanel}
        locale={locale}
        placeholder={global?.search?.placeholder}
        popular={presentLinks<{ label?: string | null }>(global?.search?.popular).map((item) => tField(item, "label", locale))}
      />

      <CartDrawer
        open={openPanel === "cart"}
        onClose={closePanel}
        cart={cart.cart}
        loaded={cart.loaded}
        count={cart.count}
        busy={cart.busy}
        onChangeQuantity={cart.changeQuantity}
      />
    </>
  );
}
