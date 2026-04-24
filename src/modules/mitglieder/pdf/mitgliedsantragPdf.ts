import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { save } from "@tauri-apps/plugin-dialog";
import { writeFile } from "@tauri-apps/plugin-fs";
import vorlagePdf from "../vorlagen/mitgliedsantrag-vorlage.pdf?url";

export async function erstelleMitgliedsantragPdf() {
    const response = await fetch(vorlagePdf);
    const vorlageBytes = await response.arrayBuffer();

    const pdfDoc = await PDFDocument.load(vorlageBytes);
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const pages = pdfDoc.getPages();
    const page1 = pages[0];

    // SEPA-Bereich auf Seite 1 entfernen
    page1.drawRectangle({
        x: 35,
        y: 35,
        width: 525,
        height: 245,
        color: rgb(1, 1, 1),
    });

    page1.drawText("Hinweis:", {
        x: 45,
        y: 245,
        size: 11,
        font: bold,
        color: rgb(0, 0, 0),
    });

    page1.drawText("Das SEPA-Lastschriftmandat wird separat ausgefuellt.", {
        x: 45,
        y: 225,
        size: 11,
        font,
        color: rgb(0, 0, 0),
    });

    page1.drawText("BITTE DEUTLICH SCHREIBEN !!!", {
        x: 45,
        y: 75,
        size: 11,
        font: bold,
        color: rgb(0, 0, 0),
    });

    page1.drawText("*Weitere Familienmitglieder auf der Rueckseite eintragen.", {
        x: 45,
        y: 55,
        size: 10,
        font,
        color: rgb(0, 0, 0),
    });

    const pdfBytes = await pdfDoc.save();

    const filePath = await save({
        defaultPath: "mitgliedsantrag-ohne-sepa.pdf",
    });

    if (!filePath) return;

    await writeFile(filePath, pdfBytes);
}