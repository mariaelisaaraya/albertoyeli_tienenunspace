import { useMemo, useState } from "react";
import { withBase } from "../lib/url";

export interface EpisodeSummary {
  slug: string;
  number: number;
  title: string;
  summary: string;
  date: string; // ISO
  topics: string[];
  guests: string[];
  durationMinutes?: number;
}

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
      normalize(`${ep.title} ${ep.summary}`).includes(normalize(query));
    const matchesTopic = !topic || ep.topics.includes(topic);
    const matchesGuest = !guest || ep.guests.includes(guest);
    return matchesQuery && matchesTopic && matchesGuest;
  });

  return (
    <div>
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
        <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((ep) => (
            <li key={ep.slug}>
              <a
                href={withBase(`/episodios/${ep.slug}/`)}
                className="focus-ring block h-full rounded-doodle border-2 border-ink bg-paper p-5 shadow-doodle-sm transition hover:-translate-y-1 hover:shadow-doodle"
              >
                <p className="font-display text-xs font-bold uppercase tracking-widest text-coral">
                  Episodio {ep.number}
                </p>
                <h3 className="mt-1 font-display text-lg font-bold text-ink">{ep.title}</h3>
                <p className="mt-2 line-clamp-3 text-sm text-ink-soft">{ep.summary}</p>
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
