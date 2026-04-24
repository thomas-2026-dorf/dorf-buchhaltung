import { PDFDocument } from "pdf-lib";
import { open } from "@tauri-apps/plugin-dialog";
import { readFile } from "@tauri-apps/plugin-fs";

export type GeleseneMitgliedsantragDaten = {
    nameVorname: string;
    geburtsdatum: string;
    strasse: string;
    plzWohnort: string;
    telefon: string;
    email: string;

    // 👉 NEU
    pfad: string;
    dateiname: string;
};

export async function leseMitgliedsantragPdfFelder(): Promise<GeleseneMitgliedsantragDaten | null> {
    const filePath = await open({
        multiple: false,
        filters: [{ name: "PDF", extensions: ["pdf"] }],
    });

    if (!filePath || Array.isArray(filePath)) return null;

    const pfad = filePath;
    const dateiname = pfad.split("/").pop() || "mitgliedsantrag.pdf";

    const pdfBytes = await readFile(filePath);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const form = pdfDoc.getForm();

    return {
        nameVorname: form.getTextField("feld_0").getText() || "",
        geburtsdatum: form.getTextField("feld_1").getText() || "",
        strasse: form.getTextField("feld_2").getText() || "",
        plzWohnort: form.getTextField("feld_3").getText() || "",
        telefon: form.getTextField("feld_4").getText() || "",
        email: form.getTextField("feld_5").getText() || "",

        // 👉 NEU
        pfad,
        dateiname,
    };
}