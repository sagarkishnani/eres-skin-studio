import { useEffect } from "react";
import { useTina } from "tinacms/dist/react";
import { resolveDiscountBadgeStyle } from "../../utils/discountBadge";

interface Props {
  query: string;
  variables: object;
  data: any;
}

export default function DiscountBadgePreviewReact({ query, variables, data: initialData }: Props) {
  const { data } = useTina({ query, variables, data: initialData });
  const style = resolveDiscountBadgeStyle(data?.shop?.discountBadgeStyle);

  useEffect(() => {
    document.querySelectorAll<HTMLElement>("[data-discount-badge]").forEach((card) => {
      card.dataset.discountBadge = style;
    });
  }, [style]);

  return <div hidden />;
}
