import { useEffect, useState } from "react";

export interface PageVisit {
  pathname: string;
  count: number;
}

function currentPathname(): string {
  return typeof window === "undefined" ? "" : window.location.pathname;
}

export function usePageVisit(): PageVisit {
  const [visit, setVisit] = useState<PageVisit>(() => ({ pathname: currentPathname(), count: 0 }));

  useEffect(() => {
    const onPageLoad = () => setVisit((previous) => ({ pathname: currentPathname(), count: previous.count + 1 }));
    document.addEventListener("astro:page-load", onPageLoad);
    return () => document.removeEventListener("astro:page-load", onPageLoad);
  }, []);

  return visit;
}
