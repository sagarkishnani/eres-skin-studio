import type { ReactNode } from "react";
import { useTina, tinaField } from "tinacms/dist/react";
import { TinaMarkdown, type Components } from "tinacms/dist/rich-text";
import LegalHeader from "./LegalHeader";

interface Props {
  query: string;
  variables: object;
  data: any;
}

type WithChildren = { children: ReactNode };

const textClass = "text-body-md leading-[1.75] text-content-muted [text-wrap:pretty]";

const sectionHeadingClass = [
  "mt-section-sm border-t border-line pt-8 text-heading-xs text-content [counter-increment:legal-section]",
  "before:mb-3 before:block before:text-caption-sm before:tracking-[.18em] before:text-content-subtle",
  "before:content-[counter(legal-section,decimal-leading-zero)]",
].join(" ");

const components: Components<{}> = {
  p: (props?: WithChildren) => <p className={textClass}>{props?.children}</p>,
  h2: (props?: WithChildren) => <h2 className={sectionHeadingClass}>{props?.children}</h2>,
  h3: (props?: WithChildren) => <h3 className="mt-2 text-body-lg font-medium text-content">{props?.children}</h3>,
  a: (props?: WithChildren & { url: string }) => (
    <a href={props?.url} className="text-accent underline decoration-1 underline-offset-4">
      {props?.children}
    </a>
  ),
  bold: (props?: WithChildren) => <strong className="font-medium text-content">{props?.children}</strong>,
  ul: (props?: WithChildren) => (
    <ul className={`${textClass} list-disc space-y-2 pl-5 marker:text-line-strong`}>{props?.children}</ul>
  ),
  ol: (props?: WithChildren) => (
    <ol className={`${textClass} list-decimal space-y-2 pl-5 marker:text-content-subtle`}>{props?.children}</ol>
  ),
  li: (props?: WithChildren) => <li className="pl-1">{props?.children}</li>,
  blockquote: (props?: WithChildren) => (
    <blockquote className="border-l-2 border-accent bg-surface-sunken px-5 py-4 text-body-sm text-content [&_p]:text-body-sm [&_p]:text-content">
      {props?.children}
    </blockquote>
  ),
};

export default function LegalPageReact({ query, variables, data: initialData }: Props) {
  const { data } = useTina({ query, variables, data: initialData });
  const page = data?.legal;

  return (
    <article className="bg-surface py-section">
      <div className="container-text">
        <LegalHeader content={page} />
        {page?.body && (
          <div className="flex flex-col gap-5 [counter-reset:legal-section]" data-tina-field={tinaField(page, "body")}>
            <TinaMarkdown content={page.body} components={components} />
          </div>
        )}
      </div>
    </article>
  );
}
