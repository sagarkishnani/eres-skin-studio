import { TinaMarkdown, type TinaMarkdownContent } from "tinacms/dist/rich-text";

const paragraphClass = "text-body-lg leading-[1.75] text-content-muted [text-wrap:pretty]";

const components = {
  p: ({ children }: { children: JSX.Element }) => <p className={paragraphClass}>{children}</p>,
  h2: ({ children }: { children: JSX.Element }) => (
    <h2 className="mb-[-6px] mt-[18px] text-[length:clamp(22px,2vw,28px)] leading-[1.2] tracking-[-.02em]">{children}</h2>
  ),
  h3: ({ children }: { children: JSX.Element }) => (
    <h3 className="mb-[-10px] mt-2.5 text-[length:clamp(19px,1.6vw,22px)] leading-[1.25] tracking-[-.015em]">{children}</h3>
  ),
  a: ({ url, children }: { url: string; children: JSX.Element }) => (
    <a href={url} className="text-accent underline decoration-1 underline-offset-4">
      {children}
    </a>
  ),
  bold: ({ children }: { children: JSX.Element }) => <strong className="font-medium text-content">{children}</strong>,
  ul: ({ children }: { children: JSX.Element }) => (
    <ul className={`${paragraphClass} list-disc space-y-2 pl-5 marker:text-line-strong`}>{children}</ul>
  ),
  ol: ({ children }: { children: JSX.Element }) => (
    <ol className={`${paragraphClass} list-decimal space-y-2 pl-5 marker:text-content-subtle`}>{children}</ol>
  ),
  li: ({ children }: { children: JSX.Element }) => <li className="pl-1">{children}</li>,
  blockquote: ({ children }: { children: JSX.Element }) => (
    <blockquote className="mb-2 mt-5 border-b border-t border-b-line border-t-ink py-7 text-[length:clamp(22px,2.2vw,30px)] font-light italic leading-[1.3] tracking-[-.015em] text-content [text-wrap:balance]">
      «{children}»
    </blockquote>
  ),
};

export default function PostBody({ content }: { content: TinaMarkdownContent | TinaMarkdownContent[] | null | undefined }) {
  if (!content) return <div hidden />;
  return (
    <div className="flex flex-col gap-[22px]">
      <TinaMarkdown content={content} components={components} />
    </div>
  );
}
