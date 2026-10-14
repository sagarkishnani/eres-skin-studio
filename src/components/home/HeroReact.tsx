import { useTina, tinaField } from "tinacms/dist/react";
import { mediaUrl } from "../../utils/mediaUrl";
import HeroCarouselReact, { type HeroSlide } from "./HeroCarouselReact";

const MAX_SCRIM = 40;
const MIN_SLIDE_SECONDS = 2;
const MAX_SLIDE_SECONDS = 15;
const DEFAULT_SLIDE_SECONDS = 4;

function clampScrim(value: unknown): number {
  const scrim = Number(value);
  return Number.isFinite(scrim) ? Math.min(Math.max(scrim, 0), MAX_SCRIM) : 0;
}

function resolveSlideSeconds(value: unknown): number {
  const seconds = Number(value);
  const inRange = Number.isFinite(seconds) && seconds >= MIN_SLIDE_SECONDS && seconds <= MAX_SLIDE_SECONDS;
  return inRange ? seconds : DEFAULT_SLIDE_SECONDS;
}

interface Props {
  query: string;
  variables: object;
  data: any;
}

export default function HeroReact({ query, variables, data: initialData }: Props) {
  const { data } = useTina({ query, variables, data: initialData });
  const hero = data?.home?.hero;

  const slides: HeroSlide[] = (hero?.slides || []).filter(Boolean).map((slide: any) => ({
    image: mediaUrl(slide.image),
    imageMobile: mediaUrl(slide.imageMobile),
    imageAlt: slide.imageAlt || "",
    focus: slide.focus || "",
    title: slide.title || "",
    text: slide.text || "",
    ctaLabel: slide.cta?.label || "",
    ctaUrl: slide.cta?.url || "",
    scrim: clampScrim(slide.scrim),
    fields: {
      image: tinaField(slide, "image"),
      title: tinaField(slide, "title"),
      text: tinaField(slide, "text"),
      cta: tinaField(slide, "cta"),
      scrim: tinaField(slide, "scrim"),
    },
  }));

  if (!slides.length) return <div hidden />;

  return (
    <HeroCarouselReact
      slides={slides}
      autoplay={hero?.autoplay !== false}
      slideSeconds={resolveSlideSeconds(hero?.slideSeconds)}
    />
  );
}
