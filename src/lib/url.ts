/**
 * Prefija una ruta interna con el `base` configurado en astro.config.mjs.
 * Usar para TODO link/asset interno con ruta absoluta ("/foo"), ya que Astro
 * no reescribe automáticamente strings hardcodeadas en el markup — solo los
 * paths que procesa él mismo (imports de imágenes, astro:assets, etc).
 */
export function withBase(path: string): string {
  const base = import.meta.env.BASE_URL ?? "/";
  const trimmedBase = base.endsWith("/") ? base.slice(0, -1) : base;
  const trimmedPath = path.startsWith("/") ? path : `/${path}`;
  const result = `${trimmedBase}${trimmedPath}`;
  return result || "/";
}
