import { useTina, tinaField } from "tinacms/dist/react";

interface Props {
  query: string;
  variables: object;
  data: any;
  whatsappUrl: string;
}

function EmphasizedTitle({ text }: { text: string }) {
  return (
    <>
      {text.split(/(\*[^*]+\*)/g).map((segment, index) =>
        segment.startsWith("*") && segment.endsWith("*") ? (
          <em key={index} className="font-light italic">
            {segment.slice(1, -1)}
          </em>
        ) : (
          segment
        ),
      )}
    </>
  );
}

function PlayfairLetterE({ className }: { className: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 417 543" fill="currentColor" className={className}>
      <path d="M226 0Q314 0 364 54Q413 107 413 220L100 220Q99 233 98 248Q97 266 97 284Q97 352 119 401Q141 450 177 476Q212 501 250 501Q280 501 307 492Q334 482 357 460Q380 438 397 401L417 409Q406 442 381 473Q356 504 318 524Q280 543 230 543Q158 543 107 510Q55 477 28 419Q0 360 0 284Q0 196 28 133Q56 69 107 35Q158 0 226 0M99 201L317 201Q319 152 309 111Q299 69 278 44Q256 19 222 19Q176 19 141 65Q107 109 99 201" />
    </svg>
  );
}

export default function BookingReact({ query, variables, data: initialData, whatsappUrl }: Props) {
  const { data } = useTina({ query, variables, data: initialData });
  const booking = data?.home?.booking;
  if (!booking) return <div hidden />;

  return (
    <section className="relative overflow-hidden bg-sage-700 py-[clamp(72px,10vw,140px)] text-content-inverse">
      <PlayfairLetterE className="pointer-events-none absolute bottom-gutter right-gutter h-[clamp(260px,32vw,500px)] w-auto select-none text-content-inverse/[.12]" />
      <div className="container-xl relative grid grid-cols-[repeat(auto-fit,minmax(min(100%,420px),1fr))] items-center gap-x-20 gap-y-9">
        <div data-reveal="0" className="flex flex-col gap-[22px]">
          {booking.eyebrow && (
            <span className="eyebrow text-content-inverse" data-tina-field={tinaField(booking, "eyebrow")}>
              {booking.eyebrow}
            </span>
          )}
          <h2 className="whitespace-pre-line text-heading-xxl" data-tina-field={tinaField(booking, "title")}>
            <EmphasizedTitle text={booking.title || ""} />
          </h2>
        </div>
        <div data-reveal="120" className="flex flex-col items-start gap-8">
          {booking.text && (
            <p className="max-w-[500px] text-body-lg leading-[1.7]" data-tina-field={tinaField(booking, "text")}>
              {booking.text}
            </p>
          )}
          {whatsappUrl && booking.ctaLabel && (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-fill-light"
              data-tina-field={tinaField(booking, "ctaLabel")}
            >
              {booking.ctaLabel}
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
