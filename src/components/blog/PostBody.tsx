import { TinaMarkdown } from "tinacms/dist/rich-text";

export default function PostBody({ content }: { content: any }) {
  // Never return null from an island: Astro logs a bogus "Invalid hook call".
  if (!content) return <div hidden />;
  return <TinaMarkdown content={content} />;
}
