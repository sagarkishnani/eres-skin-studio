import { useEffect, useState } from "react";
import { tinaField } from "tinacms/dist/react";
import { localizeHref, tField } from "../../utils/i18n";
import type { Locale } from "../../i18n/config";
import { presentLinks, type SimpleLink } from "./navTypes";

const ROTATION_MS = 4500;

interface Props {
  announcement?: { enabled?: boolean | null; items?: (SimpleLink | null)[] | null } | null;
  locale: Locale;
}

function slideOffset(index: number, activeIndex: number): string {
  if (index === activeIndex) return "0";
  return index < activeIndex ? "-100%" : "100%";
}

export default function AnnouncementBar({ announcement, locale }: Props) {
  const items = presentLinks(announcement?.items);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (items.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = setInterval(() => setActiveIndex((i) => (i + 1) % items.length), ROTATION_MS);
    return () => clearInterval(timer);
  }, [items.length]);

  if (!announcement?.enabled || items.length === 0) return null;

  return (
    <div className="relative h-9 overflow-hidden bg-ink text-caption-md font-medium uppercase tracking-[.14em] text-content-inverse sm:tracking-[.22em]">
      {items.map((item, index) => {
        const isActive = index === activeIndex;
        const className =
          "absolute inset-0 flex items-center justify-center whitespace-nowrap px-gutter transition-[opacity,transform] duration-[800ms] ease-out-expo";
        const style = { opacity: isActive ? 1 : 0, transform: `translateY(${slideOffset(index, activeIndex)})` };
        const label = tField(item, "label", locale);

        return item.url ? (
          <a
            key={index}
            href={localizeHref(item.url, locale)}
            className={className}
            style={style}
            aria-hidden={!isActive}
            tabIndex={isActive ? 0 : -1}
            data-tina-field={tinaField(item as any, "label")}
          >
            {label}
          </a>
        ) : (
          <p
            key={index}
            className={className}
            style={style}
            aria-hidden={!isActive}
            data-tina-field={tinaField(item as any, "label")}
          >
            {label}
          </p>
        );
      })}
    </div>
  );
}
