/// <reference types="astro/client" />

interface ImportMetaEnv {
  /** ID del formulario de Formspree usado en /participa (ej: "xyzabcde"). */
  readonly PUBLIC_FORMSPREE_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
