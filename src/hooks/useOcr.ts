import { invoke } from "@tauri-apps/api/core";
import { erkenneBelegdaten } from "../lib/belegErkennung";

type Params = {
  baseFolder: string;
  year: string;
  setErkannterText: (v: string) => void;
  setErkannteDaten: (v: any) => void;
  setLieferant: (v: string) => void;
  setOcrStatus: (v: string) => void;
};

export function useOcr({
  baseFolder,
  year,
  setErkannterText,
  setErkannteDaten,
  setLieferant,
  setOcrStatus,
}: Params) {
  function normalizeFilename(value: unknown): string {
    if (typeof value === "string") return value;
    return "";
  }

  async function runOcrForFilename(filenameInput: unknown) {
    const filenameToUse = normalizeFilename(filenameInput);

    if (!filenameToUse) {
      setOcrStatus(
        "OCR Fehler: Ungültiger Dateiname. Bitte neu auswählen."
      );
      return;
    }

    if (!baseFolder || !year) {
      setOcrStatus("OCR Fehler: Basisordner oder Jahr fehlt.");
      return;
    }

    try {
      const result = await invoke<any>("run_ocr_placeholder", {
        baseFolder,
        year,
        filename: filenameToUse,
      });

      setErkannterText(result.text || "");

      const daten = erkenneBelegdaten(result.text || "");

      setErkannteDaten(daten);
      setLieferant(daten.lieferant);
    } catch (err) {
      setOcrStatus("OCR Fehler: " + String(err));
    }
  }

  return {
    runOcrForFilename,
  };
}
