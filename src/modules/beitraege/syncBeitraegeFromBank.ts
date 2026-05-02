import { readDir } from "@tauri-apps/plugin-fs";
import { readJsonFile, writeJsonFile, ensureDir } from "../../lib/fileStorage";
import { loadBeitraege, saveBeitraege } from "./beitraegeStorage";
import type { BankBooking, SlimAssignment } from "../bank-ui/types/bankSlimTypes";
import type { Mitglied } from "../mitglieder/types/mitglieder";

type BankJson = {
  bookings: BankBooking[];
  assignments: Record<string, SlimAssignment>;
};

export async function syncBeitraegeFromBank(
  baseFolder: string,
  mitglieder: Mitglied[]
): Promise<number> {
  const ordner = `${baseFolder}/Bank/Bearbeitet`;
  let updated = 0;

  const nrMap = new Map<string, string>();   // mitgliedsnummer → mitgliedId
  const nameMap = new Map<string, string>();  // vollname (lower) → mitgliedId
  for (const m of mitglieder) {
    if (m.mitgliedsnummer) nrMap.set(m.mitgliedsnummer.toLowerCase().trim(), m.id);
    nameMap.set(`${m.vorname} ${m.nachname}`.toLowerCase().trim(), m.id);
  }

  try {
    const files = await readDir(ordner);
    const jsonFiles = files.filter((f) => f.name?.endsWith("-bank-daten.json"));

    const beitraege = await loadBeitraege();
    let changed = false;

    for (const file of jsonFiles) {
      try {
        const data = await readJsonFile<BankJson>(
          `${ordner}/${file.name}`,
          { bookings: [], assignments: {} }
        );

        for (const [bookingKey, assignment] of Object.entries(data.assignments)) {
          // Primär: Kd.Nr / Mitgl.Nr. → mitgliedsnummer-Lookup
          const mitgliedId =
            (assignment.kundennr?.trim()
              ? nrMap.get(assignment.kundennr.toLowerCase().trim())
              : undefined) ??
            assignment.mitgliedId?.trim() ??
            (assignment.mitgliedName?.trim()
              ? nameMap.get(assignment.mitgliedName.toLowerCase().trim())
              : undefined) ??
            "";

          if (!mitgliedId) continue;

          const booking = data.bookings.find((b) => b.bookingKey === bookingKey);
          if (!booking?.datum) continue;

          const jahr = parseInt(booking.datum.slice(0, 4));
          if (!jahr) continue;

          const idx = beitraege.findIndex(
            (b) => b.mitgliedId === mitgliedId && b.jahr === jahr && b.status === "offen"
          );

          if (idx !== -1) {
            beitraege[idx] = {
              ...beitraege[idx],
              status: "bezahlt",
              aktualisiertAm: new Date().toISOString(),
            };
            changed = true;
            updated++;
          }
        }
      } catch (err) {
        console.warn("Bank-Sync: Fehler bei Datei", file.name, err);
      }
    }

    if (changed) {
      await saveBeitraege(beitraege);
    }
  } catch {
    // Ordner existiert noch nicht – kein Fehler
  }

  return updated;
}

export async function createDummyBankJson(
  baseFolder: string,
  mitglied: Mitglied,
  betrag: number
): Promise<void> {
  const ordner = `${baseFolder}/Bank/Bearbeitet`;
  await ensureDir(ordner);

  const datum = new Date().toISOString().slice(0, 10);
  const name = `${mitglied.vorname} ${mitglied.nachname}`;
  const bookingKey = `${datum}|${betrag.toFixed(2)}|${name}|Mitgliedsbeitrag|`;
  const fileName = `${datum}-dummy-bank-daten.json`;

  await writeJsonFile(`${ordner}/${fileName}`, {
    importId: `dummy-${datum}`,
    fileName,
    bookings: [
      {
        bookingKey,
        datum,
        betrag,
        verwendungszweck: `Mitgliedsbeitrag ${datum.slice(0, 4)}`,
      },
    ],
    assignments: {
      [bookingKey]: {
        belegId: "",
        bemerkung: "Dummy-Eintrag für Test",
        kundennr: mitglied.mitgliedsnummer || "",
        mitgliedId: mitglied.id,
        mitgliedName: name,
        fewo: "",
        istAnzahlung: false,
        belegFehlt: false,
        splitAssignments: [],
      },
    },
    savedAt: new Date().toISOString(),
  });
}
