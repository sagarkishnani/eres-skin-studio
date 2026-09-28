import type { ReactNode } from "react";
import { useTina, tinaField } from "tinacms/dist/react";
import { tField, localizeHref } from "../../utils/i18n";
import { mediaUrl } from "../../utils/mediaUrl";
import type { Locale } from "../../i18n/config";
import { presentLinks, type SimpleLink } from "./navTypes";
import { presentSocials, socialLabel } from "./socialLinks";
import { phoneHref } from "./contactLinks";

const TWNSTUDIOS_CREDIT_URL =
  "https://twnstudios.com/?utm_source=eresskin&utm_medium=referral&utm_campaign=client_portfolio";

const underlinedLink =
  "self-start bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_1px] bg-right-bottom bg-no-repeat transition-[background-size] duration-500 ease-out-expo hover:bg-[length:100%_1px] hover:bg-left-bottom focus-visible:bg-[length:100%_1px] focus-visible:bg-left-bottom";

interface Props {
  query: string;
  variables: object;
  data: any;
  locale: Locale;
  year: number;
}

interface FooterColumnProps {
  title: string;
  titleField?: string;
  children: ReactNode;
}

function FooterColumn({ title, titleField, children }: FooterColumnProps) {
  return (
    <div className="flex flex-col">
      <p
        className="pb-5 text-caption-sm font-medium uppercase tracking-[.18em] text-stone-400"
        data-tina-field={titleField}
      >
        {title}
      </p>
      <div className="flex flex-col gap-[14px] text-body-xs leading-[1.45]">{children}</div>
    </div>
  );
}

export default function FooterReact({ query, variables, data: initialData, locale, year }: Props) {
  const { data } = useTina({ query, variables, data: initialData });
  const footer = data?.global?.footer;
  const contact = data?.global?.contact;
  const columns = (footer?.columns || []).filter(Boolean);
  const hours = (contact?.hours || []).filter((item: any) => item?.label || item?.text);
  const socials = presentSocials(footer?.social);

  return (
    <footer className="bg-ink pb-7 pt-[clamp(56px,7vw,88px)] text-content-inverse">
      <div className="container-xl">
        <div className="grid grid-cols-[minmax(0,1fr)] md:grid-cols-2 md:gap-12 lg:grid-cols-[minmax(0,1.6fr)_repeat(3,minmax(0,1fr))]">
          <div className="flex flex-col gap-6 pb-9 md:pb-0">
            {footer?.logo ? (
              <img
                src={mediaUrl(footer.logo)}
                alt={footer.logoAlt || "ERES Skin Studio"}
                className="h-12 w-auto self-start"
                data-tina-field={tinaField(footer, "logo")}
              />
            ) : (
              <p className="text-subtitle-sm font-medium">ERES Skin Studio</p>
            )}
            {footer?.tagline && (
              <p
                className="max-w-[340px] text-body-sm text-stone-300 [text-wrap:pretty]"
                data-tina-field={tinaField(footer, "tagline")}
              >
                {tField(footer, "tagline", locale)}
              </p>
            )}
          </div>

          {columns.map((column: any, index: number) => (
            <FooterColumn key={index} title={tField(column, "title", locale)} titleField={tinaField(column, "title")}>
              {presentLinks<SimpleLink>(column.links).map((link, linkIndex) => (
                <a
                  key={linkIndex}
                  href={localizeHref(link.url, locale)}
                  className={underlinedLink}
                  data-tina-field={tinaField(link as any, "label")}
                >
                  {tField(link, "label", locale)}
                </a>
              ))}
            </FooterColumn>
          ))}

          {contact && (
            <FooterColumn
              title={tField(footer, "contactTitle", locale) || "Contacto"}
              titleField={footer ? tinaField(footer, "contactTitle") : undefined}
            >
              {contact.address && <p data-tina-field={tinaField(contact, "address")}>{tField(contact, "address", locale)}</p>}
              {contact.phone && (
                <a href={phoneHref(contact)} className={underlinedLink} data-tina-field={tinaField(contact, "phone")}>
                  {contact.phone}
                </a>
              )}
              {contact.email && (
                <a href={`mailto:${contact.email}`} className={underlinedLink} data-tina-field={tinaField(contact, "email")}>
                  {contact.email}
                </a>
              )}
              {hours.map((item: any, index: number) => (
                <p key={index} className="whitespace-pre-line text-[14px] leading-[1.55] text-stone-300">
                  {item.label && <span data-tina-field={tinaField(item, "label")}>{tField(item, "label", locale)}:</span>}
                  {item.label && item.text && "\n"}
                  {item.text && <span data-tina-field={tinaField(item, "text")}>{tField(item, "text", locale)}</span>}
                </p>
              ))}
            </FooterColumn>
          )}
        </div>

        <div className="mt-[clamp(40px,5vw,64px)] flex flex-wrap items-center justify-between gap-x-8 gap-y-[18px] border-t border-stone-800 pt-6 text-caption-xs uppercase tracking-[.14em] text-stone-400">
          <p>
            © {year}
            {footer?.legal && (
              <>
                {" "}
                <span data-tina-field={tinaField(footer, "legal")}>{tField(footer, "legal", locale)}</span>
              </>
            )}
          </p>

          {socials.length > 0 && (
            <div className="flex flex-wrap gap-6" data-tina-field={tinaField(footer, "social")}>
              {socials.map((social) => (
                <a
                  key={social.network}
                  href={social.url!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`pb-0.5 text-content-inverse ${underlinedLink}`}
                >
                  {socialLabel(social.network!)}
                </a>
              ))}
            </div>
          )}

          <p>
            Diseño y desarrollo por{" "}
            <a
              href={TWNSTUDIOS_CREDIT_URL}
              target="_blank"
              rel="noopener"
              className={`pb-0.5 text-content-inverse ${underlinedLink}`}
            >
              TWNSTUDIOS
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
