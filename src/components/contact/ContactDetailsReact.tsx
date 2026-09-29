import type { ReactNode } from "react";
import { useTina, tinaField } from "tinacms/dist/react";
import { mediaUrl } from "../../utils/mediaUrl";
import { phoneHref, type Contact } from "../shared/contactLinks";
import { formatShift, presentRows, rowShifts, type OpeningHoursRow } from "../../utils/openingHours";

export type StudioContact = Contact & { hours?: (OpeningHoursRow | null)[] | null };

interface Props {
  query: string;
  variables: object;
  data: any;
  studioContact: StudioContact;
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

function OpeningHours({ labels, rows }: { labels: any; rows: OpeningHoursRow[] }) {
  const schedule = rows.map((row) => ({ days: row.days || [], shifts: rowShifts(row) }));

  return (
    <>
      <span
        data-opening-status
        data-open-label={labels?.openNowLabel || ""}
        data-closed-label={labels?.closedNowLabel || ""}
        className="group/status hidden items-center data-[ready]:inline-flex gap-2.5 text-body-xs text-content"
      >
        <span
          aria-hidden="true"
          className="h-2 w-2 rounded-full bg-stone-400 ring-4 ring-stone-400/20 group-data-[open]/status:bg-sage-500 group-data-[open]/status:ring-sage-500/20"
        />
        <span data-opening-label />
      </span>
      <div data-opening-hours={JSON.stringify(schedule)} className="flex flex-col">
        {rows.map((row, index) => {
          const shifts = rowShifts(row);
          return (
            <div
              key={index}
              data-hours-row
              className="group/row flex justify-between gap-4 border-b border-stone-150 py-3 text-body-md"
            >
              <span className="flex items-center gap-2.5 text-content-subtle group-data-[today]/row:font-medium group-data-[today]/row:text-content">
                {row.label}
                {labels?.todayLabel && (
                  <span className="hidden bg-sage-100 px-[7px] py-1 text-[10px] font-semibold uppercase leading-none tracking-[.14em] text-sage-900 group-data-[today]/row:inline">
                    {labels.todayLabel}
                  </span>
                )}
              </span>
              <span className="flex flex-col items-end text-right tabular-nums text-content">
                {shifts.length > 0
                  ? shifts.map((shift) => <span key={formatShift(shift)}>{formatShift(shift)}</span>)
                  : labels?.closedLabel}
              </span>
            </div>
          );
        })}
      </div>
    </>
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
  const { support, studio, hours: hoursLabels } = details;
  const hoursRows = presentRows(studioContact.hours);

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

            {hoursRows.length > 0 && (
              <DetailBlock eyebrow={hoursLabels?.eyebrow} eyebrowField={hoursLabels && tinaField(hoursLabels, "eyebrow")} delay={160}>
                <OpeningHours labels={hoursLabels} rows={hoursRows} />
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
