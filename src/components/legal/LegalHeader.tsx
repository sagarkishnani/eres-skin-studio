import { tinaField } from "tinacms/dist/react";
import { formatLongDate } from "../../utils/formatDate";

interface Props {
  content: any;
}

export default function LegalHeader({ content }: Props) {
  const updatedAt = formatLongDate(content?.updatedAt);

  return (
    <header className="flex flex-col items-start">
      {content?.eyebrow && (
        <p className="eyebrow" data-tina-field={tinaField(content, "eyebrow")}>
          — {content.eyebrow}
        </p>
      )}
      <h1
        data-reveal="0"
        className="mt-4 text-heading-xl [text-wrap:balance]"
        data-tina-field={tinaField(content, "title")}
      >
        {content?.title}
      </h1>
      {updatedAt && (
        <p className="mt-5 text-caption-md text-content-subtle" data-tina-field={tinaField(content, "updatedAt")}>
          Última actualización: <time dateTime={content.updatedAt}>{updatedAt}</time>
        </p>
      )}
      {content?.intro && (
        <p
          data-reveal="80"
          className="mt-8 text-subtitle-md text-content [text-wrap:pretty]"
          data-tina-field={tinaField(content, "intro")}
        >
          {content.intro}
        </p>
      )}
    </header>
  );
}
