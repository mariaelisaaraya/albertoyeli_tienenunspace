import { useMemo, useState } from "react";

export interface TranscriptSegment {
  speaker?: string;
  timestamp?: number;
  text: string;
}

interface Props {
  segments: TranscriptSegment[];
  status: "pending" | "auto" | "reviewed";
  hasAudio: boolean;
}

function formatTimestamp(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

function highlight(text: string, query: string) {
  if (!query.trim()) return text;
  const normalizedText = normalize(text);
  const normalizedQuery = normalize(query);
  const index = normalizedText.indexOf(normalizedQuery);
  if (index === -1) return text;
  return (
    <>
      {text.slice(0, index)}
      <mark className="rounded bg-sun px-0.5">{text.slice(index, index + query.length)}</mark>
      {text.slice(index + query.length)}
    </>
  );
}

export default function TranscriptViewer({ segments, status, hasAudio }: Props) {
  const [query, setQuery] = useState("");
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const filtered = useMemo(() => {
    if (!query.trim()) return segments.map((seg, i) => ({ seg, i }));
    return segments
      .map((seg, i) => ({ seg, i }))
      .filter(({ seg }) => normalize(seg.text).includes(normalize(query)));
  }, [segments, query]);

  async function copySegment(text: string, index: number) {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 1500);
    } catch {
      // Clipboard no disponible (ej. contexto no seguro); no hacemos nada.
    }
  }

  const statusLabel =
    status === "reviewed"
      ? "Transcripción revisada por el equipo"
      : status === "auto"
        ? "Transcripción generada automáticamente — puede tener errores"
        : "Transcripción pendiente";

  if (segments.length === 0) {
    return (
      <div className="rounded-doodle border-2 border-dashed border-ink/30 bg-paper/60 px-6 py-10 text-center">
        <p className="font-display text-lg font-bold text-ink">Transcripción pendiente</p>
        <p className="mt-2 text-sm text-ink-soft">
          Todavía no publicamos la transcripción de este episodio. Volvé pronto.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span
          className={`rounded-full border-2 border-ink px-3 py-1 text-xs font-bold ${
            status === "reviewed" ? "bg-mint" : status === "auto" ? "bg-sun" : "bg-sky-deep"
          }`}
        >
          {statusLabel}
        </span>
        <label className="flex-1 sm:max-w-xs">
          <span className="sr-only">Buscar en la transcripción</span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar en la transcripción…"
            className="focus-ring w-full rounded-full border-2 border-ink bg-paper px-4 py-2 text-sm text-ink placeholder:text-ink-soft/60"
          />
        </label>
      </div>

      <ol className="mt-6 space-y-5">
        {filtered.map(({ seg, i }) => (
          <li key={i} className="group flex gap-3 rounded-2xl p-2 hover:bg-sky-deep/40">
            <div className="w-20 shrink-0 pt-0.5 text-right">
              {seg.timestamp !== undefined && (
                hasAudio ? (
                  <a
                    href={`#t=${Math.floor(seg.timestamp)}`}
                    className="focus-ring rounded font-mono text-xs font-semibold text-ink-soft hover:text-coral"
                  >
                    {formatTimestamp(seg.timestamp)}
                  </a>
                ) : (
                  <span className="font-mono text-xs font-semibold text-ink-soft/70">
                    {formatTimestamp(seg.timestamp)}
                  </span>
                )
              )}
            </div>
            <div className="flex-1">
              {seg.speaker && (
                <p className="text-xs font-bold uppercase tracking-wide text-coral">{seg.speaker}</p>
              )}
              <p className="text-ink-soft">{highlight(seg.text, query)}</p>
            </div>
            <button
              type="button"
              onClick={() => copySegment(seg.text, i)}
              className="focus-ring h-fit shrink-0 rounded-full border border-ink/20 px-2 py-1 text-xs text-ink-soft opacity-0 transition hover:bg-paper group-hover:opacity-100"
            >
              {copiedIndex === i ? "Copiado" : "Copiar"}
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
}
