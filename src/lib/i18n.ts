import translations from "../i18n/translations.json";

export type Language = "es" | "en" | "pt";
const dictionary = translations as Record<string, { en: string; pt: string }>;
const extra: Record<string, [string, string]> = {
  "Idioma": ["Language", "Idioma"],
  "Principal": ["Main navigation", "Navegação principal"],
  "Abrir menú": ["Open menu", "Abrir menu"],
  "Pie de página": ["Footer", "Rodapé"],
  "Sin episodio": ["No episode", "Sem episódio"],
  "Buscar por título o tema…": ["Search by title or topic…", "Buscar por título ou tema…"],
  "Filtrar por tema": ["Filter by topic", "Filtrar por tema"],
  "Filtrar por invitado": ["Filter by guest", "Filtrar por convidado"],
  "No encontramos episodios con esos filtros": ["No episodes match those filters", "Nenhum episódio encontrado com esses filtros"],
  "Probá con otra búsqueda o sacá algún filtro.": ["Try another search or remove a filter.", "Tente outra busca ou remova um filtro."],
  "episodio": ["episode", "episódio"],
  "Episodio": ["Episode", "Episódio"],
  "Con": ["With", "Com"],
  "Copiar": ["Copy", "Copiar"],
  "Copiado": ["Copied", "Copiado"],
  "¡Copiado!": ["Copied!", "Copiado!"],
  "Enlace copiado": ["Link copied", "Link copiado"],
  "Buscar en la transcripción…": ["Search the transcript…", "Buscar na transcrição…"],
  "Cuenta regresiva para el próximo Space": ["Countdown to the next Space", "Contagem regressiva para o próximo Space"],
  "tu hora local": ["your local time", "seu horário local"],
  "Escuchar en X": ["Listen on X", "Ouvir no X"],
  "Al aire": ["Live", "Ao vivo"],
  "Fecha sin confirmar": ["Date to be confirmed", "Data a confirmar"],
  "fecha sin confirmar": ["date to be confirmed", "data a confirmar"],
  "Audio en camino": ["Audio coming soon", "Áudio em breve"],
  "Sin audio todavía": ["No audio yet", "Ainda sem áudio"],
  "Transcripción": ["Transcript", "Transcrição"],
  "Transcripción pendiente": ["Transcript pending", "Transcrição pendente"],
  "Transcripción revisada por el equipo": ["Transcript reviewed by the team", "Transcrição revisada pela equipe"],
  "Nombre": ["Name", "Nome"],
  "Usuario de X": ["X username", "Usuário do X"],
  "Email de contacto": ["Contact email", "Email de contato"],
  "País": ["Country", "País"],
  "Elegí un país": ["Choose a country", "Escolha um país"],
  "Otro": ["Other", "Outro"],
  "España": ["Spain", "Espanha"],
  "Estados Unidos": ["United States", "Estados Unidos"],
  "¿De qué te gustaría hablar?": ["What would you like to talk about?", "Sobre o que gostaria de falar?"],
  "Contanos brevemente sobre vos": ["Tell us a little about yourself", "Conte um pouco sobre você"],
  "¿Por qué te gustaría participar?": ["Why would you like to join?", "Por que gostaria de participar?"],
  "Enlace a tu proyecto, web o redes (opcional)": ["Project, website or social link (optional)", "Link do seu projeto, site ou redes sociais (opcional)"],
  "Doy mi consentimiento para que AlbertoYEli use estos datos exclusivamente para gestionar mi postulación a participar del podcast.": ["I consent to AlbertoYEli using this information solely to manage my application to join the podcast.", "Autorizo AlbertoYEli a usar estes dados exclusivamente para gerenciar minha inscrição para participar do podcast."],
  "Enviando…": ["Sending…", "Enviando…"],
  "Enviar postulación": ["Send application", "Enviar inscrição"],
  "¡Postulación enviada!": ["Application sent!", "Inscrição enviada!"],
};
const months = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];

/** Curated translations; unknown text and proper names retain their original wording. */
export function translate(text: string, language: Language): string {
  if (language === "es") return text;
  const key = text.trim().replace(/\s+/g, " ");
  if (!key) return text;
  const direct = dictionary[key]?.[language] ?? extra[key]?.[language === "en" ? 0 : 1];
  let value = direct;
  if (!value && key.endsWith(" · AlbertoYEli")) {
    value = translate(key.slice(0, -14), language) + " · AlbertoYEli";
  }
  if (!value && /^Episodio\s+/.test(key)) value = key.replace(/^Episodio/, language === "en" ? "Episode" : "Episódio");
  if (!value && /^(?:· )?Con\s+/.test(key)) value = key.replace(/Con\b/, language === "en" ? "With" : "Com");
  if (!value) {
    const date = /^(?:(lunes|martes|miércoles|jueves|viernes|sábado|domingo), )?(\d{1,2}) de ([a-z]+)(?: de (\d{4}))?$/.exec(key);
    if (date && months.includes(date[3])) {
      value = new Intl.DateTimeFormat(language === "en" ? "en-US" : "pt-BR", {
        ...(date[1] ? { weekday: "long" as const } : {}),
        day: "numeric", month: "long", ...(date[4] ? { year: "numeric" as const } : {}), timeZone: "UTC",
      }).format(new Date(Date.UTC(Number(date[4] ?? 2026), months.indexOf(date[3]), Number(date[2]))));
    }
  }
  if (!value) {
    const timestamp = /^Ir al minuto (.+) del audio$/.exec(key);
    if (timestamp) value = language === "en" ? `Go to ${timestamp[1]} in the audio` : `Ir para ${timestamp[1]} do áudio`;
  }
  return value ? text.replace(/\S(?:[\s\S]*\S)?/, value) : text;
}
