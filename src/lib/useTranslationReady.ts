import { useCallback, useEffect, useRef } from "react";

/** Let the language switcher update text only after React has committed hydration. */
export function useTranslationReady() {
  const root = useRef<HTMLElement | null>(null);
  useEffect(() => {
    const island = root.current?.closest("astro-island");
    if (island && !island.hasAttribute("data-i18n-ready")) {
      island.setAttribute("data-i18n-ready", "");
      island.dispatchEvent(new CustomEvent("language:ready", { bubbles: true }));
    }
  });
  return useCallback((node: HTMLElement | null) => { root.current = node; }, []);
}
