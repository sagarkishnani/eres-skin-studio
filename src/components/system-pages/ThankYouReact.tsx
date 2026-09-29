import { useTina, tinaField } from "tinacms/dist/react";
import { PiCheckCircleLight } from "react-icons/pi";
import SystemPageShell, { actionsRowClass } from "./SystemPageShell";
import { useOrderNumber } from "./useOrderNumber";
import { useForgetPurchasedCart } from "./useForgetPurchasedCart";

interface Props {
  query: string;
  variables: object;
  data: any;
  whatsappUrl: string | null;
}

const ORDER_PLACEHOLDER = "{numero}";

function OrderLine({ content, orderNumber }: { content: any; orderNumber: string }) {
  const label: string = content?.orderLabel || `Tu número de pedido es ${ORDER_PLACEHOLDER}`;
  const [before, after = ""] = label.includes(ORDER_PLACEHOLDER) ? label.split(ORDER_PLACEHOLDER) : [`${label} `];

  return (
    <p className="mt-6 text-body-md text-content" data-tina-field={tinaField(content, "orderLabel")}>
      {before}
      <strong className="font-medium">#{orderNumber}</strong>
      {after}
    </p>
  );
}

export default function ThankYouReact({ query, variables, data: initialData, whatsappUrl }: Props) {
  const { data } = useTina({ query, variables, data: initialData });
  const content = data?.systemPages?.thankYou;
  const orderNumber = useOrderNumber();
  useForgetPurchasedCart(orderNumber);

  return (
    <SystemPageShell
      content={content}
      icon={<PiCheckCircleLight aria-hidden="true" className="mb-6 h-12 w-12 text-accent" />}
    >
      {orderNumber && <OrderLine content={content} orderNumber={orderNumber} />}
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
