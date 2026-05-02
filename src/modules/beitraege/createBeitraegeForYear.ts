import { createBeitrag } from "./createBeitrag";
import type { Mitglied } from "../mitglieder/types/mitglieder";

export type Zahlungsart = "einzug" | "ueberweisung" | "bar";

export async function createBeitraegeForYear(
  mitglieder: Mitglied[],
  jahr: number,
  standardBetrag: number
): Promise<void> {
  for (const mitglied of mitglieder) {
    const zahlungsart: Zahlungsart = mitglied.sepa.iban ? "einzug" : "ueberweisung";

    try {
      await createBeitrag({
        mitgliedId: mitglied.id,
        mitgliedsnummer: mitglied.mitgliedsnummer,
        name: `${mitglied.vorname} ${mitglied.nachname}`,
        jahr,
        betrag: standardBetrag,
        zahlungsart,
      });
    } catch {
      // Beitrag bereits vorhanden oder anderer nicht-kritischer Fehler
    }
  }
}
