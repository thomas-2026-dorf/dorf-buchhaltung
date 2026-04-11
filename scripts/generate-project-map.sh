#!/bin/bash

OUT="docs/PROJECT_MAP.md"

describe_file() {
  local file="$1"
  local base
  base=$(basename "$file")

  case "$base" in
    BelegeTab.tsx) echo "Hauptansicht für Belegverwaltung" ;;
    BelegFormular.tsx) echo "Formular zur Erfassung und Bearbeitung von Belegen" ;;
    BelegListe.tsx) echo "Liste der gespeicherten Belege" ;;
    BelegErkennungPanel.tsx) echo "Anzeige der OCR- und Belegerkennung" ;;
    PdfViewer.tsx) echo "PDF-Anzeige im Belegbereich" ;;
    saveBelegHandler.ts) echo "Speicherlogik für Belege" ;;
    moveSonstigesHandler.ts) echo "Verschiebt sonstige Dokumente aus dem Belegbereich" ;;
    loadPdfHandler.ts) echo "Lädt PDF aus Unbearbeitet" ;;
    loadGespeicherterBelegHandler.ts) echo "Lädt bereits gespeicherte PDFs" ;;
    resetBelegForm.ts) echo "Setzt Belegformular auf Anfangszustand zurück" ;;
    useBelege.ts) echo "Hook/Helfer für Belegdaten und Belegstatus" ;;
    utils.ts) echo "Allgemeine Hilfsfunktionen des Moduls" ;;

    SettingsTab.tsx) echo "Oberfläche für Einstellungen" ;;

    KorrekturTab.tsx) echo "Massenkorrektur für Konto und Kategorie" ;;

    AusgangTab.tsx) echo "Hauptansicht für Ausgangsrechnungen" ;;
    AusgangFormular.tsx) echo "Formular für Ausgangsrechnungen" ;;
    AusgangListe.tsx) echo "Liste der Ausgangsrechnungen" ;;

    AuswertungTab.tsx) echo "Auswertungsansicht" ;;
    auswertungUtils.ts) echo "Hilfsfunktionen für Auswertungen" ;;

    BankImportPanelNeu.tsx) echo "Oberfläche für Bankimport und Zuordnung" ;;
    matching.ts) echo "Logik zur Zuordnung von Bankbuchungen und Belegen" ;;
    kontoCsv.ts) echo "CSV-Helfer für Kontodaten aus dem Bankbereich" ;;
    debug.ts) echo "Debug-Helfer für den Bankbereich" ;;

    DatevExportPanel.tsx) echo "Oberfläche für DATEV-Export" ;;
    datevCsv.ts) echo "Erzeugt DATEV-CSV" ;;
    konten.ts) echo "Kontenlisten und DATEV-Kontologik" ;;

    ExportTab.tsx) echo "Hauptansicht für Exporte" ;;
    exportHandlers.ts) echo "Startet und steuert Exportabläufe" ;;
    belegCsv.ts) echo "Erzeugt Beleg-CSV" ;;
    kontrollXlsx.ts) echo "Erzeugt Kontroll-XLSX" ;;
    bankMonatsExport.ts) echo "Exportiert Monatsdaten aus dem Bankbereich" ;;

    BelegSuchePanel.tsx) echo "Suche über gespeicherte Belege" ;;

    AppLayout.tsx) echo "Grundlayout der App" ;;
    AppHeader.tsx) echo "Kopfbereich der App" ;;
    AppSidebar.tsx) echo "Seitennavigation der App" ;;
    SidebarButton.tsx) echo "Einzelner Navigationsbutton" ;;

    appSettings.ts) echo "Typen und Standardwerte für App-Einstellungen" ;;
    appSettingsStorage.ts) echo "Laden und Speichern der App-Einstellungen" ;;
    localSettings.ts) echo "Lokale Regeln und kleine dauerhafte Einstellungen" ;;
    einheiten.ts) echo "Hilfslogik für Einheiten/Stammdaten" ;;
    pathUtils.ts) echo "Hilfsfunktionen für Pfade und Ordner" ;;
    storage.ts) echo "Zentrale lokale Speicher-Helfer" ;;
    pdfStamp.ts) echo "Stempelt PDFs mit Buchungsinformationen" ;;
    exportSinglePdf.ts) echo "Exportiert einzelne PDF-Dateien" ;;
    exportFolder.ts) echo "Hilfslogik für Exportordner" ;;
    pdf.ts) echo "Allgemeine PDF-Helfer" ;;
    belege.ts) echo "Zentrale Beleg-Helfer" ;;
    belegErkennung.ts) echo "Erkennung und Auswertung von Belegdaten" ;;
    fewo.ts) echo "FeWo-bezogene Hilfsfunktionen und Stammdaten" ;;
    jahresdatei.ts) echo "Hilfslogik für Jahresdateien" ;;
    ausgangsrechnungen.ts) echo "Hilfsfunktionen für Ausgangsrechnungen" ;;
    erloesErkennung.ts) echo "Hilfslogik zur Erlöserkennung" ;;

    *)
      if [[ "$file" == src/modules/belegVerwaltung/* ]]; then
        echo "Datei im Belegverwaltungsmodul"
      elif [[ "$file" == src/modules/bank*/* ]]; then
        echo "Datei im Bankmodul"
      elif [[ "$file" == src/modules/export/* ]]; then
        echo "Datei im Exportmodul"
      elif [[ "$file" == src/modules/datev/* ]]; then
        echo "Datei im DATEV-Modul"
      elif [[ "$file" == src/modules/settings/* ]]; then
        echo "Datei im Einstellungsmodul"
      elif [[ "$file" == src/lib/settings/* ]]; then
        echo "Datei für Einstellungen und lokale Regeln"
      elif [[ "$file" == src/lib/* ]]; then
        echo "Zentrale Hilfsdatei"
      elif [[ "$file" == src/components/* ]]; then
        echo "UI-Komponente"
      else
        echo "Noch nicht beschrieben"
      fi
      ;;
  esac
}

write_section() {
  local title="$1"
  local folder="$2"

  echo "--------------------------------------" >> "$OUT"
  echo "$title" >> "$OUT"
  echo "--------------------------------------" >> "$OUT"

  if [ -d "$folder" ]; then
    find "$folder" -type f | sort | while read -r file; do
      echo "- $file" >> "$OUT"
      echo "  → $(describe_file "$file")" >> "$OUT"
    done
  else
    echo "(Ordner nicht gefunden)" >> "$OUT"
  fi

  echo "" >> "$OUT"
}

echo "# FeWo Buchhaltung – Projektübersicht" > "$OUT"
echo "" >> "$OUT"
echo "Automatisch generiert mit npm run map" >> "$OUT"
echo "Stand: $(date '+%Y-%m-%d %H:%M:%S')" >> "$OUT"
echo "" >> "$OUT"

write_section "MODULE" "src/modules"
write_section "KOMPONENTEN" "src/components"
write_section "LIB / HELFER" "src/lib"
write_section "SCRIPTS" "scripts"

echo "--------------------------------------" >> "$OUT"
echo "ENDE" >> "$OUT"

echo "PROJECT_MAP.md wurde aktualisiert."