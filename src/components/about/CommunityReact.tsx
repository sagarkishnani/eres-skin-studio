import { useTina, tinaField } from "tinacms/dist/react";

interface Props {
  query: string;
  variables: object;
  data: any;
}

export default function CommunityReact({ query, variables, data: initialData }: Props) {
  const { data } = useTina({ query, variables, data: initialData });
  const community = data?.about?.community;
  if (!community) return <div hidden />;

  return (
    <section className="relative overflow-hidden bg-sage-700 py-[clamp(64px,9vw,120px)] text-content-inverse">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute bottom-[-40%] right-[-3%] select-none text-[length:clamp(300px,36vw,560px)] font-light italic leading-none text-content-inverse/[.07]"
      >
        e
      </span>
      <div className="container-xl relative grid grid-cols-[repeat(auto-fit,minmax(min(100%,420px),1fr))] items-center gap-x-20 gap-y-8">
        <div data-reveal="0" className="flex flex-col gap-5">
          {community.eyebrow && (
            <span className="eyebrow text-content-inverse" data-tina-field={tinaField(community, "eyebrow")}>
              {community.eyebrow}
            </span>
          )}
          <h2
            className="text-[length:clamp(38px,4.6vw,66px)] font-light italic leading-[1.04] tracking-[-.035em]"
            data-tina-field={tinaField(community, "title")}
          >
            {community.title}
          </h2>
        </div>
        {community.text && (
          <p
            data-reveal="120"
            className="max-w-[520px] text-body-md [text-wrap:pretty]"
            data-tina-field={tinaField(community, "text")}
          >
            {community.text}
          </p>
        )}
      </div>
    </section>
  );
}
