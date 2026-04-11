import React from "react";
import BelegFormular from "./BelegFormular";
import BelegErkennungPanel from "./BelegErkennungPanel";
import PdfViewer from "./PdfViewer";
import { appStyles as styles } from "../../styles/appStyles";
import type { Beleg } from "../../lib/belege";
import type { Tab } from "../../types";
import { cardStyle } from "../../design/styles";
import BelegeTabToolbar from "./components/BelegeTabToolbar";
import { findeDatevKontoZuLieferant } from "../../lib/settings/localSettings";

type Zahlungsart = "bank" | "bar" | "offen" | "privat";

type Props = {
  baseFolder: string;
  chooseBaseFolder: () => void;
  checkUnbearbeitet: () => void;
  loading: boolean;
  year: string;
  setYear: (value: string) => void;
  activeFeWoId: string;
  setActiveFeWoId: (value: string) => void;
  belegReturnTab: Tab | null;
  setActiveTab: (tab: Tab) => void;
  fewos: { id: string; name: string }[];
  bankkonten: { id: string; bezeichnung: string }[];
  unbearbeitetFiles: string[];
  lastError: string;
  loadPdf: (filename: string) => void;
  loadGespeichertenBeleg: (beleg: Beleg) => void;

  selectedPdfBytes: number[] | null;
  selectedFilename: string;
  totalPages: number;
  setSelectedPdfBytes: (value: number[] | null) => void;
  setSelectedFilename: (value: string) => void;
  currentPage: number;
  zoom: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  setZoom: React.Dispatch<React.SetStateAction<number>>;

  lieferant: string;
  setLieferant: (value: string) => void;
  belegDatum: string;
  setBelegDatum: (value: string) => void;
  betrag: string;
  setBetrag: (value: string) => void;
  rechnungsnummer: string;
  setRechnungsnummer: (value: string) => void;
  lieferantDatevMerken: boolean;
  setLieferantDatevMerken: (value: boolean) => void;

  splitMode: boolean;
  setSplitMode: (value: boolean) => void;
  splitTina: string;
  setSplitTina: (value: string) => void;
  splitHarmony: string;
  setSplitHarmony: (value: string) => void;
  splitTinchen: string;
  setSplitTinchen: (value: string) => void;
  splitRS: string;
  setSplitRS: (value: string) => void;
  splitPrivat: string;
  setSplitPrivat: (value: string) => void;

  kategorie: string;
  setKategorie: (value: string) => void;
  notiz: string;
  setNotiz: (value: string) => void;

  zahlungsart: Zahlungsart;
  setZahlungsart: (value: Zahlungsart) => void;
  bankkontoId: string;
  setBankkontoId: (value: string) => void;
  manuellesZahldatum: string;
  setManuellesZahldatum: (value: string) => void;

  onSpeichern: () => void;
  onVerschiebenSonstiges: () => void;

  erkannteDaten: {
    lieferant: string;
    datum: string;
    betrag: string;
    rechnungsnummer: string;
  };
  erkannterText: string;
  ocrStatus: string;
  setOcrStatus: (value: string) => void;
  runOcrTest: () => void;
};

export default function BelegeTab(props: Props) {
  const {
    baseFolder,
    chooseBaseFolder,
    checkUnbearbeitet,
    loading,
    year,
    setYear,
    activeFeWoId,
    setActiveFeWoId,
    fewos,
    bankkonten,
    unbearbeitetFiles,
    lastError,
    loadPdf,

    selectedPdfBytes,
    selectedFilename,
    totalPages,
    currentPage,
    zoom,
    setCurrentPage,
    setZoom,

    lieferant,
    setLieferant,
    belegDatum,
    setBelegDatum,
    betrag,
    setBetrag,
    rechnungsnummer,
    setRechnungsnummer,
    lieferantDatevMerken,
    setLieferantDatevMerken,

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
    manuellesZahldatum,
    setManuellesZahldatum,

    onSpeichern,
    onVerschiebenSonstiges,

    erkannteDaten,
    erkannterText,
    ocrStatus,
    setOcrStatus,
    runOcrTest,
  } = props;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 16,
        height: "100%",
        minHeight: 0,
        overflow: "hidden",
      }}
    >
      {!selectedPdfBytes && (
        <BelegeTabToolbar
          year={year}
          setYear={setYear}
          chooseBaseFolder={chooseBaseFolder}
          checkUnbearbeitet={checkUnbearbeitet}
          loading={loading}
          baseFolder={baseFolder}
          unbearbeitetFiles={unbearbeitetFiles}
          selectedPdfBytes={selectedPdfBytes}
          loadPdf={loadPdf}
        />
      )}

      {lastError && <div style={styles.error}>Fehler: {lastError}</div>}

      {selectedPdfBytes && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 16,
            flex: 1,
            minHeight: 0,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0, 1.2fr) minmax(560px, 1fr)",
              gap: 16,
              alignItems: "stretch",
              flex: 1,
              minHeight: 0,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                ...cardStyle,
                minWidth: 0,
                height: "100%",
                minHeight: 0,
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
              }}
            >
              <PdfViewer
                selectedPdfBytes={selectedPdfBytes}
                totalPages={totalPages}
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                zoom={zoom}
                setZoom={setZoom}
              />
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "minmax(0, 1fr) minmax(260px, 0.8fr)",
                gap: 16,
                minWidth: 0,
                alignItems: "stretch",
                height: "100%",
                minHeight: 0,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  ...cardStyle,
                  minHeight: 0,
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  overflow: "hidden",
                }}
              >
                <BelegFormular
                  key={selectedFilename}
                  lieferant={lieferant}
                  setLieferant={setLieferant}
                  belegDatum={belegDatum}
                  setBelegDatum={setBelegDatum}
                  betrag={betrag}
                  setBetrag={setBetrag}
                  rechnungsnummer={rechnungsnummer}
                  setRechnungsnummer={setRechnungsnummer}
                  lieferantDatevMerken={lieferantDatevMerken}
                  setLieferantDatevMerken={setLieferantDatevMerken}
                  splitMode={splitMode}
                  setSplitMode={setSplitMode}
                  splitTina={splitTina}
                  setSplitTina={setSplitTina}
                  splitHarmony={splitHarmony}
                  setSplitHarmony={setSplitHarmony}
                  splitTinchen={splitTinchen}
                  setSplitTinchen={setSplitTinchen}
                  splitRS={splitRS}
                  setSplitRS={setSplitRS}
                  splitPrivat={splitPrivat}
                  setSplitPrivat={setSplitPrivat}
                  kategorie={kategorie}
                  setKategorie={setKategorie}
                  notiz={notiz}
                  setNotiz={setNotiz}
                  zahlungsart={zahlungsart}
                  setZahlungsart={setZahlungsart}
                  bankkontoId={bankkontoId}
                  setBankkontoId={setBankkontoId}
                  bankkonten={bankkonten}
                  manuellesZahldatum={manuellesZahldatum}
                  setManuellesZahldatum={setManuellesZahldatum}
                  erkannterText={erkannterText}
                  activeFeWoId={activeFeWoId}
                  setActiveFeWoId={setActiveFeWoId}
                  fewos={fewos}
                  onSpeichern={onSpeichern}
                  onVerschiebenSonstiges={onVerschiebenSonstiges}
                />
              </div>

              <div
                style={{
                  ...cardStyle,
                  minHeight: 0,
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  overflow: "hidden",
                }}
              >
                <BelegErkennungPanel
                  erkannteDaten={erkannteDaten}
                  erkannterText={erkannterText}
                  ocrStatus={ocrStatus}
                  setOcrStatus={setOcrStatus}
                  runOcrTest={runOcrTest}
                  onTextAlsLieferantUebernehmen={(text) => {
                    setLieferant(text);
                    const gemerktesKonto = findeDatevKontoZuLieferant(text);
                    if (gemerktesKonto) {
                      setKategorie(gemerktesKonto);
                    }
                  }}
                  onTextAlsDatumUebernehmen={(text) => {
                    setBelegDatum(text);
                  }}
                  onTextAlsBetragUebernehmen={(text) => {
                    setBetrag(text);
                  }}
                  onTextAlsRechnungsnummerUebernehmen={(text) => {
                    setRechnungsnummer(text);
                  }}
                  onTextAlsNotizUebernehmen={(text) => {
                    setNotiz(text);
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
