import { invoke } from "@tauri-apps/api/core";
import { extractPdfText } from "../../lib/pdf";
import { erkenneBelegdaten } from "../../lib/belegErkennung";

export async function loadGespeicherterBelegHandler({
  baseFolder,
  beleg,
  setters,
}: any) {
  try {
    const relPath = beleg.pfad;

    if (!relPath) {
      setters.setLastError("Pfad fehlt beim gespeicherten Beleg.");
      return;
    }

    const exists = await invoke<boolean>("relpath_pdf_exists", {
      baseFolder,
      year: String(beleg.jahr),
      relPath,
    });

    if (!exists) {
      alert("PDF existiert nicht mehr.");
      return;
    }

    const bytes = await invoke<number[]>("read_pdf_bytes_by_relpath", {
      baseFolder,
      year: String(beleg.jahr),
      relPath,
    });

    setters.setSelectedPdfBytes(bytes);
    setters.setCurrentPage(1);

    const text = await extractPdfText(bytes);

    if (text && text.trim().length > 20) {
      const daten = erkenneBelegdaten(text);

      setters.setLieferant(daten.lieferant || beleg.lieferant || "");
      setters.setBelegDatum(daten.datum || beleg.datum || "");
      setters.setBetrag(daten.betrag || beleg.betrag || "");
      setters.setRechnungsnummer(daten.rechnungsnummer || beleg.rechnungsnummer || "");
      setters.setKategorie(beleg.konto || "Sonstiges");
      setters.setNotiz(beleg.notiz || "");
      setters.setZahlungsart(beleg.zahlungsart || "bank");
      setters.setBankkontoId(beleg.bankkontoId || "");
      setters.setManuellesZahldatum(beleg.manuellesZahldatum || "");
    } else {
      setters.setLieferant(beleg.lieferant || "");
      setters.setBelegDatum(beleg.datum || "");
      setters.setBetrag(beleg.betrag || "");
      setters.setRechnungsnummer(beleg.rechnungsnummer || "");
      setters.setKategorie(beleg.kategorie || beleg.konto || "Sonstiges");
      setters.setNotiz(beleg.notiz || "");
      setters.setZahlungsart(beleg.zahlungsart || "bank");
      setters.setBankkontoId(beleg.bankkontoId || "");
      setters.setManuellesZahldatum(beleg.manuellesZahldatum || "");
    }
  } catch (e) {
    setters.setLastError(String(e));
  }
}
