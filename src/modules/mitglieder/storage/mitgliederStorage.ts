import type { Mitglied } from "../types/mitglieder";

const STORAGE_KEY = "dorfbuchhaltung-mitglieder-v1";

export function ladeMitglieder(): Mitglied[] {
  try {
    const roh = localStorage.getItem(STORAGE_KEY);
    if (!roh) return [];

    const daten = JSON.parse(roh);
    if (!Array.isArray(daten)) return [];

    return daten as Mitglied[];
  } catch (error) {
    console.error("Fehler beim Laden der Mitglieder:", error);
    return [];
  }
}

export function speichereMitglieder(mitglieder: Mitglied[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mitglieder));
  } catch (error) {
    console.error("Fehler beim Speichern der Mitglieder:", error);
  }
}
