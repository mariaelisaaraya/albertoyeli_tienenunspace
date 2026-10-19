import type { APIRoute } from "astro";
import { getNextSpace } from "../../lib/time";
import { buildICS } from "../../lib/calendar";

export const prerender = true;

export const GET: APIRoute = () => {
  const ics = buildICS(getNextSpace());
  return new Response(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'attachment; filename="proximo-space.ics"',
    },
  });
};
