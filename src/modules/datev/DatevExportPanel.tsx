import { ladeBelegeAusJahresdatei } from "../../lib/belege";
import { buildBelegCsv, downloadCsv } from "../export/belegCsv";

export default function DatevExportPanel() {
    async function handleBelegExport() {
        try {
            const baseFolder =
                localStorage.getItem("fewo_buchhaltung_base_folder_v1") || "";
            const year = "2025";

            console.log("Beleglisten-Export gestartet");
            console.log("baseFolder:", baseFolder);
            console.log("year:", year);

            if (!baseFolder) {
                alert("Kein Basisordner gefunden.");
                return;
            }

            const belege = await ladeBelegeAusJahresdatei(baseFolder, year);

            console.log("belege:", belege);

            if (!belege || !belege.length) {
                alert("Keine Belege vorhanden");
                return;
            }

            const csv = buildBelegCsv(belege);

            console.log("csv:", csv);

            if (!csv || !csv.trim()) {
                alert("CSV ist leer");
                return;
            }

            downloadCsv(`belegliste-${year}.csv`, csv);

            alert("Belegliste CSV wurde gestartet");
        } catch (error) {
            console.error("Beleglisten-Export Fehler:", error);
            alert(
                `Beleglisten-Export Fehler: ${error instanceof Error ? error.message : String(error)
                }`
            );
        }
    }

    return (
        <div style={{ padding: 20 }}>
            <h2>Export</h2>

            <button onClick={handleBelegExport}>
                Belegliste CSV herunterladen
            </button>
        </div>
    );
}