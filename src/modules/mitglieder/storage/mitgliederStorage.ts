import { readJsonFile, writeJsonFile, ensureDir } from "../../../lib/fileStorage";
import { ladeLocalSettings, getGlobalVereinsdatenDir } from "../../../lib/settings/localSettings";
import type { Mitglied } from "../types/mitglieder";

const LS_KEY = "dorfbuchhaltung-mitglieder-v1";

function vereinsdatenDir(): string | null {
  return getGlobalVereinsdatenDir();
}

// Altes Jahr-spezifisches Verzeichnis für Migration
function altesVereinsdatenDir(): string | null {
  const { baseFolder } = ladeLocalSettings();
  return baseFolder ? `${baseFolder}/vereinsdaten` : null;
}

function ausLocalStorage(): Mitglied[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? (JSON.parse(raw) as Mitglied[]) : [];
  } catch { return []; }
}

function inLocalStorage(mitglieder: Mitglied[]): void {
  localStorage.setItem(LS_KEY, JSON.stringify(mitglieder));
}

export async function ladeMitglieder(): Promise<Mitglied[]> {
  const dir = vereinsdatenDir();
  if (!dir) return ausLocalStorage();

  try {
    await ensureDir(dir);
    const filePath = `${dir}/mitglieder.json`;

    // Migration aus localStorage
    const legacyRaw = localStorage.getItem(LS_KEY);
    if (legacyRaw) {
      try {
        const daten = JSON.parse(legacyRaw) as Mitglied[];
        if (Array.isArray(daten) && daten.length > 0) {
          await writeJsonFile(filePath, daten);
        }
        localStorage.removeItem(LS_KEY);
        return Array.isArray(daten) ? daten : [];
      } catch {
        return ausLocalStorage();
      }
    }

    const daten = await readJsonFile<Mitglied[]>(filePath, []);

    // Migration aus altem Jahr-Ordner, falls neue Datei leer
    if (daten.length === 0) {
      const altDir = altesVereinsdatenDir();
      if (altDir && altDir !== dir) {
        try {
          const altDaten = await readJsonFile<Mitglied[]>(`${altDir}/mitglieder.json`, []);
          if (altDaten.length > 0) {
            await writeJsonFile(filePath, altDaten);
            return altDaten;
          }
        } catch { /* kein alter Ordner vorhanden */ }
      }
    }

    return daten;
  } catch (err) {
    console.error("Fehler beim Laden der Mitglieder:", err);
    return ausLocalStorage();
  }
}

export async function speichereMitglieder(mitglieder: Mitglied[]): Promise<void> {
  const dir = vereinsdatenDir();
  if (!dir) {
    inLocalStorage(mitglieder);
    return;
  }

  try {
    await ensureDir(dir);
    await writeJsonFile(`${dir}/mitglieder.json`, mitglieder);
  } catch (err) {
    console.error("Fehler beim Speichern der Mitglieder:", err);
    inLocalStorage(mitglieder);
  }
}
