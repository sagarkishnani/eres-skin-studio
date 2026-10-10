import { useTina, tinaField } from "tinacms/dist/react";
import { hoverUnderline } from "../blog/underline";
import SystemPageShell, { actionsRowClass } from "./SystemPageShell";

interface Props {
  query: string;
  variables: object;
  data: any;
}

function QuickLinks({ content }: { content: any }) {
  const links = (content?.quickLinks || []).filter((link: any) => link?.label && link?.url);
  if (!links.length) return null;

  return (
    <nav aria-label={content.quickLinksTitle || "Enlaces rápidos"} className="mt-10 w-full border-t border-line pt-8">
      {content.quickLinksTitle && (
        <p
          className="text-caption-md uppercase tracking-[.14em] text-content-subtle"
          data-tina-field={tinaField(content, "quickLinksTitle")}
        >
          {content.quickLinksTitle}
        </p>
      )}
      <ul className="mt-4 flex flex-wrap justify-center gap-x-8 gap-y-3">
        {links.map((link: any, index: number) => (
          <li key={`${link.url}-${index}`}>
            <a href={link.url} className={`text-body-md text-content ${hoverUnderline}`} data-tina-field={tinaField(link)}>
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default function NotFoundReact({ query, variables, data: initialData }: Props) {
  const { data } = useTina({ query, variables, data: initialData });
  const content = data?.systemPages?.notFound;

  return (
    <SystemPageShell content={content}>
      <div data-reveal="120" className={actionsRowClass}>
        <a href={content?.primaryCtaUrl || "/"} className="btn-primary" data-tina-field={tinaField(content, "primaryCtaLabel")}>
          {content?.primaryCtaLabel || "Volver al inicio"}
        </a>
      </div>
      <QuickLinks content={content} />
    </SystemPageShell>
  );
}
