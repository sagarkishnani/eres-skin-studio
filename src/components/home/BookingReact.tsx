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

export default function BookingReact({ query, variables, data: initialData, whatsappUrl }: Props) {
  const { data } = useTina({ query, variables, data: initialData });
  const booking = data?.home?.booking;
  if (!booking) return <div hidden />;

  return (
    <section className="relative overflow-hidden bg-sage-700 py-[clamp(72px,10vw,140px)] text-content-inverse">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute bottom-[-40%] right-[-3%] select-none text-[length:clamp(300px,36vw,560px)] font-light italic leading-none text-content-inverse/[.07]"
      >
        e
      </span>
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
              {booking.ctaLabel} <span aria-hidden="true">→</span>
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
