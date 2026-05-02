import { loadBeitraege, saveBeitraege } from "./beitraegeStorage";
import type { Beitrag } from "./beitraegeStorage";
import type { Zahlungsart } from "./createBeitraegeForYear";

export type CreateBeitragInput = {
  mitgliedId: string;
  mitgliedsnummer: string;
  name?: string;
  jahr: number;
  betrag: number;
  zahlungsart: Zahlungsart;
};

export async function createBeitrag(input: CreateBeitragInput): Promise<Beitrag | null> {
  const beitraege = await loadBeitraege();

  const exists = beitraege.some(
    (b) => b.mitgliedId === input.mitgliedId && b.jahr === input.jahr
  );

  if (exists) return null;

  const jetzt = new Date().toISOString();

  const neuerBeitrag: Beitrag = {
    id: crypto.randomUUID(),
    mitgliedId: input.mitgliedId,
    mitgliedsnummer: input.mitgliedsnummer,
    name: input.name ?? "",
    jahr: input.jahr,
    betrag: input.betrag,
    zahlungsart: input.zahlungsart,
    status: "offen",
    erstelltAm: jetzt,
    aktualisiertAm: jetzt,
  };

  await saveBeitraege([...beitraege, neuerBeitrag]);

  return neuerBeitrag;
}
