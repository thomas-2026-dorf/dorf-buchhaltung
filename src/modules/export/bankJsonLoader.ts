import { invoke } from "@tauri-apps/api/core";
import { readDir } from "@tauri-apps/plugin-fs";

export type LoadedBankJsonFile = {
  fileName: string;
  data: any;
};

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

export async function loadAllBankJsons(
  baseFolder: string
): Promise<LoadedBankJsonFile[]> {
  const normalizePath = (value: string) =>
    String(value || "")
      .replace(/\\/g, "/")
      .replace(/\/+$/, "");

  const normalizedBaseFolder = normalizePath(baseFolder);
  const lowerBaseFolder = normalizedBaseFolder.toLowerCase();

  const ordner =
    lowerBaseFolder.endsWith("/bank/bearbeitet")
      ? normalizedBaseFolder
      : lowerBaseFolder.endsWith("/bank")
        ? `${normalizedBaseFolder}/Bearbeitet`
        : `${normalizedBaseFolder}/Bank/Bearbeitet`;

  try {
    const files = await readDir(ordner);

    const jsonFiles = files.filter((f) => f.name?.endsWith("-bank-daten.json"));

    const result: LoadedBankJsonFile[] = [];

    for (const file of jsonFiles) {
      const pfad = `${ordner}/${file.name}`;

      try {
        const raw = await invoke<string>("bank_datei_oeffnen", { pfad });
        const parsed = JSON.parse(raw);

        result.push({
          fileName: file.name || "unbekannt-bank-daten.json",
          data: parsed,
        });
      } catch (err) {
        console.warn("Fehler bei JSON:", file.name, err);
      }
    }

    return result;
  } catch (err) {
    console.error("Ordner konnte nicht gelesen werden:", err, ordner);
    return [];
  }
}
