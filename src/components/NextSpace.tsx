import { useEffect, useState } from "react";

interface Props {
  /** Instante ISO (UTC) del próximo Space. */
  instantISO: string;
  spaceUrl?: string;
  displayTimezones: readonly { label: string; timeZone: string }[];
  googleCalendarUrl: string;
  icsUrl: string;
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

  return { days, hours, minutes, seconds, isPast: remaining <= 0 };
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

export default function NextSpace({
  instantISO,
  spaceUrl,
  displayTimezones,
  googleCalendarUrl,
  icsUrl,
}: Props) {
  const target = new Date(instantISO);
  const { days, hours, minutes, seconds, isPast } = useCountdown(target);
  const [visitorTimeZone, setVisitorTimeZone] = useState<string | null>(null);

  useEffect(() => {
    try {
      setVisitorTimeZone(Intl.DateTimeFormat().resolvedOptions().timeZone);
    } catch {
      setVisitorTimeZone(null);
    }
  }, []);

  const referenceTz = displayTimezones[0]?.timeZone ?? "America/Argentina/Buenos_Aires";

  return (
    <div className="rounded-doodle border-2 border-ink bg-paper p-6 shadow-doodle sm:p-8">
      <p className="font-display text-sm font-bold uppercase tracking-widest text-coral">
        Próximo Space
      </p>
      <p className="mt-2 font-display text-2xl font-extrabold capitalize text-ink sm:text-3xl">
        {formatWeekdayDate(target, referenceTz)}
      </p>

      <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-ink-soft">
        {displayTimezones.map((tz) => (
          <li key={tz.timeZone} className="font-medium">
            {formatTime(target, tz.timeZone)} · {tz.label}
          </li>
        ))}
        {visitorTimeZone && !displayTimezones.some((tz) => tz.timeZone === visitorTimeZone) && (
          <li className="font-medium text-ink/70">
            {formatTime(target)} · tu hora local
          </li>
        )}
      </ul>

      {!isPast && (
        <div
          className="mt-6 flex gap-3 font-display text-ink"
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
              className="flex min-w-[3.5rem] flex-col items-center rounded-2xl border-2 border-ink bg-sky-deep px-3 py-2"
            >
              <span className="text-2xl font-extrabold tabular-nums">{pad(unit.value)}</span>
              <span className="text-xs font-semibold uppercase text-ink-soft">{unit.label}</span>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 flex flex-wrap gap-3">
        <a
          href={googleCalendarUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="focus-ring rounded-full border-2 border-ink bg-mint px-5 py-2.5 font-display font-bold text-ink transition hover:-translate-y-0.5"
        >
          Agendar en Google
        </a>
        <a
          href={icsUrl}
          download
          className="focus-ring rounded-full border-2 border-ink bg-paper px-5 py-2.5 font-display font-bold text-ink transition hover:-translate-y-0.5"
        >
          Descargar .ics
        </a>
        {spaceUrl && (
          <a
            href={spaceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="focus-ring rounded-full border-2 border-ink bg-ink px-5 py-2.5 font-display font-bold text-paper transition hover:-translate-y-0.5"
          >
            Escuchar en X
          </a>
        )}
      </div>
    </div>
  );
}
