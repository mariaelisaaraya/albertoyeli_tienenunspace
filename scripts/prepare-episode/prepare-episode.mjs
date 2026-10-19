#!/usr/bin/env node
/**
 * Herramienta administrativa (Modalidad B — asistida) para preparar un nuevo
 * episodio a partir de un Space ya finalizado.
 *
 * No hay forma oficial y estable de obtener audio/transcripción de un Space
 * de X ya terminado vía API (ver README > "Automatización de X Spaces"), así
 * que este flujo es manual: vos subís el audio (si lo tenés y está
 * autorizado) y completás los datos; el script arma el Markdown del episodio
 * y, opcionalmente, dispara la transcripción con faster-whisper.
 *
 * Uso: npm run new-episode
 */

import { createInterface } from "node:readline";
import { stdin, stdout } from "node:process";
import { existsSync, mkdirSync, copyFileSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { extname, join } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("../../", import.meta.url));
const EPISODES_DIR = join(ROOT, "src/content/episodes");
const TRANSCRIPTS_DIR = join(ROOT, "src/content/transcripts");
const AUDIO_DIR = join(ROOT, "public/audio");

const rl = createInterface({ input: stdin, output: stdout });
const ask = (q) => new Promise((resolve) => rl.question(q, resolve));

function slugify(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function nextEpisodeNumber() {
  if (!existsSync(EPISODES_DIR)) return 1;
  const numbers = readdirSync(EPISODES_DIR)
    .filter((f) => f.endsWith(".md") || f.endsWith(".mdx"))
    .map((f) => {
      const match = /^number:\s*(\d+)/m.exec(readFileSync(join(EPISODES_DIR, f), "utf-8"));
      return match ? Number(match[1]) : 0;
    });
  return numbers.length > 0 ? Math.max(...numbers) + 1 : 1;
}

function splitList(input) {
  return input
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function yamlList(items) {
  if (items.length === 0) return "[]";
  return "\n" + items.map((i) => `  - ${JSON.stringify(i)}`).join("\n");
}

async function main() {
  console.log("── Preparar nuevo episodio de AlbertoYEli ──\n");

  const suggestedNumber = nextEpisodeNumber();
  const numberInput = await ask(`Número de episodio [${suggestedNumber}]: `);
  const number = Number(numberInput.trim()) || suggestedNumber;

  const title = (await ask("Título: ")).trim();
  if (!title) {
    console.error("El título es obligatorio.");
    process.exit(1);
  }

  const slugInput = (await ask(`Slug para la URL [${slugify(title)}]: `)).trim();
  const slug = slugInput || slugify(title);

  const dateInput = (await ask("Fecha de emisión (YYYY-MM-DD) [hoy]: ")).trim();
  const date = dateInput || new Date().toISOString().slice(0, 10);

  const summary = (await ask("Resumen editorial breve: ")).trim();
  const topics = splitList(await ask("Temas (separados por coma): "));
  const guests = splitList(await ask("Invitados (separados por coma, vacío si no hay): "));
  const spaceUrl = (await ask("URL del Space en X (opcional): ")).trim();
  const audioPath = (await ask("Ruta a un archivo de audio propio y autorizado (opcional): ")).trim();

  let audioUrl;
  let transcriptId;
  let transcriptStatus = "pending";

  if (audioPath) {
    if (!existsSync(audioPath)) {
      console.warn(`Aviso: no encontré el archivo "${audioPath}". Sigo sin audio.`);
    } else {
      mkdirSync(AUDIO_DIR, { recursive: true });
      const ext = extname(audioPath) || ".mp3";
      const destName = `${slug}${ext}`;
      copyFileSync(audioPath, join(AUDIO_DIR, destName));
      audioUrl = `/audio/${destName}`;
      console.log(`Audio copiado a public/audio/${destName}`);

      const doTranscribe = (await ask("¿Transcribir ahora con faster-whisper? (s/N): "))
        .trim()
        .toLowerCase();
      if (doTranscribe === "s" || doTranscribe === "si" || doTranscribe === "sí") {
        mkdirSync(TRANSCRIPTS_DIR, { recursive: true });
        const outputPath = join(TRANSCRIPTS_DIR, `${slug}.json`);
        console.log("Ejecutando transcripción (puede tardar varios minutos)...");
        const result = spawnSync(
          "python3",
          [join(ROOT, "scripts/transcribe/transcribe.py"), join(AUDIO_DIR, destName), outputPath],
          { stdio: "inherit" },
        );
        if (result.status === 0) {
          transcriptId = slug;
          transcriptStatus = "auto";
        } else {
          console.warn(
            "La transcripción falló o faster-whisper no está instalado. " +
              "Instalá las dependencias con: pip install -r scripts/transcribe/requirements.txt",
          );
        }
      }
    }
  }

  const frontmatter = [
    "---",
    `number: ${number}`,
    `title: ${JSON.stringify(title)}`,
    `date: ${date}`,
    `summary: ${JSON.stringify(summary)}`,
    `topics: ${yamlList(topics)}`,
    `guests: ${yamlList(guests)}`,
    spaceUrl ? `spaceUrl: ${JSON.stringify(spaceUrl)}` : null,
    audioUrl ? `audioUrl: ${JSON.stringify(audioUrl)}` : null,
    "links: []",
    "highlights: []",
    `transcriptStatus: ${JSON.stringify(transcriptStatus)}`,
    transcriptId ? `transcriptId: ${JSON.stringify(transcriptId)}` : null,
    "# draft: true hasta revisar el contenido (transcripción, resumen, enlaces).",
    "# Pasalo a false para que aparezca publicado en el sitio.",
    "draft: true",
    "---",
    "",
    "<!-- Resumen editorial / cuerpo del episodio en Markdown acá. -->",
    "",
  ]
    .filter((line) => line !== null)
    .join("\n");

  mkdirSync(EPISODES_DIR, { recursive: true });
  const episodePath = join(EPISODES_DIR, `${slug}.md`);
  if (existsSync(episodePath)) {
    console.error(`Ya existe ${episodePath}. Elegí otro slug.`);
    process.exit(1);
  }
  writeFileSync(episodePath, frontmatter);

  console.log(`\nListo: ${episodePath}`);
  console.log(
    "Revisá el contenido, completá el cuerpo del episodio y la transcripción si corresponde, " +
      "y cambiá draft a false cuando esté listo para publicar.",
  );

  rl.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
