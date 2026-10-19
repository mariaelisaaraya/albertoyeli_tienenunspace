import { useTranslationReady } from "../lib/useTranslationReady";
import { useMemo, useState } from "react";
import { withBase } from "../lib/url";
import { translate } from "../lib/i18n";

export interface EpisodeSummary {
  slug: string;
  number: number;
  title: string;
  titleIsProvisional: boolean;
  summary: string;
  date: string; // ISO
  dateIsApproximate: boolean;
  dateIsUnknown: boolean;
  topics: string[];
  guests: string[];
  durationMinutes?: number;
  audioStatus: "unavailable" | "pending_export" | "available";
  transcriptStatus: "pending" | "auto" | "reviewed" | "not_applicable";
}

const TONES = ["bg-sky-deep", "bg-sun-soft", "bg-mint-soft", "bg-coral-soft"];

interface Props {
  episodes: EpisodeSummary[];
}

function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

export default function EpisodesArchive({ episodes }: Props) {
  const languageRoot = useTranslationReady();
  const [query, setQuery] = useState("");
  const [topic, setTopic] = useState<string | null>(null);
  const [guest, setGuest] = useState<string | null>(null);

  const allTopics = useMemo(
    () => Array.from(new Set(episodes.flatMap((e) => e.topics))).sort(),
    [episodes],
  );
  const allGuests = useMemo(
    () => Array.from(new Set(episodes.flatMap((e) => e.guests))).sort(),
    [episodes],
  );

  const filtered = episodes.filter((ep) => {
    const matchesQuery =
      query.trim().length === 0 ||
      normalize([ep.title, ep.summary, translate(ep.title, "en"), translate(ep.summary, "en"), translate(ep.title, "pt"), translate(ep.summary, "pt")].join(" ")).includes(normalize(query));
    const matchesTopic = !topic || ep.topics.includes(topic);
    const matchesGuest = !guest || ep.guests.includes(guest);
    return matchesQuery && matchesTopic && matchesGuest;
  });

  return (
    <div ref={languageRoot}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <label className="flex-1">
          <span className="sr-only">Buscar episodios</span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por título o tema…"
            className="focus-ring w-full rounded-full border-2 border-ink bg-paper px-4 py-2.5 text-ink placeholder:text-ink-soft/60"
          />
        </label>

        {allTopics.length > 0 && (
          <select
            value={topic ?? ""}
            onChange={(e) => setTopic(e.target.value || null)}
            className="focus-ring rounded-full border-2 border-ink bg-paper px-4 py-2.5 text-ink"
            aria-label="Filtrar por tema"
          >
            <option value="">Todos los temas</option>
            {allTopics.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        )}

        {allGuests.length > 0 && (
          <select
            value={guest ?? ""}
            onChange={(e) => setGuest(e.target.value || null)}
            className="focus-ring rounded-full border-2 border-ink bg-paper px-4 py-2.5 text-ink"
            aria-label="Filtrar por invitado"
          >
            <option value="">Todos los invitados</option>
            {allGuests.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        )}
      </div>

      <p className="mt-4 text-sm text-ink-soft" aria-live="polite">
        {filtered.length} {filtered.length === 1 ? "episodio" : "episodios"}
      </p>

      {filtered.length === 0 ? (
        <div className="mt-8 rounded-doodle border-2 border-dashed border-ink/30 bg-paper/60 px-6 py-12 text-center">
          <p className="font-display text-lg font-bold text-ink">No encontramos episodios con esos filtros</p>
          <p className="mt-2 text-sm text-ink-soft">Probá con otra búsqueda o sacá algún filtro.</p>
        </div>
      ) : (
        <ul className="mt-6">
          {filtered.map((ep, index) => {
            const formattedDate = ep.dateIsUnknown
              ? "Fecha sin confirmar"
              : new Intl.DateTimeFormat("es-AR", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                  timeZone: "UTC", // fecha de calendario pura, no un instante — no convertir de zona
                }).format(new Date(ep.date));
            const tone = TONES[index % TONES.length];

            return (
              <li
                key={ep.slug}
                className="group flex flex-col gap-4 border-b-2 border-dashed border-ink/20 py-8 first:pt-0 last:border-none sm:flex-row sm:items-start"
              >
                <a
                  href={withBase(`/episodios/${ep.slug}/`)}
                  aria-hidden="true"
                  className={`font-display shrink-0 select-none text-[3.5rem] leading-none text-ink/15 transition group-hover:text-coral sm:text-[4.5rem] ${index % 2 === 0 ? "-rotate-1" : "rotate-1"}`}
                >
                  {String(ep.number).padStart(3, "0")}
                </a>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-label text-xs font-bold uppercase tracking-widest text-coral">
                      {!ep.dateIsUnknown && ep.dateIsApproximate ? "Fecha aprox. " : ""}
                      {formattedDate}
                    </p>
                    {ep.audioStatus !== "available" && ep.transcriptStatus !== "not_applicable" && (
                      <span className="rounded-full border border-ink/30 px-2 py-0.5 font-label text-[0.65rem] font-bold uppercase tracking-wide text-ink-soft">
                        {ep.audioStatus === "pending_export" ? "Audio en camino" : "Sin audio todavía"}
                      </span>
                    )}
                  </div>
                  <h3 className="mt-1 font-display text-2xl leading-tight text-ink sm:text-3xl">
                    <a href={withBase(`/episodios/${ep.slug}/`)} className="focus-ring rounded hover:text-coral">
                      {ep.title}
                    </a>
                  </h3>
                  <p className="mt-2 max-w-2xl text-ink-soft">{ep.summary}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {ep.topics.slice(0, 4).map((topic) => (
                      <span
                        key={topic}
                        className={`sticker border border-ink/30 px-2.5 py-1 font-label text-xs font-semibold text-ink-soft ${tone}`}
                      >
                        {topic}
                      </span>
                    ))}
                    {ep.durationMinutes && (
                      <span className="text-xs font-semibold text-ink-soft/70">{ep.durationMinutes} min</span>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
