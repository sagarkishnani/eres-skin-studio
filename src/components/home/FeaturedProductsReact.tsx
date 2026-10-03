import { useTina, tinaField } from "tinacms/dist/react";

interface Props {
  query: string;
  variables: object;
  data: any;
}

export default function FeaturedProductsReact({ query, variables, data: initialData }: Props) {
  const { data } = useTina({ query, variables, data: initialData });
  const products = data?.home?.products;
  if (!products) return <div hidden />;

  return (
    <div
      data-reveal="0"
      className="mb-[clamp(32px,4vw,56px)] flex flex-wrap items-end justify-between gap-x-10 gap-y-6"
    >
      <div className="flex flex-col gap-4">
        {products.eyebrow && (
          <span className="eyebrow" data-tina-field={tinaField(products, "eyebrow")}>
            {products.eyebrow}
          </span>
        )}
        <h2 className="max-w-[620px] text-heading-md" data-tina-field={tinaField(products, "title")}>
          {products.title}
        </h2>
      </div>
      {products.cta?.label && products.cta?.url && (
        <a href={products.cta.url} className="btn-fill-dark" data-tina-field={tinaField(products, "cta")}>
          {products.cta.label}
        </a>
      )}
    </div>
  );
}
