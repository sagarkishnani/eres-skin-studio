import { PiArrowRightLight } from "react-icons/pi";
import { groupHoverUnderline } from "./underline";

export interface JournalCardData {
  slug: string;
  href: string;
  title: string;
  excerpt: string;
  image: string;
  date: string;
  category: string;
  categorySlug: string;
  tagSlugs: string[];
}

interface Props {
  post: JournalCardData;
  revealDelay: number;
  shown: boolean;
}

export default function JournalCard({ post, revealDelay, shown }: Props) {
  const meta = [post.date, post.category].filter(Boolean).join(" · ");
  return (
    <a
      href={post.href}
      data-reveal={revealDelay}
      data-shown={shown ? "" : undefined}
      className="group flex min-w-0 flex-col gap-3 md:max-lg:![transition-delay:0ms]"
    >
      <div className="relative mb-2 aspect-[16/10] overflow-hidden bg-stone-100 md:aspect-[4/3]">
        {post.image && (
          <img
            src={post.image}
            alt=""
            loading="lazy"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1400ms] ease-out-expo motion-reduce:transition-none lg:group-hover:scale-105"
          />
        )}
      </div>
      {meta && <span className="text-caption-md text-content-subtle">{meta}</span>}
      <span className="text-[22px] leading-[1.2] tracking-[-.02em] text-content [text-wrap:balance] md:text-[length:clamp(22px,1.9vw,28px)]">
        <span className={`${groupHoverUnderline} duration-[600ms]`}>{post.title}</span>
      </span>
      {post.excerpt && <span className="line-clamp-2 text-body-sm text-content-muted">{post.excerpt}</span>}
      <span className="mt-1.5 inline-flex items-center gap-2 self-start border-b border-ink pb-1 text-body-sm font-medium text-content transition-[gap] duration-[450ms] ease-out-expo group-hover:gap-3.5 group-focus-visible:gap-3.5">
        Leer más <PiArrowRightLight size="1em" aria-hidden />
      </span>
    </a>
  );
}
