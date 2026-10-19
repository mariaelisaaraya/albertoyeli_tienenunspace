#!/usr/bin/env python3
"""
Transcribe un archivo de audio con faster-whisper y genera un JSON compatible
con la colección `transcripts` del sitio (src/content/transcripts/<slug>.json).

No hace diarización de hablantes (faster-whisper no la soporta de forma
nativa): el campo "speaker" queda vacío y hay que completarlo a mano si se
quiere identificar quién habla en cada segmento.

Uso:
    python scripts/transcribe/transcribe.py audio.mp3 salida.json
    python scripts/transcribe/transcribe.py audio.mp3 salida.json --model small --language es

Requisitos: pip install -r scripts/transcribe/requirements.txt
"""

import argparse
import json
import sys
from pathlib import Path


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("audio", type=Path, help="Archivo de audio a transcribir (mp3, wav, m4a, ...)")
    parser.add_argument("output", type=Path, help="Archivo JSON de salida")
    parser.add_argument(
        "--model",
        default="small",
        help="Modelo de Whisper (tiny/base/small/medium/large-v3). 'small' es un buen balance "
        "costo/calidad para correr en CPU (ej. GitHub Actions). Default: small",
    )
    parser.add_argument("--language", default="es", help="Código de idioma (default: es)")
    parser.add_argument(
        "--device", default="cpu", help="Dispositivo para inferencia (cpu/cuda). Default: cpu"
    )
    args = parser.parse_args()

    if not args.audio.exists():
        print(f"No se encontró el archivo de audio: {args.audio}", file=sys.stderr)
        sys.exit(1)

    try:
        from faster_whisper import WhisperModel
    except ImportError:
        print(
            "Falta faster-whisper. Instalá las dependencias con:\n"
            "  pip install -r scripts/transcribe/requirements.txt",
            file=sys.stderr,
        )
        sys.exit(1)

    print(f"Cargando modelo '{args.model}' ({args.device})...", file=sys.stderr)
    model = WhisperModel(args.model, device=args.device, compute_type="int8")

    print(f"Transcribiendo {args.audio}...", file=sys.stderr)
    segments, info = model.transcribe(str(args.audio), language=args.language, vad_filter=True)

    print(
        f"Idioma detectado: {info.language} (confianza {info.language_probability:.2f})",
        file=sys.stderr,
    )

    output_segments = []
    for segment in segments:
        text = segment.text.strip()
        if not text:
            continue
        # No incluimos "speaker": faster-whisper no hace diarización. Se puede
        # agregar el campo a mano en el JSON generado si se identifica quién habla.
        output_segments.append(
            {
                "timestamp": round(segment.start, 1),
                "text": text,
            }
        )
        print(f"  [{segment.start:7.1f}s] {text}", file=sys.stderr)

    args.output.parent.mkdir(parents=True, exist_ok=True)
    with args.output.open("w", encoding="utf-8") as f:
        json.dump({"segments": output_segments}, f, ensure_ascii=False, indent=2)

    print(f"\nListo: {len(output_segments)} segmentos escritos en {args.output}", file=sys.stderr)
    print(
        "Recordá: esta transcripción es automática y sin revisar. Marcá el episodio con "
        "transcriptStatus: 'auto' hasta que alguien la revise, y pasalo a 'reviewed' después.",
        file=sys.stderr,
    )


if __name__ == "__main__":
    main()
