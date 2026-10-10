import { useTina, tinaField } from "tinacms/dist/react";
import LegalHeader from "./LegalHeader";

interface Props {
  query: string;
  variables: object;
  data: any;
}

const PROVIDER_ROWS = [
  { field: "name", label: "Razón social" },
  { field: "ruc", label: "RUC" },
  { field: "address", label: "Domicilio" },
] as const;

export default function LegalClaimsReact({ query, variables, data: initialData }: Props) {
  const { data } = useTina({ query, variables, data: initialData });
  const content = data?.systemPages?.legalClaims;
  const provider = content?.provider;
  const providerRows = PROVIDER_ROWS.filter((row) => provider?.[row.field]);

  return (
    <>
      <LegalHeader content={content} />
      {providerRows.length > 0 && (
        <dl className="mt-8 grid gap-x-8 gap-y-3 border-l-2 border-accent bg-surface-sunken px-5 py-4 text-body-sm md:grid-cols-[auto_1fr]">
          {providerRows.map((row) => (
            <div key={row.field} className="contents">
              <dt className="text-content-subtle">{row.label}</dt>
              <dd className="text-content" data-tina-field={tinaField(provider, row.field)}>
                {provider[row.field]}
              </dd>
            </div>
          ))}
        </dl>
      )}
    </>
  );
}
