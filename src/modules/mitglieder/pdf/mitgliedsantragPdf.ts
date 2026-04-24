import { PDFDocument } from "pdf-lib";
import { save } from "@tauri-apps/plugin-dialog";
import { writeFile } from "@tauri-apps/plugin-fs";
import vorlagePdf from "../vorlagen/mitgliedsantrag-vorlage.pdf?url";

export async function erstelleMitgliedsantragPdf() {
    // Vorlage laden (aus Projekt)
    const response = await fetch(vorlagePdf);
    const vorlageBytes = await response.arrayBuffer();

    const pdfDoc = await PDFDocument.load(vorlageBytes);

    const pdfBytes = await pdfDoc.save();

    // Speicherort auswählen
    const filePath = await save({
        defaultPath: "mitgliedsantrag.pdf",
    });

    if (!filePath) return;

    // Datei schreiben
    await writeFile(filePath, pdfBytes);
}