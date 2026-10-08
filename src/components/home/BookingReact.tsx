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
    <svg aria-hidden="true" viewBox="0 0 404 542" fill="currentColor" className={className}>
      <path d="M72 301Q128 282 174 264Q219 245 246 224Q282 195 303 154Q324 113 324 64Q324 35 320 27Q316 19 308 19Q283 19 254 41Q225 63 197 102Q169 140 146 189Q122 238 108 294Q94 349 94 404Q94 455 113 478Q132 500 163 500Q199 500 239 478Q279 456 317 400L333 408Q314 441 283 472Q252 503 214 523Q175 542 132 542Q92 542 62 526Q32 510 16 479Q0 447 0 401Q0 358 16 305Q32 251 62 198Q91 144 132 99Q173 54 223 27Q273 0 330 0Q361 0 383 17Q404 33 404 66Q404 106 381 141Q357 175 319 204Q280 232 235 254Q190 276 147 292Q104 308 71 318Z" />
    </svg>
  );
}

export default function BookingReact({ query, variables, data: initialData, whatsappUrl }: Props) {
  const { data } = useTina({ query, variables, data: initialData });
  const booking = data?.home?.booking;
  if (!booking) return <div hidden />;

  return (
    <section className="relative overflow-hidden bg-sage-700 py-[clamp(72px,10vw,140px)] text-content-inverse">
      <PlayfairLetterE className="pointer-events-none absolute bottom-gutter right-gutter h-[clamp(260px,32vw,500px)] w-auto select-none text-content-inverse/[.18]" />
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
