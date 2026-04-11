import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";

type Zahlungsart = "bank" | "bar" | "offen" | "privat";

export function useBelege() {
  const [unbearbeitetFiles, setUnbearbeitetFiles] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastError, setLastError] = useState("");

  const [selectedFilename, setSelectedFilename] = useState("");
  const [selectedPdfBytes, setSelectedPdfBytes] = useState<number[] | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [zoom, setZoom] = useState(1);

  const [lieferant, setLieferant] = useState("");
  const [belegDatum, setBelegDatum] = useState("");
  const [betrag, setBetrag] = useState("");

  const [splitMode, setSplitMode] = useState(false);
  const [splitTina, setSplitTina] = useState("");
  const [splitHarmony, setSplitHarmony] = useState("");
  const [splitTinchen, setSplitTinchen] = useState("");
  const [splitRS, setSplitRS] = useState("");
  const [splitPrivat, setSplitPrivat] = useState("");

  const [kategorie, setKategorie] = useState("");
  const [notiz, setNotiz] = useState("");

  const [zahlungsart, setZahlungsart] = useState<Zahlungsart>("bank");
  const [bankkontoId, setBankkontoId] = useState("");

  const [erkannterText, setErkannterText] = useState("");
  const [erkannteDaten, setErkannteDaten] = useState({
    lieferant: "",
    datum: "",
    betrag: "",
    rechnungsnummer: "",
  });

  const [ocrStatus, setOcrStatus] = useState("");

  async function checkUnbearbeitet(baseFolder: string, year: string) {
    setLastError("");

    if (!baseFolder) {
      alert("Bitte zuerst einen Basisordner wählen.");
      return;
    }

    setLoading(true);

    try {
      const files = await invoke<string[]>("list_unbearbeitet", {
        baseFolder,
        year,
      });

      const pdfFiles = files.filter((f) => f.toLowerCase().endsWith(".pdf"));
      setUnbearbeitetFiles(pdfFiles);
    } catch (e) {
      setLastError(String(e));
      alert("Fehler: " + String(e));
    } finally {
      setLoading(false);
    }
  }

  return {
    unbearbeitetFiles,
    setUnbearbeitetFiles,
    loading,
    setLoading,
    lastError,
    setLastError,
    selectedFilename,
    setSelectedFilename,
    selectedPdfBytes,
    setSelectedPdfBytes,
    currentPage,
    setCurrentPage,
    totalPages,
    setTotalPages,
    zoom,
    setZoom,
    lieferant,
    setLieferant,
    belegDatum,
    setBelegDatum,
    betrag,
    setBetrag,
    splitMode,
    setSplitMode,
    splitTina,
    setSplitTina,
    splitHarmony,
    setSplitHarmony,
    splitTinchen,
    setSplitTinchen,
    splitRS,
    setSplitRS,
    splitPrivat,
    setSplitPrivat,
    kategorie,
    setKategorie,
    notiz,
    setNotiz,
    zahlungsart,
    setZahlungsart,
    bankkontoId,
    setBankkontoId,
    erkannterText,
    setErkannterText,
    erkannteDaten,
    setErkannteDaten,
    ocrStatus,
    setOcrStatus,
    checkUnbearbeitet,
  };
}
