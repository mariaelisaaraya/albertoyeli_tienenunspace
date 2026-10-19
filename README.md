# AlbertoYEli

Sitio del podcast **AlbertoYEli**: conversaciones semanales en X Spaces, todos
los viernes (13:00 Argentina / 10:00 Costa Rica), conducidas por
[Eli](https://x.com/ar3lisa) y [Alberto](https://x.com/TechRebelWorld).

Sitio estático (Astro + Tailwind + React islands), pensado para publicarse
gratis en GitHub Pages.

## Stack

- [Astro](https://astro.build) (output estático) + TypeScript estricto
- [Tailwind CSS v4](https://tailwindcss.com)
- Islas de React solo donde hace falta interactividad (countdown, buscador de
  episodios, formulario, visor de transcripción)
- Colecciones de contenido (`astro:content`) en Markdown/JSON — **agregar un
  episodio no requiere tocar componentes**
- GitHub Actions para build + deploy a GitHub Pages

## Desarrollo local

```bash
npm install
npm run dev       # http://localhost:4321
npm run build     # build de producción en dist/
npm run preview   # sirve el build de dist/
npm run check     # chequeo de tipos de Astro/TS
```

## Deploy en GitHub Pages

1. Creá el repo en GitHub (ej. `albertoyeli`) y pusheá este proyecto.
2. En **Settings → Pages**, elegí "GitHub Actions" como fuente.
3. Editá `astro.config.mjs` con tus valores reales:

   ```js
   // Repo de proyecto: https://<usuario>.github.io/<repo>/
   const site = "https://TU-USUARIO.github.io";
   const base = "/albertoyeli";

   // Dominio propio o Pages de usuario/org (https://tu-dominio/):
   // const site = "https://tu-dominio.com";
   // const base = "/";
   ```

   Todos los links y assets internos del sitio pasan por el helper
   `src/lib/url.ts#withBase`, así que una vez actualizado `base` ahí, el resto
   del sitio se ajusta solo. Si agregás una página o componente nuevo con un
   link interno (`href="/algo"`), envolvelo con `withBase("/algo")` — Astro no
   reescribe strings hardcodeadas en el markup.

4. Pusheá a `main`: el workflow `.github/workflows/deploy.yml` buildea y
   publica automáticamente. También corre una vez por día (cron) para que la
   cuenta regresiva del próximo Space y el `.ics` no queden desactualizados
   (son estáticos, calculados en build time).

## Contenido pendiente de revisión

Antes de considerar esto publicable de verdad:

- **Episodios reales**: el archivo (`src/content/episodes/`) está vacío a
  propósito — no inventé los ~4 episodios ya grabados porque no pude
  verificar sus títulos/fechas/contenido de forma confiable. Usá
  `npm run new-episode` (ver abajo) para cargarlos con los datos reales.
- **Imagen "Edo y Fran"**: el brief menciona una segunda imagen de referencia
  de diseño que todavía no se compartió.
- **Formspree**: el formulario de `/participa` funciona, pero necesita que
  crees una cuenta gratuita en [formspree.io](https://formspree.io) (no lo
  hice por vos: es una cuenta de terceros) y configures el ID — ver abajo.

## Agregar un episodio

### Opción A — asistida (recomendada)

```bash
npm run new-episode
```

Te va a preguntar número, título, fecha, resumen, temas, invitados, URL del
Space y (opcional) un archivo de audio propio y autorizado. Si das un audio,
te ofrece transcribirlo con faster-whisper. Genera
`src/content/episodes/<slug>.md` con `draft: true` — revisá el contenido
(cuerpo Markdown, transcripción, enlaces) y pasalo a `draft: false` cuando
esté listo para publicarse.

### Opción B — manual

Creá `src/content/episodes/mi-episodio.md`:

```yaml
---
number: 5
title: "Título del episodio"
date: 2026-02-13
summary: "Resumen editorial breve."
topics: ["IA", "Web3"]
guests: ["Nombre del invitado"]
spaceUrl: "https://x.com/i/spaces/XXXXX"
audioUrl: "/audio/episodio-5.mp3" # opcional, archivo en public/audio/
durationMinutes: 48
links:
  - label: "Algo que mencionaron"
    url: "https://..."
highlights:
  - "Una idea destacada."
transcriptStatus: "pending" # pending | auto | reviewed
transcriptId: "episodio-5" # opcional, ver abajo
draft: false
---

Cuerpo del episodio en Markdown (resumen más largo, contexto, etc).
```

Si hay transcripción, creá `src/content/transcripts/episodio-5.json`:

```json
{
  "segments": [
    { "speaker": "Eli", "timestamp": 0, "text": "Bienvenidos..." },
    { "speaker": "Alberto", "timestamp": 14.2, "text": "..." }
  ]
}
```

El esquema completo de ambas colecciones está en `src/content.config.ts`.

## Automatización de X Spaces: qué es viable y qué no

Investigamos la API de X antes de prometer nada:

- **Existe** un endpoint oficial de lookup de Spaces (`GET /2/spaces/...`)
  que da metadata (título, host, estado) **mientras el Space está en vivo o
  programado**.
- **No existe** una forma oficial, documentada y estable de obtener la
  grabación de audio ni una transcripción de un Space **ya finalizado**. La
  documentación de X no contempla ese caso; lo que circula son métodos no
  oficiales (scraping de `.m3u8`, cookies de sesión) que violan los términos
  de servicio y no son aptos para un flujo de producción.

Por eso:

- **No implementamos "Modalidad A" (ingesta 100% automática)** — no hay nada
  legítimo que automatizar ahí. Si en el futuro X habilita un endpoint para
  esto, se puede agregar un workflow de GitHub Actions que lo consuma.
- **La Modalidad B (asistida) es el flujo real**, vía `npm run new-episode` +
  `scripts/transcribe/transcribe.py` (faster-whisper, corre en CPU — viable
  en los runners gratuitos de GitHub Actions o en tu máquina). No hace
  diarización de hablantes; el campo `speaker` de cada segmento se completa a
  mano si se quiere identificar quién habla.
- Alternativa si se prefiere no instalar Python localmente: servicios
  hosteados como la API de Whisper de Groq (barata y rápida) o AssemblyAI
  (free tier con diarización incluida).

## Formulario de `/participa`

Usa [Formspree](https://formspree.io) (plan gratuito) porque GitHub Pages no
tiene backend:

1. Creá una cuenta gratuita en formspree.io y un formulario nuevo.
2. Copiá su ID (el string después de `/f/` en el endpoint).
3. Local: copiá `.env.example` a `.env` y completá `PUBLIC_FORMSPREE_ID`.
4. En producción: en **Settings → Secrets and variables → Actions →
   Variables** del repo, agregá `PUBLIC_FORMSPREE_ID` con ese mismo valor (el
   workflow de deploy ya lo lee desde ahí).

Sin ese ID configurado, `/participa` muestra un aviso de "formulario en
configuración" en vez de un formulario que falla en silencio.

## Próximo Space / calendario

- `src/data/schedule.ts` define el horario semanal (viernes 13:00
  `America/Argentina/Buenos_Aires`, horario de referencia IANA — no un offset
  fijo, así que se ajusta solo a cambios de horario de verano).
- Si una semana no hay Space, agregá su fecha a `skippedWeeks`.
- Si un Space puntual ya tiene enlace/horario confirmado, agregalo a
  `confirmedSpaces`.
- Los botones "Agendar en Google" / "Descargar .ics" generan un evento para
  la ocurrencia puntual calculada (no una serie recurrente), para evitar que
  alguien agende algo distinto a lo realmente anunciado. No implementamos un
  feed de calendario suscribible por la misma razón: mantenerlo
  correctamente sincronizado con excepciones ad-hoc necesitaría más que un
  sitio estático; en cambio, el sitio se reconstruye solo (ver cron del
  workflow de deploy) así la fecha calculada nunca queda vieja por mucho
  tiempo.

## Estructura

```
src/
  components/    Header, Hero, EpisodeCard, NextSpace (countdown), etc.
  content/
    episodes/    Un .md por episodio
    transcripts/ Un .json por transcripción (opcional)
  content.config.ts  Esquemas (zod) de ambas colecciones
  data/          hosts.ts, schedule.ts — configuración editorial
  lib/           time.ts (cálculo IANA), calendar.ts (ics/Google), url.ts (base path)
  pages/         Rutas del sitio
scripts/
  prepare-episode/  CLI para cargar un episodio nuevo
  transcribe/       Transcripción con faster-whisper
.github/workflows/deploy.yml
```

## Qué no se implementó (y por qué)

- Ingesta automática de Spaces: no hay API oficial para eso (ver arriba).
- Diarización automática de hablantes: faster-whisper no la soporta; se
  completa a mano en el JSON de la transcripción.
- Feed de calendario suscribible: ver sección de calendario arriba.
- Bios completas de los conductores en `src/data/hosts.ts`: son una versión
  condensada de lo que cada uno comparte en su propio LinkedIn; convendría
  que cada conductor las revise/ajuste antes de publicar.
