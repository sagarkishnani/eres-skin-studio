import JournalCard, { type JournalCardData } from "./JournalCard";

interface Props {
  posts: JournalCardData[];
  featuredSlug: string;
  emptyText: string;
}

const REVEAL_STEP_MS = 90;
const COLUMNS = 3;

export default function JournalListReact({ posts, featuredSlug, emptyText }: Props) {
  const visible = posts.filter((post) => post.slug !== featuredSlug);

  return (
    <div>
      {visible.length > 0 ? (
        <div className="mt-[clamp(32px,4vw,56px)] grid gap-11 md:grid-cols-2 md:gap-x-8 md:gap-y-14 lg:grid-cols-3">
          {visible.map((post, index) => (
            <JournalCard key={post.slug} post={post} revealDelay={(index % COLUMNS) * REVEAL_STEP_MS} shown={false} />
          ))}
        </div>
      ) : (
        <p className="py-12 text-center text-body-md text-content-muted">{emptyText}</p>
      )}
    </div>
  );
}
