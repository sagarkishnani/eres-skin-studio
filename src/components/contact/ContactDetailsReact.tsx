import type { ReactNode } from "react";
import { useTina, tinaField } from "tinacms/dist/react";
import { mediaUrl } from "../../utils/mediaUrl";
import { phoneHref, type Contact } from "../shared/contactLinks";

interface Props {
  query: string;
  variables: object;
  data: any;
  studioContact: Contact;
}

const hoverUnderline =
  "bg-[length:0%_1px] bg-right-bottom bg-no-repeat transition-[background-size] duration-500 ease-out-expo [background-image:linear-gradient(currentColor,currentColor)] hover:bg-[length:100%_1px] hover:bg-left-bottom focus-visible:bg-[length:100%_1px] focus-visible:bg-left-bottom";

function DetailBlock({ eyebrow, eyebrowField, delay, children }: { eyebrow?: string; eyebrowField?: string; delay: number; children: ReactNode }) {
  return (
    <div data-reveal={delay} className="flex flex-col gap-[18px] border-t border-line-strong pb-9 pt-7">
      {eyebrow && (
        <span className="eyebrow text-sage-700" data-tina-field={eyebrowField}>
          {eyebrow}
        </span>
      )}
      {children}
    </div>
  );
}

function ContactItem({ label, labelField, href, children }: { label?: string; labelField?: string; href: string; children: ReactNode }) {
  const external = href.startsWith("https://");
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-caption-md text-content-subtle" data-tina-field={labelField}>
        {label}
      </span>
      <a
        href={href}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        className={`self-start text-subtitle-md [overflow-wrap:anywhere] ${hoverUnderline}`}
      >
        {children}
      </a>
    </div>
  );
}

export default function ContactDetailsReact({ query, variables, data: initialData, studioContact }: Props) {
  const { data } = useTina({ query, variables, data: initialData });
  const details = data?.contact?.details;
  if (!details) return <div hidden />;
  const { support, studio } = details;

  return (
    <section className="bg-surface-raised pb-[clamp(56px,7vw,96px)] pt-[clamp(24px,5vw,72px)]">
      <div className="container-xl">
        <div data-reveal="0" className="mb-[clamp(28px,4vw,48px)] flex flex-col gap-[18px]">
          <nav
            aria-label="Migas de pan"
            className="flex flex-wrap gap-2.5 text-caption-sm font-medium uppercase tracking-[.18em] text-content-muted"
          >
            <a href="/" className={hoverUnderline}>
              Home
            </a>
            <span aria-hidden="true">/</span>
            <span aria-current="page" className="text-content" data-tina-field={tinaField(details, "breadcrumb")}>
              {details.breadcrumb}
            </span>
          </nav>
          <h1 className="text-heading-xl [text-wrap:balance]" data-tina-field={tinaField(details, "title")}>
            {details.title}
          </h1>
        </div>

        <div className="grid grid-cols-1 items-start gap-x-[clamp(40px,6vw,96px)] gap-y-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
          <div className="flex flex-col border-b border-line-strong">
            {(studioContact.phone || studioContact.email) && (
              <DetailBlock eyebrow={support?.eyebrow} eyebrowField={support && tinaField(support, "eyebrow")} delay={0}>
                <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-5">
                  {studioContact.phone && (
                    <ContactItem label={support?.phoneLabel} labelField={support && tinaField(support, "phoneLabel")} href={phoneHref(studioContact)}>
                      {studioContact.phone}
                    </ContactItem>
                  )}
                  {studioContact.email && (
                    <ContactItem label={support?.emailLabel} labelField={support && tinaField(support, "emailLabel")} href={`mailto:${studioContact.email}`}>
                      {studioContact.email}
                    </ContactItem>
                  )}
                </div>
              </DetailBlock>
            )}

            {studioContact.address && (
              <DetailBlock eyebrow={studio?.eyebrow} eyebrowField={studio && tinaField(studio, "eyebrow")} delay={80}>
                <address className="text-subtitle-md not-italic leading-[1.5]">{studioContact.address}</address>
              </DetailBlock>
            )}
          </div>

          {details.image && (
            <div
              data-reveal="100"
              className="relative aspect-[4/3] overflow-hidden bg-stone-150 max-lg:order-first md:aspect-[4/5] lg:sticky lg:top-24"
            >
              <img
                src={mediaUrl(details.image)}
                alt={details.imageAlt || ""}
                decoding="async"
                className="absolute inset-0 h-full w-full object-cover"
                data-tina-field={tinaField(details, "image")}
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
