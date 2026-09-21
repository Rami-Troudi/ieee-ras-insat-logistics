import { useState, useEffect } from "react";

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(() => {
    if (typeof window === "undefined" || !window.matchMedia) {
      return false;
    }
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) {
      return;
    }
    const mediaQueryList = window.matchMedia(query);
    const listener = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    setMatches(mediaQueryList.matches);

    if (mediaQueryList.addEventListener) {
      mediaQueryList.addEventListener("change", listener);
      return () => mediaQueryList.removeEventListener("change", listener);
    } else {
      mediaQueryList.addListener(listener);
      return () => mediaQueryList.removeListener(listener);
    }
  }, [query]);

  return matches;
}

export function useIsDesktop(breakpoint = "(min-width: 1024px)"): boolean {
  return useMediaQuery(breakpoint);
}
