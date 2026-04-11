import { useEffect, useRef, useState } from "react";
import * as pdfjsLib from "pdfjs-dist";

// Wichtig: Worker konfigurieren (Vite kompatibel)
import pdfWorker from "pdfjs-dist/build/pdf.worker.mjs?url";
(pdfjsLib as any).GlobalWorkerOptions.workerSrc = pdfWorker;

type Props = {
  bytes: Uint8Array | null;
  page?: number; // default 1
};

export default function PdfPreview({ bytes, page = 1 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function render() {
      setError(null);

      if (!bytes || bytes.length === 0) return;
      if (!canvasRef.current) return;

      try {
        setLoading(true);

        const loadingTask = (pdfjsLib as any).getDocument({ data: bytes });
        const pdf = await loadingTask.promise;
        const pdfPage = await pdf.getPage(page);

        const viewport = pdfPage.getViewport({ scale: 1.25 });

        const canvas = canvasRef.current!;
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("Canvas Context nicht verfügbar");

        canvas.width = Math.floor(viewport.width);
        canvas.height = Math.floor(viewport.height);

        const renderTask = pdfPage.render({
          canvasContext: ctx,
          viewport,
        });

        await renderTask.promise;

        if (!cancelled) {
          setLoading(false);
        }
      } catch (e: any) {
        if (!cancelled) {
          setLoading(false);
          setError(e?.message ?? String(e));
        }
      }
    }

    render();

    return () => {
      cancelled = true;
    };
  }, [bytes, page]);

  return (
    <div style={{ width: "100%" }}>
      {loading && <div style={{ marginBottom: 8 }}>PDF wird geladen…</div>}
      {error && (
        <div style={{ color: "crimson", marginBottom: 8 }}>
          PDF Fehler: {error}
        </div>
      )}
      <canvas ref={canvasRef} style={{ width: "100%", borderRadius: 12 }} />
    </div>
  );
}