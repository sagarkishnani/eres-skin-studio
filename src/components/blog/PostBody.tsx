import type { ReactNode } from "react";
import { TinaMarkdown, type Components, type TinaMarkdownContent } from "tinacms/dist/rich-text";

type WithChildren = { children: ReactNode };

const paragraphClass = "text-body-lg leading-[1.75] text-content-muted [text-wrap:pretty]";

const components: Components<{}> = {
  p: (props?: WithChildren) => <p className={paragraphClass}>{props?.children}</p>,
  h2: (props?: WithChildren) => (
    <h2 className="mb-[-6px] mt-[18px] text-[length:clamp(22px,2vw,28px)] leading-[1.2] tracking-[-.02em]">{props?.children}</h2>
  ),
  h3: (props?: WithChildren) => (
    <h3 className="mb-[-10px] mt-2.5 text-[length:clamp(19px,1.6vw,22px)] leading-[1.25] tracking-[-.015em]">{props?.children}</h3>
  ),
  a: (props?: WithChildren & { url: string }) => (
    <a href={props?.url} className="text-accent underline decoration-1 underline-offset-4">
      {props?.children}
    </a>
  ),
  bold: (props?: WithChildren) => <strong className="font-medium text-content">{props?.children}</strong>,
  ul: (props?: WithChildren) => (
    <ul className={`${paragraphClass} list-disc space-y-2 pl-5 marker:text-line-strong`}>{props?.children}</ul>
  ),
  ol: (props?: WithChildren) => (
    <ol className={`${paragraphClass} list-decimal space-y-2 pl-5 marker:text-content-subtle`}>{props?.children}</ol>
  ),
  li: (props?: WithChildren) => <li className="pl-1">{props?.children}</li>,
  blockquote: (props?: WithChildren) => (
    <blockquote className="mb-2 mt-5 border-b border-t border-b-line border-t-ink py-7 text-[length:clamp(22px,2.2vw,30px)] font-light italic leading-[1.3] tracking-[-.015em] text-content [text-wrap:balance]">
      «{props?.children}»
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
