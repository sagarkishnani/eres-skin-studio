import { useTina, tinaField } from "tinacms/dist/react";

export interface JournalPost {
  title: string;
  href: string;
  image: string;
  date: string;
  tag: string;
  author: string;
}

interface Props {
  query: string;
  variables: object;
  data: any;
  featured: JournalPost;
  side: JournalPost[];
}

const SIDE_REVEAL_START_MS = 120;
const SIDE_REVEAL_STEP_MS = 110;

const underlined =
  "bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_1px] bg-right-bottom bg-no-repeat transition-[background-size] ease-out-expo lg:group-hover:bg-[length:100%_1px] lg:group-hover:bg-left-bottom";

const zoomingImage =
  "absolute inset-0 h-full w-full object-cover transition-transform duration-[1400ms] ease-out-expo lg:group-hover:scale-105";

function metaLine(post: JournalPost): string {
  return [post.date, post.tag].filter(Boolean).join(" · ");
}

function FeaturedPost({ post }: { post: JournalPost }) {
  return (
    <a
      href={post.href}
      data-reveal="0"
      className="group relative block min-h-[440px] overflow-hidden bg-accent text-content-inverse md:min-h-[560px]"
    >
      {post.image && <img src={post.image} alt="" loading="lazy" decoding="async" className={zoomingImage} />}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent from-35% to-ink/[.72]" />
      <div className="absolute inset-x-0 bottom-0 flex flex-col gap-3 p-[clamp(24px,3vw,44px)]">
        <span className="text-caption-xs font-medium uppercase tracking-[.16em]">{metaLine(post)}</span>
        <span className="max-w-[620px] text-balance text-[length:clamp(24px,2.6vw,38px)] leading-[1.12] tracking-[-.025em]">
          <span className={`${underlined} duration-700`}>{post.title}</span>
        </span>
        {post.author && <span className="text-caption-xs uppercase tracking-[.16em]">Por {post.author}</span>}
      </div>
    </a>
  );
}

function SidePost({ post, index }: { post: JournalPost; index: number }) {
  return (
    <a
      href={post.href}
      data-reveal={SIDE_REVEAL_START_MS + index * SIDE_REVEAL_STEP_MS}
      className="group grid min-h-[180px] grid-cols-[minmax(0,.9fr)_minmax(0,1fr)] bg-blush md:min-h-0"
    >
      <div className="relative overflow-hidden">
        {post.image && <img src={post.image} alt="" loading="lazy" decoding="async" className={zoomingImage} />}
      </div>
      <div className="flex flex-col justify-center gap-2.5 p-4 md:p-7">
        <span className="text-[10.5px] font-medium uppercase tracking-[.16em] text-clay-800">{metaLine(post)}</span>
        <span className="text-pretty text-[17px] leading-[1.2] tracking-[-.015em] text-content md:text-[length:clamp(18px,1.6vw,23px)]">
          <span className={`${underlined} duration-[600ms]`}>{post.title}</span>
        </span>
        {post.author && (
          <span className="text-[10.5px] uppercase tracking-[.14em] text-content-muted">Por {post.author}</span>
        )}
      </div>
    </a>
  );
}

export default function JournalReact({ query, variables, data: initialData, featured, side }: Props) {
  const { data } = useTina({ query, variables, data: initialData });
  const journal = data?.home?.journal;
  if (!journal) return <div hidden />;

  return (
    <section className="bg-surface-raised py-[clamp(64px,9vw,120px)]">
      <div className="container-xl">
        <div data-reveal="0" className="mb-[clamp(28px,4vw,56px)] flex items-end justify-between gap-6">
          <div className="flex flex-col gap-4">
            {journal.eyebrow && (
              <span className="eyebrow" data-tina-field={tinaField(journal, "eyebrow")}>
                {journal.eyebrow}
              </span>
            )}
            <h2 className="text-heading-md" data-tina-field={tinaField(journal, "title")}>
              {journal.title}
            </h2>
          </div>
          {journal.ctaUrl && (
            <a href={journal.ctaUrl} className="link-underline self-end whitespace-nowrap">
              <span className="md:hidden" data-tina-field={tinaField(journal, "ctaLabelMobile")}>
                {journal.ctaLabelMobile || journal.ctaLabel}
              </span>
              <span className="max-md:hidden" data-tina-field={tinaField(journal, "ctaLabel")}>
                {journal.ctaLabel}
              </span>
              <span aria-hidden="true">→</span>
            </a>
          )}
        </div>

        <div
          className={`grid grid-cols-1 gap-3 ${side.length ? "md:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]" : ""}`}
        >
          <FeaturedPost post={featured} />
          {side.length > 0 && (
            <div className={`grid gap-3 ${side.length > 1 ? "md:grid-rows-2" : ""}`}>
              {side.map((post, index) => (
                <SidePost key={post.href} post={post} index={index} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
