import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const episodes = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/episodes" }),
  schema: ({ image }) =>
    z.object({
      number: z.number().int().positive(),
      title: z.string(),
      /** Fecha de emisión, YYYY-MM-DD, en el día del Space (horario Argentina). */
      date: z.coerce.date(),
      summary: z.string(),
      topics: z.array(z.string()).default([]),
      guests: z.array(z.string()).default([]),
      /** Enlace al Space original en X. */
      spaceUrl: z.string().url().optional(),
      /** Ruta relativa al sitio, ej: "/audio/ep01.mp3" (archivo en public/audio/). */
      audioUrl: z.string().optional(),
      durationMinutes: z.number().positive().optional(),
      cover: image().optional(),
      links: z
        .array(z.object({ label: z.string(), url: z.string().url() }))
        .default([]),
      highlights: z.array(z.string()).default([]),
      transcriptStatus: z.enum(["pending", "auto", "reviewed"]).default("pending"),
      /** Nombre de archivo (sin extensión) en src/content/transcripts/, si existe. */
      transcriptId: z.string().optional(),
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
