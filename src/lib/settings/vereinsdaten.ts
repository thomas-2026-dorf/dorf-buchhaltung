import { readJsonFile, writeJsonFile, ensureDir } from "../fileStorage";
import { getGlobalVereinsdatenDir } from "./localSettings";

export type Vereinsdaten = {
  name: string;
  strasse: string;
  plz: string;
  ort: string;
  telefon: string;
  email: string;
  iban: string;
  bic: string;
  kreditinstitut: string;
  glaeubigerId: string;
  logoPfad: string;
};

const LS_KEY = "vereinsdaten-v1";

const DEFAULT: Vereinsdaten = {
  name: "", strasse: "", plz: "", ort: "",
  telefon: "", email: "", iban: "", bic: "",
  kreditinstitut: "", glaeubigerId: "", logoPfad: "",
};

function vereinsdatenDir(): string | null {
  return getGlobalVereinsdatenDir();
}

function ausLocalStorage(): Vereinsdaten {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? { ...DEFAULT, ...JSON.parse(raw) } : { ...DEFAULT };
  } catch { return { ...DEFAULT }; }
}

function inLocalStorage(data: Vereinsdaten): void {
  localStorage.setItem(LS_KEY, JSON.stringify(data));
}

export async function ladeVereinsdaten(): Promise<Vereinsdaten> {
  const dir = vereinsdatenDir();
  if (!dir) return ausLocalStorage();

  try {
    await ensureDir(dir);
    const filePath = `${dir}/vereinsdaten.json`;

    const legacyRaw = localStorage.getItem(LS_KEY);
    if (legacyRaw) {
      try {
        const daten = { ...DEFAULT, ...JSON.parse(legacyRaw) };
        await writeJsonFile(filePath, daten);
        localStorage.removeItem(LS_KEY);
        return daten;
      } catch {
        return ausLocalStorage();
      }
    }

    const gespeichert = await readJsonFile<Partial<Vereinsdaten>>(filePath, {});
    return { ...DEFAULT, ...gespeichert };
  } catch (err) {
    console.error("Fehler beim Laden der Vereinsdaten:", err);
    return ausLocalStorage();
  }
}

export async function speichereVereinsdaten(data: Vereinsdaten): Promise<void> {
  const dir = vereinsdatenDir();
  if (!dir) {
    inLocalStorage(data);
    return;
  }

  try {
    await ensureDir(dir);
    await writeJsonFile(`${dir}/vereinsdaten.json`, data);
  } catch (err) {
    console.error("Fehler beim Speichern der Vereinsdaten:", err);
    inLocalStorage(data);
  }
}
