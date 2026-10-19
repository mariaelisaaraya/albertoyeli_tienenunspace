/**
 * Configuración del Space semanal de AlbertoYEli.
 *
 * Para saltear una semana (receso, feriado, etc.) sin tocar el componente,
 * agregá la fecha (lunes de esa semana, cualquier formato ISO sirve) a
 * `skippedWeeks`. Para confirmar un Space puntual con datos reales
 * (enlace de X, horario especial), agregá una entrada a `confirmedOverrides`.
 */

export const SHOW_TIMEZONE = "America/Argentina/Buenos_Aires";

export const WEEKLY_SCHEDULE = {
  /** 0 = domingo … 5 = viernes */
  weekday: 5,
  hour: 13,
  minute: 0,
  timezone: SHOW_TIMEZONE,
} as const;

export const DISPLAY_TIMEZONES = [
  { label: "Argentina", timeZone: "America/Argentina/Buenos_Aires", time: "13:00" },
  { label: "Costa Rica", timeZone: "America/Costa_Rica", time: "10:00" },
] as const;

/**
 * Semanas en las que NO hay Space. Formato: "YYYY-MM-DD" (cualquier día de
 * esa semana calendario, de lunes a domingo).
 */
export const skippedWeeks: string[] = ["2026-10-16", "2026-10-23"];

/**
 * Un Space puntual ya confirmado, con enlace real. Si existe uno cuya fecha
 * es la próxima ocurrencia calculada, se muestra el botón "Escuchar en X".
 */
export interface ConfirmedSpace {
  title?: string;
  description?: string;
  /** Fecha ISO (YYYY-MM-DD) del viernes al que corresponde este Space. */
  date: string;
  /** URL del Space en X, una vez creado/confirmado. */
  spaceUrl?: string;
  /** Si este Space tiene un horario distinto al habitual. */
  overrideTime?: { hour: number; minute: number };
}

export const confirmedSpaces: ConfirmedSpace[] = [{
  date: "2026-10-30",
  title: "AlbertoYEli — ¿Juntos cara a cara?",
  description: "Nos reencontramos el 30 de octubre. ¿Juntos cara a cara? El formato presencial está por confirmar. Reservá la fecha.",
}];
