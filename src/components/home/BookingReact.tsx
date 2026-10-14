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

function LogoLetterE({ className }: { className: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 77 85" fill="currentColor" className={className}>
      <path d="M76.0622 43.542V67.812C72.6422 73.352 68.0822 77.092 62.3822 79.702C44.7922 88.012 21.1722 87.032 8.14223 67.652C-6.83777 45.172 1.14223 22.052 13.6822 11.132C33.5522 -6.12797 75.5722 -3.03797 75.4122 18.462C75.4122 24.322 73.2922 31.492 60.7522 31.492H24.2722C17.7522 31.492 12.3822 36.052 9.12222 43.872L9.28222 43.542C5.86222 51.202 3.91223 59.502 8.95223 67.162C21.9822 87.032 76.0522 64.722 76.0522 43.542H76.0622ZM16.6122 30.512H34.5322C54.8922 30.512 70.2022 7.22203 62.8722 3.64203C46.9122 -3.35797 27.8522 13.252 16.6122 30.512Z" />
    </svg>
  );
}

export default function BookingReact({ query, variables, data: initialData, whatsappUrl }: Props) {
  const { data } = useTina({ query, variables, data: initialData });
  const booking = data?.home?.booking;
  if (!booking) return <div hidden />;

  return (
    <section className="relative overflow-hidden bg-sage-700 py-[clamp(72px,10vw,140px)] text-content-inverse">
      <LogoLetterE className="pointer-events-none absolute bottom-gutter right-gutter h-[clamp(260px,32vw,500px)] w-auto select-none text-content-inverse/[.18]" />
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
