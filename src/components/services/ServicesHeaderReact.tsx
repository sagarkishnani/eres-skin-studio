import { useTina, tinaField } from "tinacms/dist/react";

interface Props {
  query: string;
  variables: object;
  data: any;
}

export default function ServicesHeaderReact({ query, variables, data: initialData }: Props) {
  const { data } = useTina({ query, variables, data: initialData });
  const header = data?.services?.header;
  if (!header) return <div hidden />;

  return (
    <section className="bg-surface-raised pb-[clamp(40px,6vw,80px)] pt-[clamp(28px,5vw,64px)]">
      <div className="container-xl grid grid-cols-[repeat(auto-fit,minmax(min(100%,420px),1fr))] items-end gap-x-20 gap-y-5">
        <div data-reveal="0" className="flex flex-col gap-5">
          <nav
            aria-label="Migas de pan"
            className="flex flex-wrap gap-2.5 text-caption-sm font-medium uppercase tracking-[.18em] text-content-muted"
          >
            <a
              href="/"
              className="bg-[length:0%_1px] bg-right-bottom bg-no-repeat transition-[background-size] duration-500 ease-out-expo [background-image:linear-gradient(currentColor,currentColor)] hover:bg-[length:100%_1px] hover:bg-left-bottom focus-visible:bg-[length:100%_1px] focus-visible:bg-left-bottom"
            >
              Home
            </a>
            <span aria-hidden="true">/</span>
            <span aria-current="page" className="text-content" data-tina-field={tinaField(header, "breadcrumb")}>
              {header.breadcrumb}
            </span>
          </nav>
          <h1 className="whitespace-pre-line text-heading-xl [text-wrap:balance]" data-tina-field={tinaField(header, "title")}>
            {header.title}
          </h1>
        </div>
        {header.text && (
          <p
            data-reveal="120"
            className="max-w-[460px] justify-self-end text-body-md text-content-muted [text-wrap:pretty]"
            data-tina-field={tinaField(header, "text")}
          >
            {header.text}
          </p>
        )}
      </div>
    </section>
  );
}
