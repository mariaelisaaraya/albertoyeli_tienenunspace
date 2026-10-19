import { translate, type Language } from "./i18n";

const selector = document.querySelector<HTMLSelectElement>("#site-language");
if (selector) {
  const storageKey = "albertoyeli-language";
  let language: Language = "es";
  try {
    const saved = localStorage.getItem(storageKey);
    if (saved === "en" || saved === "pt") language = saved;
  } catch { /* Private browsing can disable storage. */ }
  const originalText = new WeakMap<Text, { source: string; output: string }>();
  const originalAttributes = new WeakMap<Element, Map<string, { source: string; output: string }>>();
  const excluded = 'script, style, code, textarea, [translate="no"], astro-island:not([data-i18n-ready])';

  function translateNode(node: Text) {
    if (node.parentElement?.closest(excluded)) return;
    const previous = originalText.get(node);
    const source = previous?.output === node.data ? previous.source : node.data;
    const output = translate(source, language);
    originalText.set(node, { source, output });
    if (node.data !== output) node.data = output;
  }

  function translateElement(element: Element) {
    if (element.closest(excluded)) return;
    for (const name of ["placeholder", "aria-label", "title", "alt"]) {
      const current = element.getAttribute(name);
      if (!current) continue;
      let attributes = originalAttributes.get(element);
      if (!attributes) { attributes = new Map(); originalAttributes.set(element, attributes); }
      const previous = attributes.get(name);
      const source = previous?.output === current ? previous.source : current;
      const output = translate(source, language);
      attributes.set(name, { source, output });
      if (current !== output) element.setAttribute(name, output);
    }
  }

  function translateTree(root: Node) {
    if (root instanceof Text) { translateNode(root); return; }
    if (root instanceof Element) {
      if (root.closest(excluded)) return;
      translateElement(root);
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT, {
        acceptNode(node) {
          return node instanceof Element && node.matches(excluded) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT;
        },
      });
      while (walker.nextNode()) {
        const node = walker.currentNode;
        if (node instanceof Text) translateNode(node);
        else if (node instanceof Element) translateElement(node);
      }
    }
  }

  function applyLanguage() {
    document.documentElement.lang = language;
    selector!.value = language;
    translateTree(document.head.querySelector("title")!);
    translateTree(document.body);
  }

  // React signals readiness from an effect, after its initial DOM commit.
  document.addEventListener("language:ready", (event) => {
    if (event.target instanceof Element) translateTree(event.target);
  });
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === "characterData") translateTree(mutation.target);
      else mutation.addedNodes.forEach(translateTree);
    }
  });
  observer.observe(document.body, { subtree: true, childList: true, characterData: true });
  selector.addEventListener("change", () => {
    language = selector.value as Language;
    try { localStorage.setItem(storageKey, language); } catch { /* Keep the current page usable. */ }
    applyLanguage();
  });
  applyLanguage();
}
