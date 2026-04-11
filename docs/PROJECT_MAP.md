# FeWo Buchhaltung – Projektübersicht

Automatisch generiert mit npm run map
Stand: 2026-04-11 07:05:16

--------------------------------------
MODULE
--------------------------------------
- src/modules/ausgang/AusgangFormular.tsx
  → Formular für Ausgangsrechnungen
- src/modules/ausgang/AusgangListe.tsx
  → Liste der Ausgangsrechnungen
- src/modules/ausgang/AusgangTab.tsx
  → Hauptansicht für Ausgangsrechnungen
- src/modules/ausgang/AusgangTabWrapper.tsx
  → Noch nicht beschrieben
- src/modules/auswertung/AuswertungFilterPanel.tsx
  → Noch nicht beschrieben
- src/modules/auswertung/AuswertungTab.tsx
  → Auswertungsansicht
- src/modules/auswertung/AuswertungTabWrapper.tsx
  → Noch nicht beschrieben
- src/modules/auswertung/auswertungUtils.ts
  → Hilfsfunktionen für Auswertungen
- src/modules/bank-ui/BankImportPanel.tsx
  → Datei im Bankmodul
- src/modules/bank-ui/BankTab.tsx
  → Datei im Bankmodul
- src/modules/bank-ui/components/BankAssignmentsDebug.tsx
  → Datei im Bankmodul
- src/modules/bank-ui/components/BankBookingCard.tsx
  → Datei im Bankmodul
- src/modules/bank-ui/components/BankBookingCardShell.tsx
  → Datei im Bankmodul
- src/modules/bank-ui/components/BankImportIntro.tsx
  → Datei im Bankmodul
- src/modules/bank-ui/components/BankImportMetaCard.tsx
  → Datei im Bankmodul
- src/modules/bank-ui/components/BankImportOverview.tsx
  → Datei im Bankmodul
- src/modules/bank-ui/components/BankImportStatusCard.tsx
  → Datei im Bankmodul
- src/modules/bank-ui/debug.ts
  → Debug-Helfer für den Bankbereich
- src/modules/bank-ui/lib/applyAddSplitBelegChange.ts
  → Datei im Bankmodul
- src/modules/bank-ui/lib/applyAnzahlungChange.ts
  → Datei im Bankmodul
- src/modules/bank-ui/lib/applyAssignChange.ts
  → Datei im Bankmodul
- src/modules/bank-ui/lib/applyFewoChange.ts
  → Datei im Bankmodul
- src/modules/bank-ui/lib/applyKundennrChange.ts
  → Datei im Bankmodul
- src/modules/bank-ui/lib/applyRemarkChange.ts
  → Datei im Bankmodul
- src/modules/bank-ui/lib/applySearchSuggestion.ts
  → Datei im Bankmodul
- src/modules/bank-ui/lib/applySearchValueChange.ts
  → Datei im Bankmodul
- src/modules/bank-ui/lib/applySplitBetragChange.ts
  → Datei im Bankmodul
- src/modules/bank-ui/lib/bankImportHelpers.ts
  → Datei im Bankmodul
- src/modules/bank-ui/lib/buildAssignmentsAfterBelegReset.ts
  → Datei im Bankmodul
- src/modules/bank-ui/lib/buildBankSavePayload.ts
  → Datei im Bankmodul
- src/modules/bank-ui/lib/buildJahresdateiAfterBelegReset.ts
  → Datei im Bankmodul
- src/modules/bank-ui/lib/buildRemarkAssignmentsUpdate.ts
  → Datei im Bankmodul
- src/modules/bank-ui/lib/buildSplitBetragAssignmentsUpdate.ts
  → Datei im Bankmodul
- src/modules/bank-ui/lib/buildSuggestionMap.ts
  → Datei im Bankmodul
- src/modules/bank-ui/lib/findBelegToOpen.ts
  → Datei im Bankmodul
- src/modules/bank-ui/lib/getAddSplitBelegResult.ts
  → Datei im Bankmodul
- src/modules/bank-ui/lib/getFilteredBelege.ts
  → Datei im Bankmodul
- src/modules/bank-ui/lib/getHandleAssignResult.ts
  → Datei im Bankmodul
- src/modules/bank-ui/lib/handleRemarkChange.ts
  → Datei im Bankmodul
- src/modules/bank-ui/lib/loadBankBelege.ts
  → Datei im Bankmodul
- src/modules/bank-ui/lib/loadExistingAssignmentsForImport.ts
  → Datei im Bankmodul
- src/modules/bank-ui/lib/mapOriginalBelegeToBelegData.ts
  → Datei im Bankmodul
- src/modules/bank-ui/lib/prepareImportData.ts
  → Datei im Bankmodul
- src/modules/bank-ui/lib/prepareImportSession.ts
  → Datei im Bankmodul
- src/modules/bank-ui/lib/prepareImportedBookings.ts
  → Datei im Bankmodul
- src/modules/bank-ui/lib/removeSplitBeleg.ts
  → Datei im Bankmodul
- src/modules/bank-ui/lib/utils.ts
  → Allgemeine Hilfsfunktionen des Moduls
- src/modules/bank-ui/loadAllBankJsons.ts
  → Datei im Bankmodul
- src/modules/bank-ui/types/bankSlimTypes.ts
  → Datei im Bankmodul
- src/modules/bank/kontoCsv.ts
  → CSV-Helfer für Kontodaten aus dem Bankbereich
- src/modules/bank/matching.ts
  → Logik zur Zuordnung von Bankbuchungen und Belegen
- src/modules/bank/types.ts
  → Datei im Bankmodul
- src/modules/belegSuche/BelegSuchePanel.tsx
  → Suche über gespeicherte Belege
- src/modules/belegSuche/SucheTab.tsx
  → Noch nicht beschrieben
- src/modules/belegVerwaltung/BelegErkennungPanel.tsx
  → Anzeige der OCR- und Belegerkennung
- src/modules/belegVerwaltung/BelegFormular.tsx
  → Formular zur Erfassung und Bearbeitung von Belegen
- src/modules/belegVerwaltung/BelegListe.tsx
  → Liste der gespeicherten Belege
- src/modules/belegVerwaltung/BelegeTab.tsx
  → Hauptansicht für Belegverwaltung
- src/modules/belegVerwaltung/BelegeTabWrapper.tsx
  → Datei im Belegverwaltungsmodul
- src/modules/belegVerwaltung/PdfViewer.tsx
  → PDF-Anzeige im Belegbereich
- src/modules/belegVerwaltung/belegAppHelpers.ts
  → Datei im Belegverwaltungsmodul
- src/modules/belegVerwaltung/bereinigeVerwaisteBelege.ts
  → Datei im Belegverwaltungsmodul
- src/modules/belegVerwaltung/components/BelegFormularActions.tsx
  → Datei im Belegverwaltungsmodul
- src/modules/belegVerwaltung/components/BelegFormularBasisfelder.tsx
  → Datei im Belegverwaltungsmodul
- src/modules/belegVerwaltung/components/BelegFormularHeader.tsx
  → Datei im Belegverwaltungsmodul
- src/modules/belegVerwaltung/components/BelegFormularZuordnung.tsx
  → Datei im Belegverwaltungsmodul
- src/modules/belegVerwaltung/components/BelegSplitInputs.tsx
  → Datei im Belegverwaltungsmodul
- src/modules/belegVerwaltung/components/BelegTextUebernahmePanel.tsx
  → Datei im Belegverwaltungsmodul
- src/modules/belegVerwaltung/components/BelegeTabHeader.tsx
  → Datei im Belegverwaltungsmodul
- src/modules/belegVerwaltung/components/BelegeTabToolbar.tsx
  → Datei im Belegverwaltungsmodul
- src/modules/belegVerwaltung/loadGespeicherterBelegHandler.ts
  → Lädt bereits gespeicherte PDFs
- src/modules/belegVerwaltung/loadPdfHandler.ts
  → Lädt PDF aus Unbearbeitet
- src/modules/belegVerwaltung/moveSonstigesHandler.ts
  → Verschiebt sonstige Dokumente aus dem Belegbereich
- src/modules/belegVerwaltung/resetBelegForm.ts
  → Setzt Belegformular auf Anfangszustand zurück
- src/modules/belegVerwaltung/runHandleSpeichern.ts
  → Datei im Belegverwaltungsmodul
- src/modules/belegVerwaltung/runLoadGespeichertenBeleg.ts
  → Datei im Belegverwaltungsmodul
- src/modules/belegVerwaltung/runLoadPdf.ts
  → Datei im Belegverwaltungsmodul
- src/modules/belegVerwaltung/runOcrTestAction.ts
  → Datei im Belegverwaltungsmodul
- src/modules/belegVerwaltung/runVerschiebenSonstiges.ts
  → Datei im Belegverwaltungsmodul
- src/modules/belegVerwaltung/saveBelegHandler.ts
  → Speicherlogik für Belege
- src/modules/belegVerwaltung/useBelege.ts
  → Hook/Helfer für Belegdaten und Belegstatus
- src/modules/belegVerwaltung/utils.ts
  → Allgemeine Hilfsfunktionen des Moduls
- src/modules/datev/DatevExportPanel.tsx
  → Oberfläche für DATEV-Export
- src/modules/datev/datevCsv.ts
  → Erzeugt DATEV-CSV
- src/modules/datev/konten.ts
  → Kontenlisten und DATEV-Kontologik
- src/modules/export/ExportTab.tsx
  → Hauptansicht für Exporte
- src/modules/export/ExportTabWrapper.tsx
  → Datei im Exportmodul
- src/modules/export/bankJsonLoader.ts
  → Datei im Exportmodul
- src/modules/export/bankMonatsExport.ts
  → Exportiert Monatsdaten aus dem Bankbereich
- src/modules/export/belegCsv.ts
  → Erzeugt Beleg-CSV
- src/modules/export/buildBankKontrollRows.ts
  → Datei im Exportmodul
- src/modules/export/buildBelegZahlungenMap.ts
  → Datei im Exportmodul
- src/modules/export/buildKontoExportDataFromJson.ts
  → Datei im Exportmodul
- src/modules/export/buildSplitTextLines.ts
  → Datei im Exportmodul
- src/modules/export/collectBankBelegIds.ts
  → Datei im Exportmodul
- src/modules/export/deriveFewoStampInfo.ts
  → Datei im Exportmodul
- src/modules/export/exportFormatters.ts
  → Datei im Exportmodul
- src/modules/export/exportHandlers.ts
  → Startet und steuert Exportabläufe
- src/modules/export/findPdfFilesRecursive.ts
  → Datei im Exportmodul
- src/modules/export/helpers/buildSplitTextLines.ts
  → Datei im Exportmodul
- src/modules/export/helpers/buildZahlungsText.ts
  → Datei im Exportmodul
- src/modules/export/helpers/collectBankBelegData.ts
  → Datei im Exportmodul
- src/modules/export/helpers/findPdfsRecursive.ts
  → Datei im Exportmodul
- src/modules/export/helpers/formatHelpers.ts
  → Datei im Exportmodul
- src/modules/export/helpers/getFewoLabelAndObjektNr.ts
  → Datei im Exportmodul
- src/modules/export/helpers/pathHelpers.ts
  → Datei im Exportmodul
- src/modules/export/kontrollXlsx.ts
  → Erzeugt Kontroll-XLSX
- src/modules/export/runExportActions.ts
  → Datei im Exportmodul
- src/modules/export/runPdfSammelExport.ts
  → Datei im Exportmodul
- src/modules/export/runSimpleExports.ts
  → Datei im Exportmodul
- src/modules/export/runStbGesamtExport.ts
  → Datei im Exportmodul
- src/modules/export/stbExportFolders.ts
  → Datei im Exportmodul
- src/modules/korrektur/KorrekturFilterPanel.tsx
  → Noch nicht beschrieben
- src/modules/korrektur/KorrekturTab.tsx
  → Massenkorrektur für Konto und Kategorie
- src/modules/korrektur/KorrekturTabWrapper.tsx
  → Noch nicht beschrieben
- src/modules/settings/SettingsTab.tsx
  → Oberfläche für Einstellungen
- src/modules/settings/SettingsTabWrapper.tsx
  → Datei im Einstellungsmodul
- src/modules/settings/components/SettingsAppInfo.tsx
  → Datei im Einstellungsmodul
- src/modules/settings/components/SettingsEinheitenPanel.tsx
  → Datei im Einstellungsmodul
- src/modules/settings/components/SettingsKontenPanel.tsx
  → Datei im Einstellungsmodul
- src/modules/settings/components/SettingsLocalPanel.tsx
  → Datei im Einstellungsmodul

--------------------------------------
KOMPONENTEN
--------------------------------------
- src/components/ActiveTabHeader.tsx
  → UI-Komponente
- src/components/AppHeader.tsx
  → Kopfbereich der App
- src/components/AppLayout.tsx
  → Grundlayout der App
- src/components/AppMainCardHeader.tsx
  → UI-Komponente
- src/components/AppSidebar.tsx
  → Seitennavigation der App
- src/components/MainCard.tsx
  → UI-Komponente
- src/components/PlaceholderTab.tsx
  → UI-Komponente
- src/components/SidebarButton.tsx
  → Einzelner Navigationsbutton
- src/components/TestbetriebBanner.tsx
  → UI-Komponente

--------------------------------------
LIB / HELFER
--------------------------------------
- src/lib/ausgangsrechnungen.ts
  → Hilfsfunktionen für Ausgangsrechnungen
- src/lib/belegErkennung.ts
  → Erkennung und Auswertung von Belegdaten
- src/lib/belegErkennungHelpers.ts
  → Zentrale Hilfsdatei
- src/lib/belege.ts
  → Zentrale Beleg-Helfer
- src/lib/erloesErkennung.ts
  → Hilfslogik zur Erlöserkennung
- src/lib/erloesErkennungHelpers.ts
  → Zentrale Hilfsdatei
- src/lib/exportFolder.ts
  → Hilfslogik für Exportordner
- src/lib/exportSinglePdf.ts
  → Exportiert einzelne PDF-Dateien
- src/lib/fewo.ts
  → FeWo-bezogene Hilfsfunktionen und Stammdaten
- src/lib/jahresdatei.ts
  → Hilfslogik für Jahresdateien
- src/lib/pdf.ts
  → Allgemeine PDF-Helfer
- src/lib/pdfStamp.ts
  → Stempelt PDFs mit Buchungsinformationen
- src/lib/pdfTextSelection.ts
  → Zentrale Hilfsdatei
- src/lib/settings/appSettings.ts
  → Typen und Standardwerte für App-Einstellungen
- src/lib/settings/appSettingsStorage.ts
  → Laden und Speichern der App-Einstellungen
- src/lib/settings/einheiten.ts
  → Hilfslogik für Einheiten/Stammdaten
- src/lib/settings/localSettings.ts
  → Lokale Regeln und kleine dauerhafte Einstellungen
- src/lib/settings/pathUtils.ts
  → Hilfsfunktionen für Pfade und Ordner
- src/lib/storage.ts
  → Zentrale lokale Speicher-Helfer

--------------------------------------
SCRIPTS
--------------------------------------
- scripts/context-report.sh
  → Noch nicht beschrieben
- scripts/debug-report.sh
  → Noch nicht beschrieben
- scripts/generate-project-map.sh
  → Noch nicht beschrieben
- scripts/status-report.sh
  → Noch nicht beschrieben

--------------------------------------
ENDE
