import type { NextSpace } from "./time";

const DEFAULT_DURATION_MS = 60 * 60 * 1000; // 1 hora

function toUtcBasic(date: Date): string {
  return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
}

/**
 * Genera un link de Google Calendar para la ocurrencia puntual del próximo
 * Space (no una serie recurrente), para evitar que alguien agende un
 * evento distinto al realmente anunciado.
 */
export function buildGoogleCalendarUrl(next: NextSpace): string {
  const start = next.instant;
  const end = new Date(start.getTime() + DEFAULT_DURATION_MS);

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: "AlbertoYEli — X Space",
    dates: `${toUtcBasic(start)}/${toUtcBasic(end)}`,
    details:
      (next.confirmed?.spaceUrl ? `Space: ${next.confirmed.spaceUrl}\n\n` : "") +
      "Conversación semanal de AlbertoYEli en X Spaces.",
    location: next.confirmed?.spaceUrl ?? "https://x.com/i/spaces",
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function buildICS(next: NextSpace): string {
  const start = next.instant;
  const end = new Date(start.getTime() + DEFAULT_DURATION_MS);
  const now = toUtcBasic(new Date());
  const uid = `${toUtcBasic(start)}-albertoyeli@albertoyeli.github.io`;

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//AlbertoYEli//Proximo Space//ES",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${now}`,
    `DTSTART:${toUtcBasic(start)}`,
    `DTEND:${toUtcBasic(end)}`,
    "SUMMARY:AlbertoYEli — X Space",
    `DESCRIPTION:Conversación semanal de AlbertoYEli en X Spaces.${
      next.confirmed?.spaceUrl ? "\\n\\nSpace: " + next.confirmed.spaceUrl : ""
    }`,
    `LOCATION:${next.confirmed?.spaceUrl ?? "https://x.com/i/spaces"}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ];

  return lines.join("\r\n");
}
