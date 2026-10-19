import { fromZonedTime, toZonedTime, formatInTimeZone } from "date-fns-tz";
import { es } from "date-fns/locale";
import {
  WEEKLY_SCHEDULE,
  skippedWeeks,
  confirmedSpaces,
  type ConfirmedSpace,
} from "../data/schedule";

interface ZonedParts {
  year: number;
  month: number;
  day: number;
  weekday: number;
  hour: number;
  minute: number;
}

// IMPORTANTE: toZonedTime()/fromZonedTime() de date-fns-tz operan sobre los
// getters/constructor *locales* del Date (getFullYear, getHours, `new
// Date(y,m,d,h,min)`), NUNCA sobre los UTC (getUTCHours, Date.UTC(...)). Si se
// usan los UTC por error, el cálculo "funciona" por casualidad solo en una
// máquina cuya zona horaria del sistema coincida con la zona de referencia, y
// se rompe en cualquier otra (ej. un runner de GitHub Actions, que corre en
// UTC). Ver ejemplos en la documentación de la librería.

function getZonedParts(date: Date, timeZone: string): ZonedParts {
  const zoned = toZonedTime(date, timeZone);
  return {
    year: zoned.getFullYear(),
    month: zoned.getMonth(),
    day: zoned.getDate(),
    weekday: zoned.getDay(),
    hour: zoned.getHours(),
    minute: zoned.getMinutes(),
  };
}

function wallClockToInstant(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  timeZone: string,
): Date {
  const wallClock = new Date(year, month, day, hour, minute, 0);
  return fromZonedTime(wallClock, timeZone);
}

/** Lunes (00:00) de la semana calendario a la que pertenece una fecha, en UTC "ingenuo". */
function mondayOf(year: number, month: number, day: number): Date {
  const d = new Date(Date.UTC(year, month, day));
  const weekday = d.getUTCDay();
  const diffToMonday = (weekday + 6) % 7;
  d.setUTCDate(d.getUTCDate() - diffToMonday);
  return d;
}

function isSameWeek(a: Date, isoDateString: string): boolean {
  const [y, m, d] = isoDateString.split("-").map(Number);
  const otherMonday = mondayOf(y, m - 1, d);
  return a.getTime() === otherMonday.getTime();
}

function toISODate(date: Date): string {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(
    date.getUTCDate(),
  ).padStart(2, "0")}`;
}

export interface NextSpace {
  /** Instante UTC real del próximo Space. */
  instant: Date;
  /** Fecha (lunes de esa semana) usada para buscar excepciones/confirmaciones. */
  weekOf: Date;
  confirmed?: ConfirmedSpace;
}

/**
 * Calcula el próximo Space usando la zona horaria IANA de referencia
 * (America/Argentina/Buenos_Aires), respetando semanas salteadas y Spaces
 * puntuales confirmados con horario distinto.
 */
export function getNextSpace(now: Date = new Date()): NextSpace {
  const { weekday: targetWeekday, hour, minute, timezone } = WEEKLY_SCHEDULE;
  const nowParts = getZonedParts(now, timezone);

  let candidate = new Date(Date.UTC(nowParts.year, nowParts.month, nowParts.day));
  const daysUntilTarget = (targetWeekday - nowParts.weekday + 7) % 7;
  candidate.setUTCDate(candidate.getUTCDate() + daysUntilTarget);

  const confirmedFor = (monday: Date) =>
    confirmedSpaces.find((cs) => isSameWeek(monday, cs.date));

  const instantFor = (day: Date, h: number, min: number) =>
    wallClockToInstant(day.getUTCFullYear(), day.getUTCMonth(), day.getUTCDate(), h, min, timezone);

  let instant = instantFor(candidate, hour, minute);

  // Si hoy ya es el día del Space pero el horario pasó, ir a la próxima semana.
  if (instant.getTime() <= now.getTime()) {
    candidate.setUTCDate(candidate.getUTCDate() + 7);
    instant = instantFor(candidate, hour, minute);
  }

  // Saltear semanas configuradas como receso.
  while (skippedWeeks.some((s) => isSameWeek(mondayOf(candidate.getUTCFullYear(), candidate.getUTCMonth(), candidate.getUTCDate()), s))) {
    candidate.setUTCDate(candidate.getUTCDate() + 7);
    instant = instantFor(candidate, hour, minute);
  }

  const weekOf = mondayOf(candidate.getUTCFullYear(), candidate.getUTCMonth(), candidate.getUTCDate());
  const confirmed = confirmedFor(weekOf);

  if (confirmed?.overrideTime) {
    instant = instantFor(candidate, confirmed.overrideTime.hour, confirmed.overrideTime.minute);
  }

  return { instant, weekOf, confirmed };
}

export function formatInZone(date: Date, timeZone: string, pattern = "d 'de' MMMM, HH:mm"): string {
  return formatInTimeZone(date, timeZone, pattern, { locale: es });
}

export { toISODate };
