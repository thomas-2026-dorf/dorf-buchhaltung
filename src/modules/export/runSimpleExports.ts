import { runBelegExport, runKontoExport } from "./exportHandlers";

export async function runBelegExportAction(
  baseFolder: string,
  year: string
) {
  await runBelegExport(baseFolder, year);
}

export async function runKontoExportAction(
  baseFolder: string,
  year: string
) {
  await runKontoExport(baseFolder, year);
}
