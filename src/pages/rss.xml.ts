import rss from "@astrojs/rss";
import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { withBase } from "../lib/url";

export const prerender = true;

export const GET: APIRoute = async (context) => {
  const episodes = (await getCollection("episodes"))
    .filter((e) => !e.data.draft)
    .sort((a, b) => b.data.date.getTime() - a.data.date.getTime());

  return rss({
    title: "AlbertoYEli",
    description:
      "Conversaciones semanales en X Spaces sobre tecnología, curiosidad y lo que se nos ocurra.",
    site: context.site ?? "https://example.github.io",
    items: episodes.map((episode) => ({
      title: `Episodio ${episode.data.number}: ${episode.data.title}`,
      description: episode.data.summary,
      pubDate: episode.data.date,
      link: withBase(`/episodios/${episode.id}/`),
    })),
  });
};
