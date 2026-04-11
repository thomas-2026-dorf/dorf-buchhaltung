import type { Beleg } from "../../lib/belege";
import type { Tab } from "../../types";
import { loadGespeicherterBelegHandler } from "./loadGespeicherterBelegHandler";

type Params = {
  baseFolder: string;
  beleg: Beleg;
  fewos: unknown[];
  returnTab?: Tab;
  setBelegReturnTab: (value: Tab | null) => void;
  setActiveTab: (value: Tab) => void;
  setSelectedPdfBytes: (value: number[] | null) => void;
  setCurrentPage: (value: number) => void;
  setLieferant: (value: string) => void;
  setBelegDatum: (value: string) => void;
  setBetrag: (value: string) => void;
  setRechnungsnummer: (value: string) => void;
  setKategorie: (value: string) => void;
  setNotiz: (value: string) => void;
  setZahlungsart: (value: "bank" | "bar" | "offen" | "privat") => void;
  setBankkontoId: (value: string) => void;
  setManuellesZahldatum: (value: string) => void;
  setLastError: (value: string) => void;
};

export async function runLoadGespeichertenBeleg({
  baseFolder,
  beleg,
  fewos,
  returnTab = "Belege",
  setBelegReturnTab,
  setActiveTab,
  setSelectedPdfBytes,
  setCurrentPage,
  setLieferant,
  setBelegDatum,
  setBetrag,
  setRechnungsnummer,
  setKategorie,
  setNotiz,
  setZahlungsart,
  setBankkontoId,
  setManuellesZahldatum,
  setLastError,
}: Params) {
  setBelegReturnTab(returnTab);
  setActiveTab("Belege");

  await loadGespeicherterBelegHandler({
    baseFolder,
    beleg,
    fewos,
    setters: {
      setSelectedPdfBytes,
      setCurrentPage,
      setLieferant,
      setBelegDatum,
      setBetrag,
      setRechnungsnummer,
      setKategorie,
      setNotiz,
      setZahlungsart,
      setBankkontoId,
      setManuellesZahldatum,
      setLastError,
    },
  });
}
