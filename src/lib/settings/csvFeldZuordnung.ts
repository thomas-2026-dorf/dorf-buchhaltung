import { readJsonFile, writeJsonFile, ensureDir } from "../fileStorage";
import { getGlobalVereinsdatenDir } from "./localSettings";

export type CsvFeldZuordnung = {
  trennzeichen: string;
  buchungstag: number;
  valuta: number;
  betrag: number;
  waehrung: number;
  verwendungszweck: number;
  buchungstext: number;    // -1 = nicht vorhanden, wird mit verwendungszweck zusammengeführt
  auftraggeber: number;
  mitgliedsnummer: number; // -1 = nicht vorhanden
};

export const CSV_FELD_DEFAULT: CsvFeldZuordnung = {
  trennzeichen: ";",
  buchungstag: 0,
  valuta: 1,
  betrag: 2,
  waehrung: 3,
  verwendungszweck: 4,
  buchungstext: -1,
  auftraggeber: 5,
  mitgliedsnummer: 6,
};

export function erkenneFelderAusKopfzeile(
  kopfzeile: string,
  trennzeichen: string
): CsvFeldZuordnung {
  const cols = kopfzeile
    .replace(/^﻿/, "")
    .split(trennzeichen)
    .map((c) => c.trim().toLowerCase().replace(/["""]/g, ""));

  const find = (...aliases: string[]): number => {
    for (const alias of aliases) {
      const idx = cols.findIndex((c) => c.includes(alias));
      if (idx >= 0) return idx;
    }
    return -1;
  };

  return {
    trennzeichen,
    buchungstag:     find("buchungstag")                                              ?? CSV_FELD_DEFAULT.buchungstag,
    valuta:          find("valuta", "wertstellung")                                   ?? CSV_FELD_DEFAULT.valuta,
    betrag:          find("betrag")                                                   ?? CSV_FELD_DEFAULT.betrag,
    waehrung:        find("waehrung", "währung", "currency")                          ?? CSV_FELD_DEFAULT.waehrung,
    verwendungszweck:find("verwendungszweck")                                         ?? CSV_FELD_DEFAULT.verwendungszweck,
    buchungstext:    find("buchungstext"),
    auftraggeber:    find("auftraggeber", "beguenstigter", "begünstigter", "zahlungspflichtiger") ?? CSV_FELD_DEFAULT.auftraggeber,
    mitgliedsnummer: find("mitgliedsnummer", "mitglieds"),
  };
}

export async function ladeCsvFeldZuordnung(): Promise<CsvFeldZuordnung> {
  const dir = getGlobalVereinsdatenDir();
  if (!dir) return { ...CSV_FELD_DEFAULT };
  try {
    await ensureDir(dir);
    return readJsonFile<CsvFeldZuordnung>(`${dir}/csv-feld-zuordnung.json`, { ...CSV_FELD_DEFAULT });
  } catch {
    return { ...CSV_FELD_DEFAULT };
  }
}

export async function speichereCsvFeldZuordnung(z: CsvFeldZuordnung): Promise<void> {
  const dir = getGlobalVereinsdatenDir();
  if (!dir) return;
  try {
    await ensureDir(dir);
    await writeJsonFile(`${dir}/csv-feld-zuordnung.json`, z);
  } catch (err) {
    console.error("CSV-Feldzuordnung konnte nicht gespeichert werden:", err);
  }
}
