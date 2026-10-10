import { useEffect, useRef } from "react";

function readingProgress(article: HTMLElement): number {
  const { top, height } = article.getBoundingClientRect();
  const scrollable = Math.max(1, height - window.innerHeight);
  return Math.min(1, Math.max(0, -top / scrollable));
}

export default function PostProgressReact({ articleId }: { articleId: string }) {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const article = document.getElementById(articleId);
    const bar = barRef.current;
    if (!article || !bar) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      bar.style.transform = `scaleX(${readingProgress(article)})`;
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [articleId]);

  return (
    <div
      ref={barRef}
      aria-hidden="true"
      className="fixed inset-x-0 top-0 z-[60] h-0.5 origin-left scale-x-0 bg-sage-700"
    />
  );
}
