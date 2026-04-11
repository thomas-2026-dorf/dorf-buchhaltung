import type { FeWo } from "../../types";
import { loadPdfHandler } from "./loadPdfHandler";
import { normalizeFilename } from "../../helpers/appHelpers";

type Params = {
  filenameInput: unknown;
  baseFolder: string;
  year: string;
  fewos: FeWo[];
  setLastError: (value: string) => void;
  setSelectedFilename: (value: string) => void;
  setSelectedPdfBytes: (value: number[] | null) => void;
  setCurrentPage: (value: number) => void;
  setLieferant: (value: string) => void;
  setBelegDatum: (value: string) => void;
  setBetrag: (value: string) => void;
  setRechnungsnummer: (value: string) => void;
  setErkannterText: (value: string) => void;
  setKategorie: (value: string) => void;
  setActiveFeWoId: (value: string) => void;
  setSplitMode: (value: boolean) => void;
  setSplitTina: (value: string) => void;
  setSplitHarmony: (value: string) => void;
  setSplitTinchen: (value: string) => void;
  setSplitRS: (value: string) => void;
  setSplitPrivat: (value: string) => void;
};

export async function runLoadPdf({
  filenameInput,
  baseFolder,
  year,
  fewos,
  setLastError,
  setSelectedFilename,
  setSelectedPdfBytes,
  setCurrentPage,
  setLieferant,
  setBelegDatum,
  setBetrag,
  setRechnungsnummer,
  setErkannterText,
  setKategorie,
  setActiveFeWoId,
  setSplitMode,
  setSplitTina,
  setSplitHarmony,
  setSplitTinchen,
  setSplitRS,
  setSplitPrivat,
}: Params) {
  const filename = normalizeFilename(filenameInput);

  if (!filename) {
    setLastError("Ungültiger Dateiname beim Öffnen der PDF.");
    return;
  }

  setSelectedFilename(filename);

  await loadPdfHandler({
    baseFolder,
    year,
    filename,
    fewos,
    setters: {
      setSelectedPdfBytes,
      setCurrentPage,
      setLieferant,
      setBelegDatum,
      setBetrag,
      setRechnungsnummer,
      setErkannterText,
      setKategorie,
      setActiveFeWoId,
      setLastError,
      setSplitMode,
      setSplitTina,
      setSplitHarmony,
      setSplitTinchen,
      setSplitRS,
      setSplitPrivat,
    },
  });
}
