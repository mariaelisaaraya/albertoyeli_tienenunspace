import { useTranslationReady } from "../lib/useTranslationReady";
import { useState, type FormEvent } from "react";

interface Props {
  formspreeId?: string;
}

type Status = "idle" | "submitting" | "success" | "error";

const paises = [
  "Argentina",
  "Costa Rica",
  "México",
  "Colombia",
  "Chile",
  "Perú",
  "Uruguay",
  "España",
  "Estados Unidos",
  "Otro",
];

export default function GuestForm({ formspreeId }: Props) {
  const languageRoot = useTranslationReady();
  const [status, setStatus] = useState<Status>("idle");
  const [consent, setConsent] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  if (!formspreeId) {
    return (
      <div ref={languageRoot} className="rounded-doodle border-2 border-dashed border-ink/30 bg-paper/60 px-6 py-10 text-center">
        <p className="font-display text-lg font-bold text-ink">Formulario en configuración</p>
        <p className="mt-2 text-sm text-ink-soft">
          Todavía no conectamos el servicio de formularios. Mientras tanto, escribinos directamente
          a {" "}
          <a href="https://x.com/ar3lisa" className="focus-ring underline">
            @ar3lisa
          </a>{" "}
          o{" "}
          <a href="https://x.com/TechRebelWorld" className="focus-ring underline">
            @TechRebelWorld
          </a>{" "}
          en X.
        </p>
      </div>
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!consent) {
      setStatus("error");
      setErrorMessage("Necesitamos tu consentimiento para poder leer tu postulación.");
      return;
    }

    const form = event.currentTarget;
    const data = new FormData(form);

    // Honeypot anti-spam: si este campo oculto viene con contenido, es un bot.
    if (String(data.get("_gotcha") ?? "").length > 0) {
      setStatus("success");
      return;
    }

    setStatus("submitting");
    setErrorMessage("");

    try {
      const response = await fetch(`https://formspree.io/f/${formspreeId}`, {
        method: "POST",
        body: data,
        headers: { Accept: "application/json" },
      });

      if (response.ok) {
        setStatus("success");
        form.reset();
        setConsent(false);
      } else {
        setStatus("error");
        setErrorMessage("No pudimos enviar tu postulación. Probá de nuevo en unos minutos.");
      }
    } catch {
      setStatus("error");
      setErrorMessage("Falló la conexión. Revisá tu internet e intentá de nuevo.");
    }
  }

  if (status === "success") {
    return (
      <div ref={languageRoot} className="rounded-doodle border-2 border-ink bg-mint-soft px-6 py-10 text-center">
        <p className="font-display text-lg font-bold text-ink">¡Postulación enviada!</p>
        <p className="mt-2 text-sm text-ink-soft">
          Gracias por escribirnos. Si tu propuesta encaja con un próximo Space, te contactamos por
          el email o usuario de X que nos dejaste.
        </p>
      </div>
    );
  }

  return (
    <form ref={languageRoot} onSubmit={handleSubmit} className="space-y-5">
      <input type="text" name="_gotcha" className="hidden" tabIndex={-1} autoComplete="off" />

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Nombre" name="nombre" required />
        <Field label="Usuario de X" name="usuario_x" placeholder="@tu_usuario" />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Email de contacto" name="email" type="email" required />
        <div>
          <label className="mb-1 block text-sm font-semibold text-ink" htmlFor="pais">
            País
          </label>
          <select
            id="pais"
            name="pais"
            required
            className="focus-ring w-full rounded-2xl border-2 border-ink bg-paper px-4 py-2.5 text-ink"
          >
            <option value="">Elegí un país</option>
            {paises.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
      </div>

      <TextArea label="¿De qué te gustaría hablar?" name="tema" required />
      <TextArea label="Contanos brevemente sobre vos" name="sobre_vos" required />
      <TextArea label="¿Por qué te gustaría participar?" name="motivacion" required />
      <Field
        label="Enlace a tu proyecto, web o redes (opcional)"
        name="enlace"
        type="url"
        placeholder="https://"
      />

      <label className="flex items-start gap-3 text-sm text-ink-soft">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          required
          className="mt-1 h-4 w-4 shrink-0 rounded border-2 border-ink"
        />
        Doy mi consentimiento para que AlbertoYEli use estos datos exclusivamente para gestionar mi
        postulación a participar del podcast.
      </label>

      {status === "error" && (
        <p role="alert" className="text-sm font-semibold text-coral">
          {errorMessage}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="focus-ring rounded-full border-2 border-ink bg-ink px-6 py-3 font-display font-bold text-paper shadow-doodle transition hover:-translate-y-0.5 disabled:opacity-60"
      >
        {status === "submitting" ? "Enviando…" : "Enviar postulación"}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  required = false,
  placeholder,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-semibold text-ink" htmlFor={name}>
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        className="focus-ring w-full rounded-2xl border-2 border-ink bg-paper px-4 py-2.5 text-ink placeholder:text-ink-soft/60"
      />
    </div>
  );
}

function TextArea({
  label,
  name,
  required = false,
}: {
  label: string;
  name: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-semibold text-ink" htmlFor={name}>
        {label}
      </label>
      <textarea
        id={name}
        name={name}
        required={required}
        rows={3}
        className="focus-ring w-full rounded-2xl border-2 border-ink bg-paper px-4 py-2.5 text-ink"
      />
    </div>
  );
}
