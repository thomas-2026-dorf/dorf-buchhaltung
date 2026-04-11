import { open } from "@tauri-apps/plugin-dialog";

import { ladeBelegeAusJahresdatei } from "../../lib/belege";
import { exportStampedPdf } from "../../lib/exportSinglePdf";
import { buildBelegCsv, saveBelegMonatCsvToExport } from "./belegCsv";
import { buildKontoCsv, saveKontoCsvToExport } from "../bank/kontoCsv";
import {
  getBankMonatCsvFilenameFromJsonFilename,
  saveBankMonatCsvToExport,
} from "./bankMonatsExport";
import {
  buildBankKontrollWorkbook,
  buildBelegKontrollWorkbook,
  saveKontrollWorkbookToExport,
} from "./kontrollXlsx";
import { ensureStbExportFolders } from "./stbExportFolders";
import { collectBankBelegIds } from "./collectBankBelegIds";
import { findPdfFilesRecursive } from "./findPdfFilesRecursive";
import { deriveFewoStampInfo } from "./deriveFewoStampInfo";
import { buildBelegZahlungenMap } from "./buildBelegZahlungenMap";
import { buildSplitTextLines } from "./buildSplitTextLines";
import { buildBankKontrollRows } from "./buildBankKontrollRows";
import { buildKontoExportDataFromJson } from "./buildKontoExportDataFromJson";
import {
  loadAllBankJsons,
  getErrorMessage,
} from "./bankJsonLoader";
import {
  buildZahlungsText,
  getMonatKeyFromDatum,
  formatBelegAmount,
} from "./exportFormatters";
import { deriveBookingViews } from "../bank-ui/lib/utils";
import type {
  BankBooking,
  BelegData,
  SlimAssignmentMap,
} from "../bank-ui/types/bankSlimTypes";

export async function runBelegExport(baseFolder: string, year: string) {
  try {
    if (!baseFolder) {
      return;
    }

    await ensureStbExportFolders(baseFolder);

    const belege = await ladeBelegeAusJahresdatei(baseFolder, year);

    const bankJsonFiles = await loadAllBankJsons(baseFolder);
    const bankBelegIds = collectBankBelegIds(bankJsonFiles);
    const bankMonateSet = new Set<string>();

    for (const jsonFile of bankJsonFiles) {
      const match = jsonFile.fileName.match(/(\d{4})-(\d{2})/);
      if (match) {
        const [, jahr, monat] = match;
        bankMonateSet.add(`${jahr}-${monat}`);
      }
    }

    const istExportRelevanteFewo = (value: string) => {
      const normalized = String(value || "").trim().toLowerCase();
      return (
        normalized.includes("tina") ||
        normalized.includes("tinchen") ||
        normalized.includes("harmony")
      );
    };

    const restBelege = belege.filter(
      (beleg) =>
        !bankBelegIds.has(beleg.id) &&
        istExportRelevanteFewo(String(beleg.fewo || ""))
    );
    const belegeNachMonat: Record<string, typeof restBelege> = {};

    for (const beleg of restBelege) {
      const monatKey = getMonatKeyFromDatum(String(beleg.datum ?? ""));
      if (!monatKey) continue;

      const jahrTeil = monatKey.slice(0, 4);
      if (jahrTeil !== year) continue;

      if (!belegeNachMonat[monatKey]) {
        belegeNachMonat[monatKey] = [];
      }

      belegeNachMonat[monatKey].push(beleg);
    }

    const monate = Object.keys(belegeNachMonat).sort();

    if (!monate.length) {
      return;
    }

    for (const monatKey of monate) {
      if (!bankMonateSet.has(monatKey)) {
        continue;
      }

      const monatsBelege = belegeNachMonat[monatKey];
      const csv = buildBelegCsv(monatsBelege);

      const kontrollWorkbook = buildBelegKontrollWorkbook({
        title: `${monatKey} Belege Kontrolle`,
        rows: monatsBelege.map((b) => ({
          belegId: b.id || "",
          datum: b.datum || "",
          lieferant: b.lieferant || "",
          rechnungsnummer: b.rechnungsnummer || "",
          betrag: formatBelegAmount(b.betrag || ""),
          fewo: b.fewo || "",
          konto: b.konto || "",
          zahlungsart: b.zahlungsart || "bank",
          split: b.splitMode ? "ja" : "nein",
          splitTina: b.splitTina || "",
          splitHarmony: b.splitHarmony || "",
          splitTinchen: b.splitTinchen || "",
          splitRS: b.splitRS || "",
          splitPrivat: b.splitPrivat || "",
          notiz: b.notiz || "",
          pdfPath: b.dateiname
            ? `${baseFolder}/Export-STB/Belege/${b.dateiname}`
            : "",
        })),
      });

      await saveBelegMonatCsvToExport(
        baseFolder,
        `${monatKey}-belege.csv`,
        csv
      );

      await saveKontrollWorkbookToExport(
        baseFolder,
        `${monatKey}-belege-kontrolle.xlsx`,
        kontrollWorkbook
      );
    }
  } catch (error) {
    alert(`Beleglisten-Export Fehler: ${getErrorMessage(error)}`);
  }
}

export async function runKontoExport(baseFolder: string, year: string) {
  try {
    if (!baseFolder) {
      return;
    }

    await ensureStbExportFolders(baseFolder);

    const jsonFiles = await loadAllBankJsons(baseFolder);
    const belegeRaw = await ladeBelegeAusJahresdatei(baseFolder, year);

    const belege: BelegData[] = belegeRaw.map((beleg) => ({
      id: beleg.id,
      fewoId:
        beleg.fewo === "Tina"
          ? "tina"
          : beleg.fewo === "Harmony"
            ? "harmony"
            : beleg.fewo === "Tinchen"
              ? "tinchen"
              : "privat",
      konto: beleg.konto || "",
      lieferant: beleg.lieferant || "",
      pfad: beleg.pfad || "",
    }));

    const exportBookings: BankBooking[] = [];
    const assignmentMap: SlimAssignmentMap = {};

    for (const jsonFile of jsonFiles) {
      const file = jsonFile.data;

      const {
        monatBookings,
        monatAssignmentMap,
        exportBookings: nextExportBookings,
        exportAssignmentMap,
      } = buildKontoExportDataFromJson(file);

      exportBookings.push(...nextExportBookings);
      Object.assign(assignmentMap, exportAssignmentMap);

      if (monatBookings.length > 0) {
        const monatViews = deriveBookingViews(
          monatBookings,
          monatAssignmentMap,
          belege
        );

        const monatCsv = buildKontoCsv({
          bookings: monatBookings,
          views: monatViews,
        });

        const monatKontrollWorkbook = buildBankKontrollWorkbook({
          title: jsonFile.fileName.replace(".json", ""),
          rows: buildBankKontrollRows(monatBookings, monatViews, baseFolder),
        });

        if (monatCsv.trim()) {
          const monatFilename = getBankMonatCsvFilenameFromJsonFilename(
            jsonFile.fileName
          );

          await saveBankMonatCsvToExport(baseFolder, monatFilename, monatCsv);

          await saveKontrollWorkbookToExport(
            baseFolder,
            monatFilename.replace(".csv", "-kontrolle.xlsx"),
            monatKontrollWorkbook
          );
        }
      }
    }

    if (!exportBookings.length) {
      return;
    }

    const exportViews = deriveBookingViews(
      exportBookings,
      assignmentMap,
      belege
    );

    const csv = buildKontoCsv({
      bookings: exportBookings,
      views: exportViews,
    });

    const kontrollWorkbook = buildBankKontrollWorkbook({
      title: `${year} Konto Kontrolle`,
      rows: buildBankKontrollRows(exportBookings, exportViews, baseFolder),
    });

    await saveKontoCsvToExport(baseFolder, `${year}-konto-export.csv`, csv);

    await saveKontrollWorkbookToExport(
      baseFolder,
      `${year}-konto-export-kontrolle.xlsx`,
      kontrollWorkbook
    );
  } catch (error) {
    alert(`Konto-Export Fehler: ${getErrorMessage(error)}`);
  }
}

export async function runPdfExport(baseFolder: string, year: string) {
  try {
    await ensureStbExportFolders(baseFolder);

    const selected = await open({ directory: true, multiple: false });

    if (typeof selected !== "string" || selected.length === 0) {
      return;
    }

    const normalizePath = (value: string) =>
      value.replace(/\\/g, "/").replace(/\/+$/, "");

    const selectedPath = normalizePath(selected);

    if (!selectedPath.includes("/Eingang")) {
      alert("Bitte den Eingang-Ordner wählen, z. B. .../Tresorit/2025/Eingang");
      return;
    }

    const pdfFiles = await findPdfFilesRecursive(
      selectedPath,
      normalizePath
    );

    if (!pdfFiles.length) {
      alert(`Keine PDFs im Eingang gefunden:\n${selectedPath}`);
      return;
    }

    let erfolgreich = 0;
    const fehler: string[] = [];

    const belege = await ladeBelegeAusJahresdatei(baseFolder, year);
    const bankJsonFiles = await loadAllBankJsons(baseFolder);
    const belegZahlungenMap = buildBelegZahlungenMap(bankJsonFiles);

    const bankBelegIds = collectBankBelegIds(bankJsonFiles);

    for (const filePath of pdfFiles) {
      try {
        const { fewoLabel, objektNr } = deriveFewoStampInfo(filePath);

        const dateiname = filePath.split("/").pop() || "";
        const identNr = dateiname.split("_")[0] || dateiname;

        const belegMeta = belege.find(
          (beleg) => beleg.dateiname === dateiname || beleg.id === identNr
        );

        const kontoDatev =
          belegMeta && bankBelegIds.has(belegMeta.id)
            ? belegMeta.konto || ""
            : "";
        const outputFileName = dateiname || `${identNr}.pdf`;

        const bankZahlungsdaten = belegMeta
          ? (belegZahlungenMap.get(belegMeta.id) ?? []).slice(0, 12)
          : [];

        let zahlungsText = buildZahlungsText(belegMeta);

        if (!zahlungsText && bankZahlungsdaten.length > 0) {
          zahlungsText = `${bankZahlungsdaten.length === 1 ? "ZAHLUNG" : "ZAHLUNGEN"
            }: ${bankZahlungsdaten.join(" | ")}`;
        }

        const splitTextLines = buildSplitTextLines(belegMeta);

        await exportStampedPdf(
          filePath,
          {
            fewoLabel,
            objektNr,
            identNr,
            kontoDatev,
            zahlungsart: belegMeta?.zahlungsart,
            zahlungsText,
            splitTextLines,
          },
          {
            stbExport: {
              baseFolder,
              fewoLabel,
              kontoDatev,
              fileName: outputFileName,
            },
          }
        );

        erfolgreich += 1;
      } catch (error) {
        fehler.push(`${filePath}: ${getErrorMessage(error)}`);
      }
    }

    if (fehler.length === 0) {
      alert(
        `${erfolgreich} PDF(s) erfolgreich aus Eingang nach Export geschrieben.`
      );
      return;
    }

    alert(
      `${erfolgreich} PDF(s) exportiert, ${fehler.length} Fehler.\n\n${fehler.join(
        "\n"
      )}`
    );
  } catch (error) {
    alert(`PDF-Sammel-Export Fehler: ${getErrorMessage(error)}`);
  }
}