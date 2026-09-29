import { useTina, tinaField } from "tinacms/dist/react";
import { PiCheckCircleLight } from "react-icons/pi";
import SystemPageShell, { actionsRowClass } from "./SystemPageShell";

interface Props {
  query: string;
  variables: object;
  data: any;
  whatsappUrl: string | null;
}

export default function ThankYouReact({ query, variables, data: initialData, whatsappUrl }: Props) {
  const { data } = useTina({ query, variables, data: initialData });
  const content = data?.systemPages?.thankYou;

  return (
    <SystemPageShell
      content={content}
      icon={<PiCheckCircleLight aria-hidden="true" className="mb-6 h-12 w-12 text-accent" />}
    >
      {content?.emailNote && (
        <p className="mt-3 text-body-sm text-content-subtle" data-tina-field={tinaField(content, "emailNote")}>
          {content.emailNote}
        </p>
      )}
      <div data-reveal="120" className={actionsRowClass}>
        <a
          href={content?.primaryCtaUrl || "/productos"}
          className="btn-primary"
          data-tina-field={tinaField(content, "primaryCtaLabel")}
        >
          {content?.primaryCtaLabel || "Seguir comprando"}
        </a>
        {whatsappUrl && (
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener"
            className="btn-secondary"
            data-tina-field={tinaField(content, "whatsappLabel")}
          >
            {content?.whatsappLabel || "Escríbenos por WhatsApp"}
          </a>
        )}
      </div>
    </SystemPageShell>
  );
}
