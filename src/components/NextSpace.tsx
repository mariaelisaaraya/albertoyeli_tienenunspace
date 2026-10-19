import { useTranslationReady } from "../lib/useTranslationReady";
import { useEffect, useState } from "react";

interface Props {
  /** Instante ISO (UTC) del próximo Space. */
  instantISO: string;
  durationMs: number;
  spaceUrl?: string;
  displayTimezones: readonly { label: string; timeZone: string }[];
  googleCalendarUrl: string;
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function useCountdown(target: Date) {
  const [remaining, setRemaining] = useState(() => target.getTime() - Date.now());

  useEffect(() => {
    const id = setInterval(() => {
      setRemaining(target.getTime() - Date.now());
    }, 1000);
    return () => clearInterval(id);
  }, [target]);

  const clamped = Math.max(0, remaining);
  const days = Math.floor(clamped / 86_400_000);
  const hours = Math.floor((clamped % 86_400_000) / 3_600_000);
  const minutes = Math.floor((clamped % 3_600_000) / 60_000);
  const seconds = Math.floor((clamped % 60_000) / 1000);

  return { days, hours, minutes, seconds, remaining, isPast: remaining <= 0 };
}

function formatWeekdayDate(date: Date, timeZone: string) {
  return new Intl.DateTimeFormat("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone,
  }).format(date);
}

function formatTime(date: Date, timeZone?: string) {
  return new Intl.DateTimeFormat("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone,
  }).format(date);
}

function EqBars({ n = 9 }: { n?: number }) {
  return (
    <div className="flex h-6 items-end gap-[3px]" aria-hidden="true">
      {Array.from({ length: n }).map((_, i) => (
        <span
          key={i}
          className="eq-bar w-[3px] rounded-full bg-mint"
          style={{ height: `${28 + ((i * 41) % 70)}%`, animationDelay: `${i * 0.08}s` }}
        />
      ))}
    </div>
  );
}

export default function NextSpace({
  instantISO,
  durationMs,
  spaceUrl,
  displayTimezones,
  googleCalendarUrl,
}: Props) {
  const languageRoot = useTranslationReady();
  const target = new Date(instantISO);
  const { days, hours, minutes, seconds, remaining, isPast } = useCountdown(target);
  const [visitorTimeZone, setVisitorTimeZone] = useState<string | null>(null);

  useEffect(() => {
    try {
      setVisitorTimeZone(Intl.DateTimeFormat().resolvedOptions().timeZone);
    } catch {
      setVisitorTimeZone(null);
    }
  }, []);

  const referenceTz = displayTimezones[0]?.timeZone ?? "America/Argentina/Buenos_Aires";
  // Solo mostramos "al aire" si hay un Space confirmado con link Y estamos
  // realmente dentro de su ventana horaria — nunca por defecto.
  const isLive = Boolean(spaceUrl) && !isPast && remaining > -durationMs && -remaining < durationMs && remaining <= 0;

  return (
    <div ref={languageRoot} className="sketch-border relative overflow-hidden border-[3px] border-ink bg-ink p-6 text-paper sm:p-8">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(135deg, var(--color-paper) 0px, var(--color-paper) 1px, transparent 1px, transparent 14px)",
        }}
        aria-hidden="true"
      />

      <div className="relative flex items-center justify-between gap-3">
        <p className="font-label text-xs font-bold uppercase tracking-[0.25em] text-mint">
          ◉ Próximo Space
        </p>
        {isLive ? (
          <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-coral bg-coral/20 px-2.5 py-1 font-label text-xs font-bold uppercase tracking-wide text-coral">
            <span className="h-2 w-2 animate-pulse rounded-full bg-coral" /> Al aire
          </span>
        ) : (
          <EqBars />
        )}
      </div>

      <p className="relative mt-3 font-display text-2xl capitalize leading-tight sm:text-3xl">
        {formatWeekdayDate(target, referenceTz)}
      </p>

      <ul className="relative mt-4 flex flex-wrap gap-x-6 gap-y-1 font-label text-paper/80">
        {displayTimezones.map((tz) => (
          <li key={tz.timeZone} className="font-medium">
            {formatTime(target, tz.timeZone)} · {tz.label}
          </li>
        ))}
        {visitorTimeZone && !displayTimezones.some((tz) => tz.timeZone === visitorTimeZone) && (
          <li className="font-medium text-paper/50">{formatTime(target)} · tu hora local</li>
        )}
      </ul>

      {!isPast && (
        <div
          className="relative mt-6 flex gap-2 sm:gap-3"
          role="timer"
          aria-label="Cuenta regresiva para el próximo Space"
        >
          {[
            { value: days, label: "días" },
            { value: hours, label: "hs" },
            { value: minutes, label: "min" },
            { value: seconds, label: "seg" },
          ].map((unit) => (
            <div
              key={unit.label}
              className="flex min-w-[3.5rem] flex-col items-center rounded-lg border-2 border-mint/40 bg-black/30 px-3 py-2"
            >
              <span className="font-label text-2xl font-bold tabular-nums text-mint">
                {pad(unit.value)}
              </span>
              <span className="font-label text-[0.65rem] font-semibold uppercase tracking-wide text-paper/50">
                {unit.label}
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="relative mt-6 flex flex-wrap gap-3">
        <a
          href={googleCalendarUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="focus-ring rounded-full border-2 border-mint bg-mint px-5 py-2.5 font-display text-xs text-ink transition hover:-translate-y-0.5"
        >
          Agendar en Google
        </a>
        {spaceUrl && (
          <a
            href={spaceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="focus-ring rounded-full border-2 border-coral bg-coral px-5 py-2.5 font-display text-xs text-ink transition hover:-translate-y-0.5"
          >
            Escuchar en X
          </a>
        )}
      </div>
    </div>
  );
}
