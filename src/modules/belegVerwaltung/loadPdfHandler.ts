import { invoke } from "@tauri-apps/api/core";
import { extractPdfText } from "../../lib/pdf";
import { erkenneBelegdaten, erkenneSecraSplits } from "../../lib/belegErkennung";
import { erkenneErloesdaten } from "../../lib/erloesErkennung";
import { findeDatevKontoZuLieferant } from "../../lib/settings/localSettings";

export async function loadPdfHandler({
  baseFolder,
  year,
  filename,
  fewos,
  setters,
}: any) {
  try {
    const bytes = await invoke<number[]>("read_pdf_bytes", {
      baseFolder,
      year,
      filename,
    });

    setters.setSelectedPdfBytes(bytes);
    setters.setCurrentPage(1);

    setters.setLieferant("");
    setters.setBelegDatum("");
    setters.setBetrag("");
    setters.setRechnungsnummer("");
    setters.setErkannterText("");
    setters.setKategorie("");
    setters.setSplitMode(false);
    setters.setSplitTina("");
    setters.setSplitHarmony("");
    setters.setSplitTinchen("");
    setters.setSplitRS("");
    setters.setSplitPrivat("");

    const text = await extractPdfText(bytes);

    // Immer zuerst alte Split-Werte zurücksetzen
    setters.setSplitMode(false);
    setters.setSplitTina("");
    setters.setSplitHarmony("");
    setters.setSplitTinchen("");
    setters.setSplitRS("");
    setters.setSplitPrivat("");

    if (text && text.trim().length > 80) {
      const daten = erkenneBelegdaten(text);
      const erloesDaten = erkenneErloesdaten(text);

      const istErloes =
        !!erloesDaten.fewo && !!erloesDaten.rechnungsnummer;

      if (istErloes && erloesDaten.fewo) {
        const passendeFeWo = fewos.find((item: any) =>
          item.name.toLowerCase().includes(erloesDaten.fewo.toLowerCase())
        );

        if (passendeFeWo) {
          setters.setActiveFeWoId(passendeFeWo.id);
        }
      }

      const lieferantErkannt = daten.lieferant || "";
      const gemerktesDatevKonto = findeDatevKontoZuLieferant(lieferantErkannt);

      setters.setLieferant(lieferantErkannt);
      setters.setBelegDatum(daten.datum || "");
      setters.setBetrag(daten.betrag || "");
      setters.setRechnungsnummer(daten.rechnungsnummer || "");
      setters.setErkannterText(text);

      if (gemerktesDatevKonto) {
        setters.setKategorie(gemerktesDatevKonto);
      }

      const textLower = text.toLowerCase();
      const istSecra =
        textLower.includes("secra") ||
        textLower.includes("fewo-channelmanager.de") ||
        textLower.includes("gastgeber-nr.") ||
        textLower.includes("provisionsrechnung");

      if (istSecra) {
        const splits = erkenneSecraSplits(text);

        const hatSplitwerte =
          Number(splits.tina) > 0 ||
          Number(splits.harmony) > 0 ||
          Number(splits.tinchen) > 0;

        if (hatSplitwerte) {
          setters.setSplitMode(true);
          setters.setSplitTina(splits.tina !== "0.00" ? splits.tina.replace(".", ",") : "");
          setters.setSplitHarmony(splits.harmony !== "0.00" ? splits.harmony.replace(".", ",") : "");
          setters.setSplitTinchen(splits.tinchen !== "0.00" ? splits.tinchen.replace(".", ",") : "");
          setters.setSplitRS("");
          setters.setSplitPrivat("");
        }
      }
    }
  } catch (e) {
    setters.setLastError(String(e));
  }
}
