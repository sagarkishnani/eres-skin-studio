import { useTina, tinaField } from "tinacms/dist/react";
import {
  FaLinkedinIn, FaInstagram, FaFacebookF, FaXTwitter, FaYoutube, FaTiktok, FaWhatsapp,
} from "react-icons/fa6";
import type { IconType } from "react-icons";
import { tField, localizeHref } from "../../utils/i18n";
import type { Locale } from "../../i18n/config";

const SOCIAL_ICONS: Record<string, IconType> = {
  linkedin: FaLinkedinIn,
  instagram: FaInstagram,
  facebook: FaFacebookF,
  x: FaXTwitter,
  youtube: FaYoutube,
  tiktok: FaTiktok,
  whatsapp: FaWhatsapp,
};

interface Props {
  query: string;
  variables: object;
  data: any;
  locale: Locale;
}

export default function FooterReact({ query, variables, data: initialData, locale }: Props) {
  const { data } = useTina({ query, variables, data: initialData });
  const footer = data?.global?.footer;
  const columns = (footer?.columns || []).filter(Boolean);
  const social = (footer?.social || []).filter((s: any) => s?.url && SOCIAL_ICONS[s.network]);

  return (
    <footer className="border-t border-line bg-surface-raised">
      <div className="container-xl py-14">
        <div className="grid gap-10 md:grid-cols-[1.5fr_repeat(auto-fit,minmax(140px,1fr))]">
          <div>
            <p className="font-heading text-subtitle-sm font-semibold">ERES Skin Studio</p>
            {footer?.tagline && (
              <p
                className="mt-3 max-w-sm text-body-sm text-content-muted"
                data-tina-field={tinaField(footer, "tagline")}
              >
                {tField(footer, "tagline", locale)}
              </p>
            )}
            {social.length > 0 && (
              <div className="mt-6 flex gap-3">
                {social.map((item: any, i: number) => {
                  const Icon = SOCIAL_ICONS[item.network];
                  return (
                    <a
                      key={i}
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={item.network}
                      className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-content-muted transition-colors hover:border-brand-primary hover:text-content"
                    >
                      <Icon size={15} />
                    </a>
                  );
                })}
              </div>
            )}
          </div>

          {columns.map((col: any, i: number) => (
            <div key={i}>
              <p className="text-body-sm font-semibold uppercase tracking-wide text-content-subtle">
                {tField(col, "title", locale)}
              </p>
              <ul className="mt-4 space-y-2">
                {(col.links || []).filter(Boolean).map((link: any, j: number) => (
                  <li key={j}>
                    <a
                      href={localizeHref(link.url, locale)}
                      className="text-body-sm text-content-muted transition-colors hover:text-content"
                    >
                      {tField(link, "label", locale)}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {footer?.legal && (
          <p className="mt-12 border-t border-line pt-6 text-caption-sm text-content-subtle">
            {tField(footer, "legal", locale)}
          </p>
        )}
      </div>
    </footer>
  );
}
