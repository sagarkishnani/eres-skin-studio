import { useTina, tinaField } from "tinacms/dist/react";
import { mediaUrl } from "../../utils/mediaUrl";
import HeroCarouselReact, { type HeroSlide } from "./HeroCarouselReact";

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
    imageAlt: slide.imageAlt || "",
    focus: slide.focus || "",
    focusMobile: slide.focusMobile || "",
    title: slide.title || "",
    text: slide.text || "",
    ctaLabel: slide.cta?.label || "",
    ctaUrl: slide.cta?.url || "",
    fields: {
      image: tinaField(slide, "image"),
      title: tinaField(slide, "title"),
      text: tinaField(slide, "text"),
      cta: tinaField(slide, "cta"),
    },
  }));

  if (!slides.length) return <div hidden />;

  return <HeroCarouselReact slides={slides} autoplay={hero?.autoplay !== false} />;
}
