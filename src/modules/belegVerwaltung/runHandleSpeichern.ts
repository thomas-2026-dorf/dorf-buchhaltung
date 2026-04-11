import type { FeWo } from "../../types";
import { saveBelegHandler } from "./saveBelegHandler";
import { resetBelegForm } from "./resetBelegForm";

type Params = {
  baseFolder: string;
  year: string;
  selectedFilename: string;
  lieferant: string;
  belegDatum: string;
  betrag: string;
  splitMode: boolean;
  splitTina: string;
  splitHarmony: string;
  splitTinchen: string;
  splitRS: string;
  splitPrivat: string;
  kategorie: string;
  notiz: string;
  zahlungsart: "bank" | "bar" | "offen" | "privat";
  bankkontoId: string;
  manuellesZahldatum: string;
  rechnungsnummer: string;
  lieferantDatevMerken: boolean;
  activeFeWo: FeWo;
  checkUnbearbeitet: (baseFolder: string, year: string) => Promise<void>;
  setLieferant: (value: string) => void;
  setLieferantDatevMerken: (value: boolean) => void;
  setBelegDatum: (value: string) => void;
  setBetrag: (value: string) => void;
  setRechnungsnummer: (value: string) => void;
  setSplitMode: (value: boolean) => void;
  setSplitTina: (value: string) => void;
  setSplitHarmony: (value: string) => void;
  setSplitTinchen: (value: string) => void;
  setSplitRS: (value: string) => void;
  setSplitPrivat: (value: string) => void;
  setKategorie: (value: string) => void;
  setNotiz: (value: string) => void;
  setZahlungsart: (value: "bank" | "bar" | "offen" | "privat") => void;
  setBankkontoId: (value: string) => void;
  setManuellesZahldatum: (value: string) => void;
  setErkannterText: (value: string) => void;
  setActiveFeWoId: (value: string) => void;
};

export async function runHandleSpeichern({
  baseFolder,
  year,
  selectedFilename,
  lieferant,
  belegDatum,
  betrag,
  splitMode,
  splitTina,
  splitHarmony,
  splitTinchen,
  splitRS,
  splitPrivat,
  kategorie,
  notiz,
  zahlungsart,
  bankkontoId,
  manuellesZahldatum,
  rechnungsnummer,
  lieferantDatevMerken,
  activeFeWo,
  checkUnbearbeitet,
  setLieferant,
  setLieferantDatevMerken,
  setBelegDatum,
  setBetrag,
  setRechnungsnummer,
  setSplitMode,
  setSplitTina,
  setSplitHarmony,
  setSplitTinchen,
  setSplitRS,
  setSplitPrivat,
  setKategorie,
  setNotiz,
  setZahlungsart,
  setBankkontoId,
  setManuellesZahldatum,
  setErkannterText,
  setActiveFeWoId,
}: Params) {
  await saveBelegHandler({
    baseFolder,
    year,
    selectedFilename,
    lieferant,
    belegDatum,
    betrag,
    splitMode,
    splitTina,
    splitHarmony,
    splitTinchen,
    splitRS,
    splitPrivat,
    kategorie,
    notiz,
    zahlungsart,
    bankkontoId,
    manuellesZahldatum,
    rechnungsnummer,
    lieferantDatevMerken,
    activeFeWo,
    checkUnbearbeitet,
    resetForm: () =>
      resetBelegForm({
        setLieferant,
        setLieferantDatevMerken,
        setBelegDatum,
        setBetrag,
        setRechnungsnummer,
        setSplitMode,
        setSplitTina,
        setSplitHarmony,
        setSplitTinchen,
        setSplitRS,
        setSplitPrivat,
        setKategorie,
        setNotiz,
        setZahlungsart,
        setBankkontoId,
        setManuellesZahldatum,
        setErkannterText,
        setActiveFeWoId,
      }),
  });
}
