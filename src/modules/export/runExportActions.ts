import { runPdfSammelExport } from "./runPdfSammelExport";
import { runStbGesamtExport } from "./runStbGesamtExport";

type PdfExportParams = {
  baseFolder: string;
  year: string;
  setPdfExportLoading: (value: boolean) => void;
};

type GesamtExportParams = {
  handleKontoExport: () => Promise<void>;
  handleBelegExport: () => Promise<void>;
  handlePdfExport: () => Promise<void>;
};

export async function runPdfExportAction({
  baseFolder,
  year,
  setPdfExportLoading,
}: PdfExportParams) {
  await runPdfSammelExport({
    baseFolder,
    year,
    setPdfExportLoading,
  });
}

export async function runStbGesamtExportAction({
  handleKontoExport,
  handleBelegExport,
  handlePdfExport,
}: GesamtExportParams) {
  await runStbGesamtExport({
    handleKontoExport,
    handleBelegExport,
    handlePdfExport,
  });
}
