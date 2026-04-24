import { PDFDocument } from "pdf-lib";

export async function erstelleMitgliedsantragPdf(
    vorlageBytes: Uint8Array
): Promise<Uint8Array> {

    const pdfDoc = await PDFDocument.load(vorlageBytes);

    // erstmal nur unverändert zurückgeben
    // (nächster Schritt: Felder darüber legen)
    const pdfBytes = await pdfDoc.save();

    return pdfBytes;
}