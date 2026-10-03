import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from "react";

export interface HeroSlide {
  image: string;
  imageAlt: string;
  focus: string;
  focusMobile: string;
  title: string;
  text: string;
  ctaLabel: string;
  ctaUrl: string;
  fields: {
    image?: string;
    title?: string;
    text?: string;
    cta?: string;
  };
}

interface Props {
  slides: HeroSlide[];
  autoplay: boolean;
}

const SWIPE_THRESHOLD_PX = 50;

function twoDigits(n: number): string {
  return String(n).padStart(2, "0");
}

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(query.matches);
    const onChange = () => setReduced(query.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);
  return reduced;
}

function usePageLoaded(): boolean {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    if (document.readyState === "complete") {
      setLoaded(true);
      return;
    }
    const onLoad = () => setLoaded(true);
    window.addEventListener("load", onLoad, { once: true });
    return () => window.removeEventListener("load", onLoad);
  }, []);
  return loaded;
}

export default function HeroCarouselReact({ slides, autoplay }: Props) {
  const [active, setActive] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [cycle, setCycle] = useState(0);
  const pointerStartX = useRef<number | null>(null);
  const reducedMotion = usePrefersReducedMotion();
  const pageLoaded = usePageLoaded();

  const total = slides.length;
  const autoplayOn = autoplay && total > 1 && !reducedMotion;
  const paused = hovered || focused;

  function goTo(index: number) {
    setActive((index + total) % total);
    setCycle((n) => n + 1);
  }

  function onPointerDown(event: PointerEvent) {
    pointerStartX.current = event.clientX;
  }

  function onPointerUp(event: PointerEvent) {
    if (pointerStartX.current === null) return;
    const deltaX = event.clientX - pointerStartX.current;
    pointerStartX.current = null;
    if (Math.abs(deltaX) > SWIPE_THRESHOLD_PX) goTo(active + (deltaX < 0 ? 1 : -1));
  }

  function onKeyDown(event: KeyboardEvent) {
    if (event.key === "ArrowRight") goTo(active + 1);
    if (event.key === "ArrowLeft") goTo(active - 1);
  }

  const progressStyle: CSSProperties = autoplayOn
    ? { animationPlayState: paused ? "paused" : "running" }
    : { transform: `scaleX(${(active + 1) / total})` };

  return (
    <section
      aria-roledescription="carrusel"
      aria-label="Destacados"
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerCancel={() => (pointerStartX.current = null)}
      onPointerEnter={(event) => event.pointerType === "mouse" && setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={(event) => !event.currentTarget.contains(event.relatedTarget as Node) && setFocused(false)}
      onKeyDown={onKeyDown}
      className="relative h-[600px] touch-pan-y select-none overflow-hidden bg-accent md:h-[min(78vh,720px)]"
    >
      {slides.map((slide, index) => {
        const isActive = index === active;
        const Title = index === 0 ? "h1" : "p";
        const showImage = Boolean(slide.image) && (index === 0 || isActive || pageLoaded);
        return (
          <div
            key={index}
            role="group"
            aria-roledescription="slide"
            aria-label={`${index + 1} de ${total}`}
            aria-hidden={!isActive}
            className={`absolute inset-0 transition-opacity duration-[1400ms] ease-out-soft ${
              isActive ? "opacity-100" : "pointer-events-none opacity-0"
            }`}
          >
            {showImage && (
              <img
                src={slide.image}
                alt={slide.imageAlt}
                fetchPriority={index === 0 ? "high" : "low"}
                decoding="async"
                draggable={false}
                data-tina-field={slide.fields.image}
                style={{ "--focus": slide.focus || "50% 50%", "--focus-mobile": slide.focusMobile || slide.focus || "50% 50%" } as CSSProperties}
                className={`absolute inset-0 h-full w-full object-cover transition-transform duration-[9000ms] ease-out-soft [object-position:var(--focus-mobile)] md:[object-position:var(--focus)] ${
                  isActive ? "scale-100" : "scale-[1.08]"
                }`}
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-b from-ink/5 from-25% to-ink/65 md:bg-gradient-to-r md:from-ink/50 md:from-0% md:via-ink/30 md:via-40% md:to-transparent md:to-65%" />
            <div className="container-xl absolute inset-0 flex flex-col items-start justify-end pb-[72px] md:justify-center md:pb-0">
              <div
                className={`flex flex-col items-start gap-5 text-content-inverse transition-[opacity,transform] delay-[350ms] duration-[1000ms,1200ms] [transition-timing-function:cubic-bezier(.22,.61,.36,1),cubic-bezier(.16,1,.3,1)] ${
                  isActive ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
                }`}
              >
                <Title
                  className="max-w-[720px] whitespace-pre-line text-heading-xxl lg:text-[length:calc(clamp(2.625rem,5.4vw,5rem)_-_6px)]"
                  data-tina-field={slide.fields.title}
                >
                  {slide.title}
                </Title>
                {slide.text && (
                  <p className="max-w-[540px] text-subtitle-sm" data-tina-field={slide.fields.text}>
                    {slide.text}
                  </p>
                )}
                {slide.ctaLabel && slide.ctaUrl && (
                  <a
                    href={slide.ctaUrl}
                    tabIndex={isActive ? undefined : -1}
                    className="btn-fill-light mt-2"
                    data-tina-field={slide.fields.cta}
                  >
                    {slide.ctaLabel}
                  </a>
                )}
              </div>
            </div>
          </div>
        );
      })}

      {total > 1 && (
        <div
          aria-hidden="true"
          className="absolute left-gutter top-8 z-[2] flex items-center gap-3.5 text-caption-sm font-medium tracking-[.18em] text-content-inverse"
        >
          <span>{twoDigits(active + 1)}</span>
          <div className="h-px w-[72px] overflow-hidden bg-content-inverse/35">
            <div
              key={`${active}-${cycle}`}
              onAnimationEnd={() => goTo(active + 1)}
              style={progressStyle}
              className={`h-full origin-left bg-content-inverse ${autoplayOn ? "animate-hero-progress" : ""}`}
            />
          </div>
          <span>{twoDigits(total)}</span>
        </div>
      )}
    </section>
  );
}
