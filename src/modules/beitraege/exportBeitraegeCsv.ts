import { writeFile } from "@tauri-apps/plugin-fs";
import { ensureDir } from "../../lib/fileStorage";
import { loadBeitraege } from "./beitraegeStorage";

function heuteDDMMYYYY(): string {
  const d = new Date();
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}.${mm}.${yyyy}`;
}

export async function exportOffeneBeitraegeCsv(baseFolder: string): Promise<void> {
  const beitraege = await loadBeitraege();
  const offene = beitraege.filter((b) => b.status === "offen");

  const heute = heuteDDMMYYYY();

  const header = "Buchungstag;Valuta;Betrag;Waehrung;Verwendungszweck;Auftraggeber;Mitgliedsnummer";

  const zeilen = offene.map((b) => {
    const betrag = b.betrag.toFixed(2).replace(".", ",");
    const verwendungszweck = `Mitgliedsbeitrag ${b.mitgliedsnummer} ${b.name}`;
    return [heute, heute, betrag, "EUR", verwendungszweck, b.name, b.mitgliedsnummer].join(";");
  });

  const csv = [header, ...zeilen].join("\n");

  const ordner = `${baseFolder}/Bank/Export`;
  await ensureDir(ordner);

  await writeFile(`${ordner}/beitraege-export.csv`, new TextEncoder().encode(csv));
}
