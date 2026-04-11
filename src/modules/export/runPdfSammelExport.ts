import { open } from "@tauri-apps/plugin-dialog";
import { ladeBelegeAusJahresdatei } from "../../lib/belege";
import { exportStampedPdf } from "../../lib/exportSinglePdf";
import { loadAllBankJsons } from "../bank-ui/loadAllBankJsons";
import { findPdfsRecursive } from "./helpers/findPdfsRecursive";
import { normalizePath } from "./helpers/pathHelpers";
import { collectBankBelegData } from "./helpers/collectBankBelegData";
import { getFewoLabelAndObjektNr } from "./helpers/getFewoLabelAndObjektNr";
import { buildSplitTextLines } from "./helpers/buildSplitTextLines";
import { buildZahlungsTextFromData } from "./helpers/buildZahlungsText";

type Params = {
  baseFolder: string;
  year: string;
  setPdfExportLoading: (value: boolean) => void;
};

export async function runPdfSammelExport({
  baseFolder,
  year,
  setPdfExportLoading,
}: Params) {
  try {
    if (!baseFolder) {
      alert("Bitte zuerst einen Basisordner wählen.");
      return;
    }

    setPdfExportLoading(true);

    const selected = await open({ directory: true, multiple: false });

    if (typeof selected !== "string" || !selected) {
      return;
    }

    const selectedPath = normalizePath(selected);

    if (!selectedPath.includes("/Eingang")) {
      alert("Bitte den Eingang-Ordner wählen, z. B. .../Tresorit/2025/Eingang");
      return;
    }

    const pdfFiles = await findPdfsRecursive(selectedPath);

    if (!pdfFiles.length) {
      alert(`Keine PDFs im Eingang gefunden:\n${selectedPath}`);
      return;
    }

    const now = new Date();
    const exportiertAm = `${String(now.getDate()).padStart(2, "0")}.${String(
      now.getMonth() + 1
    ).padStart(2, "0")}.${now.getFullYear()}`;

    let erfolgreich = 0;
    const fehler: string[] = [];

    const belege = await ladeBelegeAusJahresdatei(baseFolder, year);
    const bankJsonFiles = await loadAllBankJsons(baseFolder);
    const { bankBelegIds, belegZahlungenMap } =
      collectBankBelegData(bankJsonFiles);

    for (const filePath of pdfFiles) {
      try {
        const { fewoLabel, objektNr } = getFewoLabelAndObjektNr(filePath);

        const dateiname = filePath.split("/").pop() || "";
        const identNr = dateiname.split("_")[0] || dateiname;

        const belegMeta = belege.find(
          (beleg) => beleg.dateiname === dateiname || beleg.id === identNr
        );

        console.log("BELEG META:", belegMeta);

        const kontoDatev =
          belegMeta && bankBelegIds.has(belegMeta.id)
            ? belegMeta.konto || ""
            : "";

        const outputFileName = dateiname || `${identNr}.pdf`;

        const zahlungsText = buildZahlungsTextFromData(
          belegMeta,
          belegZahlungenMap
        );

        const splitTextLines = buildSplitTextLines(belegMeta);

        console.log("APP STAMP PAYLOAD:", {
          fewoLabel,
          objektNr,
          identNr,
          kontoDatev,
          exportiertAm,
          zahlungsart: belegMeta?.zahlungsart,
          zahlungsText,
          splitTextLines,
        });

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
        fehler.push(
          `${filePath}: ${
            error instanceof Error ? error.message : String(error)
          }`
        );
      }
    }

    if (fehler.length === 0) {
      alert(`${erfolgreich} PDF(s) erfolgreich aus Eingang nach Export geschrieben.`);
      return;
    }

    alert(
      `${erfolgreich} PDF(s) exportiert, ${fehler.length} Fehler.\n\n${fehler.join("\n")}`
    );
  } catch (error) {
    alert(
      `PDF-Sammel-Export Fehler: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  } finally {
    setPdfExportLoading(false);
  }
}
