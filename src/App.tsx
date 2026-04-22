import { useMemo, useState } from "react";
import "./App.css";

import { type Beleg } from "./lib/belege";
import type { Tab, FeWo } from "./types";
import { appStyles as styles } from "./styles/appStyles";
import BelegeTabWrapper from "./modules/belegVerwaltung/BelegeTabWrapper";
import BelegeTabHeader from "./modules/belegVerwaltung/components/BelegeTabHeader";
import AppHeader from "./components/AppHeader";
import PlaceholderTab from "./components/PlaceholderTab";
import TestbetriebBanner from "./components/TestbetriebBanner";
import MainCard from "./components/MainCard";
import AppMainCardHeader from "./components/AppMainCardHeader";
import { useBelege } from "./modules/belegVerwaltung/useBelege";
import AusgangTabWrapper from "./modules/ausgang/AusgangTabWrapper";
import BankTab from "./modules/bank-ui/BankTab";
import ExportTabWrapper from "./modules/export/ExportTabWrapper";
import { runBelegExportAction, runKontoExportAction } from "./modules/export/runSimpleExports";
import { runVerschiebenSonstiges } from "./modules/belegVerwaltung/runVerschiebenSonstiges";
import { runOcrTestAction } from "./modules/belegVerwaltung/runOcrTestAction";
import { runLoadPdf } from "./modules/belegVerwaltung/runLoadPdf";
import { runLoadGespeichertenBeleg } from "./modules/belegVerwaltung/runLoadGespeichertenBeleg";
import { runHandleSpeichern } from "./modules/belegVerwaltung/runHandleSpeichern";
import AuswertungTabWrapper from "./modules/auswertung/AuswertungTabWrapper";
import { runPdfExportAction, runStbGesamtExportAction } from "./modules/export/runExportActions";
import SucheTab from "./modules/belegSuche/SucheTab";
import SettingsTabWrapper from "./modules/settings/SettingsTabWrapper";
import { getFewoAuswahlliste } from "./lib/settings/einheiten";
import { ladeAppSettings } from "./lib/settings/appSettingsStorage";
import KorrekturTabWrapper from "./modules/korrektur/KorrekturTabWrapper";
import KassenTab from "./modules/kassen/KassenTab";

import { useTestBetriebStatus } from "./hooks/useTestBetriebStatus";
import { useBaseFolder } from "./hooks/useBaseFolder";
import { usePdfRenderEffect } from "./hooks/usePdfRenderEffect";
import { useOcr } from "./hooks/useOcr";
import { shouldShowPlaceholderTab } from "./helpers/tabHelpers";
import { getActiveFeWo } from "./helpers/fewoHelpers";
import { useBereinigeVerwaisteBelegeEffect } from "./hooks/useBereinigeVerwaisteBelegeEffect";

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>("Belege");

  const appSettings = useMemo(() => ladeAppSettings(), [activeTab]);
  const fewos: FeWo[] = useMemo(() => getFewoAuswahlliste(appSettings), [appSettings]);
  const bankkonten = useMemo(
    () => (appSettings.bankkonten || []).map((konto) => ({
      id: konto.id,
      bezeichnung: konto.bezeichnung,
    })),
    [appSettings]
  );
  const [activeFeWoId, setActiveFeWoId] = useState<string>("");
  const [belegReturnTab, setBelegReturnTab] = useState<Tab | null>(null);
  const [year, setYear] = useState("2026");
  const [rechnungsnummer, setRechnungsnummer] = useState("");
  const [lieferantDatevMerken, setLieferantDatevMerken] = useState(false);

  const activeFeWo = getActiveFeWo(fewos, activeFeWoId);

  const [manuellesZahldatum, setManuellesZahldatum] = useState("");
  const [pdfExportLoading, setPdfExportLoading] = useState(false);

  const {
    unbearbeitetFiles,
    loading,
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
  } = useBelege();

  const {
    baseFolder,
    chooseBaseFolder: chooseBaseFolderRaw,
  } = useBaseFolder(setLastError);

  function getYearFromBaseFolder(pathValue: string): string {
    const normalized = String(pathValue || "").replace(/\\/g, "/").replace(/\/+$/, "");
    const match = normalized.match(/\/(20\d{2})$/);
    return match?.[1] || "";
  }

  async function chooseBaseFolder() {
    const selected = await chooseBaseFolderRaw();
    const folderToUse = selected || baseFolder;

    if (!folderToUse) return;

    const detectedYear = getYearFromBaseFolder(folderToUse);

    if (detectedYear) {
      setYear(detectedYear);
    }

    await checkUnbearbeitet(folderToUse, detectedYear || year);
  }

  const { testBetriebAktiv, refreshTestBetriebStatus } = useTestBetriebStatus({
    baseFolder,
    year,
  });

  usePdfRenderEffect({
    selectedPdfBytes,
    currentPage,
    zoom,
    setTotalPages,
    setLastError,
  });

  const { runOcrForFilename } = useOcr({
    baseFolder,
    year,
    setErkannterText,
    setErkannteDaten,
    setLieferant,
    setOcrStatus,
  });

  useBereinigeVerwaisteBelegeEffect({
    baseFolder,
    year,
  });



  async function loadPdf(filenameInput: unknown) {
    await runLoadPdf({
      filenameInput,
      baseFolder,
      year,
      fewos,
      setLastError,
      setSelectedFilename,
      setSelectedPdfBytes,
      setCurrentPage,
      setLieferant,
      setBelegDatum,
      setBetrag,
      setRechnungsnummer,
      setErkannterText,
      setKategorie,
      setActiveFeWoId,
      setSplitMode,
      setSplitTina,
      setSplitHarmony,
      setSplitTinchen,
      setSplitRS,
      setSplitPrivat,
    });
  }

  async function loadGespeichertenBeleg(
    beleg: Beleg,
    returnTab: Tab = "Belege"
  ) {
    await runLoadGespeichertenBeleg({
      baseFolder,
      beleg,
      fewos,
      returnTab,
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
    });
  }

  async function runOcrTest() {
    await runOcrTestAction({
      selectedFilename,
      runOcrForFilename,
    });
  }

  async function handlePdfExport() {
    await runPdfExportAction({
      baseFolder,
      year,
      setPdfExportLoading,
    });
  }



  async function handleBelegExport() {
    await runBelegExportAction(baseFolder, year);
  }

  async function handleKontoExport() {
    await runKontoExportAction(baseFolder, year);
  }

  async function handleSpeichern() {
    await runHandleSpeichern({
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
      setBelegDatum,
      setBetrag,
      setRechnungsnummer,
      setLieferantDatevMerken,
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
    });
  }

  async function handleStbGesamtExport() {
    await runStbGesamtExportAction({
      handleKontoExport,
      handleBelegExport,
      handlePdfExport,
    });
  }

  const showPlaceholderTab = shouldShowPlaceholderTab(activeTab);

  const handleVerschiebenSonstiges = async () => {
    await runVerschiebenSonstiges({
      baseFolder,
      year,
      selectedFilename,
      checkUnbearbeitet: () => checkUnbearbeitet(baseFolder, year),
      setSelectedPdfBytes,
      setSelectedFilename,
    });
  };

  return (
    <div style={styles.page}>
      <AppHeader
        subtitleRight={baseFolder || "Kein Basisordner"}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <TestbetriebBanner visible={testBetriebAktiv} />

      <div style={styles.body}>
        <main style={styles.main}>
          <MainCard>
            <AppMainCardHeader
              activeTab={activeTab}
              belegHeaderExtra={
                activeTab === "Belege" && selectedPdfBytes ? (
                  <BelegeTabHeader
                    selectedFilename={selectedFilename}
                    setSelectedPdfBytes={setSelectedPdfBytes}
                    setSelectedFilename={setSelectedFilename}
                    belegReturnTab={belegReturnTab}
                    setActiveTab={setActiveTab}
                  />
                ) : null
              }
            />

            {activeTab === "Belege" && (
              <BelegeTabWrapper
                baseFolder={baseFolder}
                chooseBaseFolder={chooseBaseFolder}
                checkUnbearbeitet={() => checkUnbearbeitet(baseFolder, year)}
                loading={loading}
                year={year}
                setYear={setYear}
                activeFeWoId={activeFeWoId}
                setActiveFeWoId={setActiveFeWoId}
                belegReturnTab={belegReturnTab}
                setActiveTab={setActiveTab}
                fewos={fewos}
                bankkonten={bankkonten}
                unbearbeitetFiles={unbearbeitetFiles}
                lastError={lastError}
                loadPdf={loadPdf}
                loadGespeichertenBeleg={loadGespeichertenBeleg}
                selectedPdfBytes={selectedPdfBytes}
                selectedFilename={selectedFilename}
                setSelectedPdfBytes={setSelectedPdfBytes}
                setSelectedFilename={setSelectedFilename}
                totalPages={totalPages}
                currentPage={currentPage}
                zoom={zoom}
                setCurrentPage={setCurrentPage}
                setZoom={setZoom}
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
                manuellesZahldatum={manuellesZahldatum}
                setManuellesZahldatum={setManuellesZahldatum}
                onSpeichern={handleSpeichern}
                onVerschiebenSonstiges={handleVerschiebenSonstiges}
                erkannteDaten={erkannteDaten}
                erkannterText={erkannterText}
                ocrStatus={ocrStatus}
                setOcrStatus={setOcrStatus}
                runOcrTest={runOcrTest}
              />
            )}

            {activeTab === "Suche" && (
              <SucheTab
                loadGespeichertenBeleg={(beleg) =>
                  loadGespeichertenBeleg(beleg, "Suche")
                }
                baseFolder={baseFolder}
                year={year}
              />
            )}

            {activeTab === "Auswertung" && (
              <AuswertungTabWrapper baseFolder={baseFolder} year={year} />
            )}

            {activeTab === "Bank" && (
              <BankTab
                baseFolder={baseFolder}
                year={year}
              />
            )}

            {activeTab === "Export" && (
              <ExportTabWrapper
                onBelegExport={handleBelegExport}
                onPdfExport={handlePdfExport}
                onKontoExport={handleKontoExport}
                onStbExport={handleStbGesamtExport}
                pdfExportLoading={pdfExportLoading}
              />
            )}

            {activeTab === "Einstellungen" && (
              <SettingsTabWrapper
                year={year}
                onTestbetriebStatusChanged={refreshTestBetriebStatus}
              />
            )}

            {activeTab === "Korrektur" && (
              <KorrekturTabWrapper baseFolder={baseFolder} />
            )}

            {activeTab === "Ausgang" && (
              <AusgangTabWrapper baseFolder={baseFolder} year={year} />
            )}

            {activeTab === "Mitglieder" && <PlaceholderTab />}

            {activeTab === "Beiträge" && <PlaceholderTab />}

            {activeTab === "Kassen" && <KassenTab />}

            {activeTab === "Berichte" && <PlaceholderTab />}

            {showPlaceholderTab && <PlaceholderTab />}
          </MainCard>
        </main>
      </div>
    </div>
  );
}