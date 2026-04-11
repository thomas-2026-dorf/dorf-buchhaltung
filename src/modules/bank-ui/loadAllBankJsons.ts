import { invoke } from "@tauri-apps/api/core";
import { readDir } from "@tauri-apps/plugin-fs";

export async function loadAllBankJsons(baseFolder: string) {
  const ordner = `${baseFolder}/Bank/Bearbeitet`;

  try {
    const files = await readDir(ordner);

    const jsonFiles = files.filter((f) =>
      f.name?.endsWith("-bank-daten.json")
    );

    const result: any[] = [];

    for (const file of jsonFiles) {
      const pfad = `${ordner}/${file.name}`;

      try {
        const raw = await invoke<string>("bank_datei_oeffnen", { pfad });
        const parsed = JSON.parse(raw);
        result.push(parsed);
      } catch (err) {
        console.warn("Fehler bei JSON:", file.name, err);
      }
    }

    return result;
  } catch (err) {
    console.error("Ordner konnte nicht gelesen werden:", err);
    return [];
  }
}
