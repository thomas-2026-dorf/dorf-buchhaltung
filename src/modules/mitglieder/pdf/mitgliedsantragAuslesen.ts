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
    pfad: string;
    dateiname: string;
};

export type GeleseneSepaDaten = {
    mandatsreferenz: string;
    kontoinhaber: string;
    iban: string;
    bic: string;
    kreditinstitut: string;
    pfad: string;
    dateiname: string;
};

export type GeleseneAntragUndSepaDaten = {
    mitgliedsantrag: GeleseneMitgliedsantragDaten;
    sepa: GeleseneSepaDaten | null;
};

function dateinameAusPfad(pfad: string): string {
    return pfad.split(/[\\/]/).pop() || "dokument.pdf";
}

function leseTextfeld(form: ReturnType<PDFDocument["getForm"]>, feldname: string): string {
    try {
        return form.getTextField(feldname).getText() || "";
    } catch {
        return "";
    }
}

async function leseEinPdf(pfad: string) {
    const pdfBytes = await readFile(pfad);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const form = pdfDoc.getForm();

    const istMitgliedsantrag = leseTextfeld(form, "feld_0") !== "";
    const istSepa = leseTextfeld(form, "sepa_iban") !== "";

    if (istMitgliedsantrag) {
        const daten: GeleseneMitgliedsantragDaten = {
            nameVorname: leseTextfeld(form, "feld_0"),
            geburtsdatum: leseTextfeld(form, "feld_1"),
            strasse: leseTextfeld(form, "feld_2"),
            plzWohnort: leseTextfeld(form, "feld_3"),
            telefon: leseTextfeld(form, "feld_4"),
            email: leseTextfeld(form, "feld_5"),
            pfad,
            dateiname: dateinameAusPfad(pfad),
        };

        return { typ: "mitgliedsantrag" as const, daten };
    }

    if (istSepa) {
        const daten: GeleseneSepaDaten = {
            mandatsreferenz: leseTextfeld(form, "sepa_mandatsreferenz"),
            kontoinhaber: leseTextfeld(form, "sepa_kontoinhaber"),
            iban: leseTextfeld(form, "sepa_iban"),
            bic: leseTextfeld(form, "sepa_bic"),
            kreditinstitut: leseTextfeld(form, "sepa_kreditinstitut"),
            pfad,
            dateiname: dateinameAusPfad(pfad),
        };

        return { typ: "sepa" as const, daten };
    }

    return null;
}

export async function leseMitgliedsantragUndSepaPdfFelder(): Promise<GeleseneAntragUndSepaDaten | null> {
    const filePaths = await open({
        multiple: true,
        filters: [{ name: "PDF", extensions: ["pdf"] }],
    });

    if (!filePaths || !Array.isArray(filePaths) || filePaths.length === 0) return null;

    let mitgliedsantrag: GeleseneMitgliedsantragDaten | null = null;
    let sepa: GeleseneSepaDaten | null = null;

    for (const pfad of filePaths) {
        const gelesen = await leseEinPdf(pfad);

        if (!gelesen) continue;

        if (gelesen.typ === "mitgliedsantrag") {
            mitgliedsantrag = gelesen.daten;
        }

        if (gelesen.typ === "sepa") {
            sepa = gelesen.daten;
        }
    }

    if (!mitgliedsantrag) {
        alert("Kein gültiger Mitgliedsantrag gefunden.");
        return null;
    }

    return { mitgliedsantrag, sepa };
}