import { useId, useState, type ReactNode } from "react";
import { useTina, tinaField } from "tinacms/dist/react";
import { PiPlusLight } from "react-icons/pi";
import { tField, localizeHref } from "../../utils/i18n";
import { mediaUrl } from "../../utils/mediaUrl";
import type { Locale } from "../../i18n/config";
import { presentLinks, type SimpleLink } from "./navTypes";
import { presentSocials, socialLabel } from "./socialLinks";
import { phoneHref } from "./contactLinks";
import { formatShift, presentRows, rowShifts } from "../../utils/openingHours";

const TWNSTUDIOS_CREDIT_URL =
  "https://twnstudios.com/?utm_source=eresskin&utm_medium=referral&utm_campaign=client_portfolio";

const TWNSTUDIOS_LOGO = mediaUrl("/uploads/footer/twn-logo.svg");

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
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
}

const columnTitle = "text-caption-md font-medium uppercase tracking-[.18em] text-stone-400";

function FooterColumn({ title, titleField, open, onToggle, children }: FooterColumnProps) {
  const panelId = useId();

  return (
    <div className="flex flex-col max-md:border-t max-md:border-stone-800">
      <p className={`hidden pb-5 md:block ${columnTitle}`} data-tina-field={titleField}>
        {title}
      </p>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={panelId}
        className={`flex w-full items-center justify-between py-5 text-left md:hidden ${columnTitle}`}
      >
        <span data-tina-field={titleField}>{title}</span>
        <PiPlusLight
          size={18}
          aria-hidden
          className={`text-content-inverse transition-transform duration-[450ms] ease-out-expo ${open ? "rotate-45" : ""}`}
        />
      </button>
      <div
        id={panelId}
        className={`grid transition-[grid-template-rows,visibility] duration-[550ms] ease-out-expo md:visible md:grid-rows-[1fr] ${
          open ? "max-md:grid-rows-[1fr]" : "max-md:invisible max-md:grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <div className="flex flex-col gap-[14px] text-body-sm leading-[1.45] max-md:pb-6">{children}</div>
        </div>
      </div>
    </div>
  );
}

export default function FooterReact({ query, variables, data: initialData, locale, year }: Props) {
  const { data } = useTina({ query, variables, data: initialData });
  const footer = data?.global?.footer;
  const contact = data?.global?.contact;
  const columns = (footer?.columns || []).filter(Boolean);
  const hours = presentRows(contact?.hours).filter((row) => rowShifts(row).length > 0);
  const socials = presentSocials(footer?.social);
  const [openColumn, setOpenColumn] = useState<string | null>(null);
  const columnToggle = (key: string) => ({
    open: openColumn === key,
    onToggle: () => setOpenColumn((current) => (current === key ? null : key)),
  });

  return (
    <footer className="bg-ink pb-7 pt-[clamp(56px,7vw,88px)] text-content-inverse [html[data-buy-bar]_&]:pb-[calc(97px+env(safe-area-inset-bottom))] md:[html[data-buy-bar]_&]:pb-[calc(101px+env(safe-area-inset-bottom))]">
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
                className="max-w-[360px] text-body-md text-stone-300 [text-wrap:pretty]"
                data-tina-field={tinaField(footer, "tagline")}
              >
                {tField(footer, "tagline", locale)}
              </p>
            )}
          </div>

          {columns.map((column: any, index: number) => (
            <FooterColumn
              key={index}
              title={tField(column, "title", locale)}
              titleField={tinaField(column, "title")}
              {...columnToggle(`column-${index}`)}
            >
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
              {...columnToggle("contact")}
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
              {hours.map((row: any, index: number) => (
                <p key={index} className="flex flex-col text-body-sm leading-[1.55] text-stone-300">
                  <span data-tina-field={tinaField(row, "label")}>{tField(row, "label", locale)}:</span>
                  {rowShifts(row).map((shift) => (
                    <span key={formatShift(shift)} className="tabular-nums" data-tina-field={tinaField(row, "shifts")}>
                      {formatShift(shift)}
                    </span>
                  ))}
                </p>
              ))}
            </FooterColumn>
          )}
        </div>

        <div className="mt-[clamp(40px,5vw,64px)] flex flex-wrap items-center justify-between gap-x-8 gap-y-[18px] border-t border-stone-800 pt-6 text-caption-sm uppercase tracking-[.14em] text-stone-400">
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

          <p className="flex items-center gap-2.5">
            Diseño y desarrollo por
            <a
              href={TWNSTUDIOS_CREDIT_URL}
              target="_blank"
              rel="noopener"
              className="transition-opacity duration-300 hover:opacity-60"
            >
              <img src={TWNSTUDIOS_LOGO} alt="TWNSTUDIOS" width={86} height={11} className="block h-3 w-auto" />
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
