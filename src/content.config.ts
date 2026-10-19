import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const episodes = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/episodes" }),
  schema: ({ image }) =>
    z.object({
      /** 0 reservado para ediciones especiales ("Episodio 000"). */
      number: z.number().int().nonnegative(),
      title: z.string(),
      /** true si el título todavía no está confirmado por los conductores (propuesta editorial). */
      titleIsProvisional: z.boolean().default(false),
      /** Fecha de emisión, YYYY-MM-DD, en el día del Space (horario Argentina). Si
       * dateIsUnknown es true, este valor es solo un placeholder interno para
       * poder ordenar la colección — nunca se muestra tal cual en la UI. */
      date: z.coerce.date(),
      /** true si la fecha es aproximada/informada y no una confirmación exacta. */
      dateIsApproximate: z.boolean().default(false),
      /** true si no hay ninguna fecha, ni siquiera aproximada. La UI debe
       * mostrar "fecha sin confirmar" en vez del valor de `date`. */
      dateIsUnknown: z.boolean().default(false),
      summary: z.string(),
      topics: z.array(z.string()).default([]),
      host: z.string().optional(),
      guests: z.array(z.string()).default([]),
      /** Enlace al Space original en X. */
      spaceUrl: z.string().url().optional(),
      /** Ruta relativa al sitio, ej: "/audio/ep01.mp3" (archivo en public/audio/). */
      audioUrl: z.string().optional(),
      /** Disponibilidad real del audio — nunca asumir "available" sin el archivo. */
      audioStatus: z.enum(["unavailable", "pending_export", "available"]).default("unavailable"),
      durationMinutes: z.number().positive().optional(),
      cover: image().optional(),
      links: z
        .array(z.object({ label: z.string(), url: z.string().url() }))
        .default([]),
      highlights: z.array(z.string()).default([]),
      transcriptStatus: z.enum(["pending", "auto", "reviewed", "not_applicable"]).default("pending"),
      /** Nombre de archivo (sin extensión) en src/content/transcripts/, si existe. */
      transcriptId: z.string().optional(),
      /** Qué se confirmó vs. qué fue solo informado por el equipo — ver README. */
      verificationNote: z.string().optional(),
      /** true = presentación editorial limpia (anécdota asumida tal cual),
       * sin badges de "título propuesto", caja de verificación ni aviso
       * largo de audio no disponible. Para casos donde el equipo ya adoptó
       * el título/contenido como definitivo pese a no tener audio propio. */
      minimalPresentation: z.boolean().default(false),
      draft: z.boolean().default(false),
    }),
});

const transcripts = defineCollection({
  loader: glob({ pattern: "**/*.json", base: "./src/content/transcripts" }),
  schema: z.object({
    segments: z.array(
      z.object({
        speaker: z.string().optional(),
        /** Segundos desde el inicio del audio, si hay audio propio reproducible. */
        timestamp: z.number().nonnegative().optional(),
        text: z.string(),
      }),
    ),
  }),
});

export const collections = { episodes, transcripts };
