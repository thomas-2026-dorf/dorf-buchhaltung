import { readJsonFile, writeJsonFile, ensureDir } from "../../lib/fileStorage";
import { ladeLocalSettings } from "../../lib/settings/localSettings";
import type { Zahlungsart } from "./createBeitraegeForYear";

export type Beitrag = {
  id: string;
  mitgliedId: string;
  mitgliedsnummer: string;
  name: string;
  jahr: number;
  betrag: number;
  zahlungsart: Zahlungsart;
  status: "offen" | "bezahlt" | "storniert";
  erstelltAm: string;
  aktualisiertAm: string;
};

const LS_KEY = "dorfbuchhaltung-beitraege-v1";

function vereinsdatenDir(): string | null {
  const { baseFolder } = ladeLocalSettings();
  return baseFolder ? `${baseFolder}/vereinsdaten` : null;
}

function ausLocalStorage(): Beitrag[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? (JSON.parse(raw) as Beitrag[]) : [];
  } catch { return []; }
}

function inLocalStorage(beitraege: Beitrag[]): void {
  localStorage.setItem(LS_KEY, JSON.stringify(beitraege));
}

export async function loadBeitraege(): Promise<Beitrag[]> {
  const dir = vereinsdatenDir();
  if (!dir) return ausLocalStorage();

  try {
    await ensureDir(dir);
    const filePath = `${dir}/beitraege.json`;

    const legacyRaw = localStorage.getItem(LS_KEY);
    if (legacyRaw) {
      try {
        const daten = JSON.parse(legacyRaw) as Beitrag[];
        if (Array.isArray(daten) && daten.length > 0) {
          await writeJsonFile(filePath, daten);
        }
        localStorage.removeItem(LS_KEY);
        return Array.isArray(daten) ? daten : [];
      } catch {
        return ausLocalStorage();
      }
    }

    return readJsonFile<Beitrag[]>(filePath, []);
  } catch (err) {
    console.error("Fehler beim Laden der Beiträge:", err);
    return ausLocalStorage();
  }
}

export async function saveBeitraege(beitraege: Beitrag[]): Promise<void> {
  const dir = vereinsdatenDir();
  if (!dir) {
    inLocalStorage(beitraege);
    return;
  }

  try {
    await ensureDir(dir);
    await writeJsonFile(`${dir}/beitraege.json`, beitraege);
  } catch (err) {
    console.error("Fehler beim Speichern der Beiträge:", err);
    inLocalStorage(beitraege);
  }
}
