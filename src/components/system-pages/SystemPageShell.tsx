import type { ReactNode } from "react";
import { tinaField } from "tinacms/dist/react";

interface Props {
  content: any;
  icon?: ReactNode;
  children?: ReactNode;
}

export const actionsRowClass =
  "mt-8 flex w-full flex-col gap-3 md:w-auto md:flex-row md:flex-wrap md:justify-center";

export default function SystemPageShell({ content, icon, children }: Props) {
  return (
    <section className="flex min-h-[70vh] items-center bg-surface py-section">
      <div className="container-text flex flex-col items-center text-center">
        {icon}
        {content?.eyebrow && (
          <p
            className="text-caption-sm font-medium uppercase tracking-[.2em] text-content-muted"
            data-tina-field={tinaField(content, "eyebrow")}
          >
            — {content.eyebrow}
          </p>
        )}
        <h1
          data-reveal="0"
          className="mt-4 text-heading-xl leading-[1.05] [text-wrap:balance]"
          data-tina-field={tinaField(content, "title")}
        >
          {content?.title}
        </h1>
        {content?.intro && (
          <p
            data-reveal="80"
            className="mx-auto mt-4 max-w-[520px] text-subtitle-sm leading-[1.65] text-content-muted [text-wrap:pretty]"
            data-tina-field={tinaField(content, "intro")}
          >
            {content.intro}
          </p>
        )}
        {children}
      </div>
    </section>
  );
}
