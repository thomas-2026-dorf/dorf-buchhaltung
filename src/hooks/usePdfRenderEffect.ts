import { useEffect } from "react";
import { renderPdfPage } from "../lib/pdf";

type UsePdfRenderEffectParams = {
  selectedPdfBytes: number[] | null;
  currentPage: number;
  zoom: number;
  setTotalPages: (value: number) => void;
  setLastError: (value: string) => void;
};

export function usePdfRenderEffect({
  selectedPdfBytes,
  currentPage,
  zoom,
  setTotalPages,
  setLastError,
}: UsePdfRenderEffectParams) {
  useEffect(() => {
    if (!selectedPdfBytes) return;

    renderPdfPage(selectedPdfBytes, currentPage, zoom)
      .then((result) => {
        setTotalPages(result.totalPages);
      })
      .catch((err) => {
        console.error("PDF render Fehler:", err);
        setLastError("PDF render Fehler: " + String(err));
      });
  }, [selectedPdfBytes, currentPage, zoom, setTotalPages, setLastError]);
}
