import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { save } from "@tauri-apps/plugin-dialog";
import { writeFile } from "@tauri-apps/plugin-fs";
import type { Mitglied } from "../types/mitglieder";

export async function erstelleSepaMandatPdf(
    mitglied: Mitglied,
    glaeubigerId: string
) {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]);

    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const form = pdfDoc.getForm();

    const { height } = page.getSize();

    page.drawText("Dorfgemeinschaft Loppersum", {
        x: 50,
        y: height - 55,
        size: 14,
        font: bold,
    });

    page.drawText("SEPA-Lastschriftmandat", {
        x: 50,
        y: height - 105,
        size: 18,
        font: bold,
    });

    page.drawText("Gläubiger / Zahlungsempfänger:", {
        x: 50,
        y: height - 145,
        size: 11,
        font: bold,
    });

    page.drawText("Dorfgemeinschaft Loppersum", { x: 50, y: height - 165, size: 10, font });
    page.drawText("Nelkenstr. 9, 26759 Hinte", { x: 50, y: height - 182, size: 10, font });
    page.drawText(`Gläubiger-ID: ${glaeubigerId || "nicht eingetragen"}`, {
        x: 50,
        y: height - 199,
        size: 10,
        font,
    });

    const felder: Array<{ label: string; name: string; value: string; y: number }> = [
        {
            label: "Mandatsreferenz:",
            name: "sepa_mandatsreferenz",
            value: mitglied.sepa.mandatsreferenz || mitglied.mitgliedsnummer || "",
            y: height - 230,
        },
        {
            label: "Name Kontoinhaber:",
            name: "sepa_kontoinhaber",
            value:
                mitglied.sepa.kontoinhaber ||
                `${mitglied.vorname || ""} ${mitglied.nachname || ""}`.trim(),
            y: height - 265,
        },
        {
            label: "Straße:",
            name: "sepa_strasse",
            value: mitglied.strasse || "",
            y: height - 300,
        },
        {
            label: "PLZ / Ort:",
            name: "sepa_ort",
            value: `${mitglied.plz || ""} ${mitglied.wohnort || ""}`.trim(),
            y: height - 335,
        },
        {
            label: "IBAN:",
            name: "sepa_iban",
            value: mitglied.sepa.iban || "",
            y: height - 370,
        },
        {
            label: "BIC:",
            name: "sepa_bic",
            value: mitglied.sepa.bic || "",
            y: height - 405,
        },
        {
            label: "Kreditinstitut:",
            name: "sepa_kreditinstitut",
            value: mitglied.sepa.kreditinstitut || "",
            y: height - 440,
        },
    ];

    felder.forEach((feld) => {
        page.drawText(feld.label, {
            x: 50,
            y: feld.y,
            size: 10,
            font,
        });

        const textField = form.createTextField(feld.name);
        textField.setText(feld.value);
        textField.addToPage(page, {
            x: 180,
            y: feld.y - 12,
            width: 340,
            height: 18,
            borderWidth: 1,
        });
    });

    page.drawText("Zahlungsart:", {
        x: 50,
        y: height - 490,
        size: 10,
        font: bold,
    });

    page.drawText("[X] Wiederkehrende Zahlung", {
        x: 180,
        y: height - 490,
        size: 10,
        font,
    });

    page.drawText("[  ] Einmalige Zahlung", {
        x: 340,
        y: height - 490,
        size: 10,
        font,
    });

    page.drawText(
        "Ich ermächtige die Dorfgemeinschaft Loppersum, Zahlungen von meinem Konto mittels Lastschrift einzuziehen.",
        {
            x: 50,
            y: height - 535,
            size: 9,
            font,
        }
    );

    page.drawText(
        "Zugleich weise ich mein Kreditinstitut an, die von der Dorfgemeinschaft Loppersum gezogenen Lastschriften einzulösen.",
        {
            x: 50,
            y: height - 552,
            size: 9,
            font,
        }
    );

    page.drawText(
        "Hinweis: Ich kann innerhalb von acht Wochen, beginnend mit dem Belastungsdatum, die Erstattung verlangen.",
        {
            x: 50,
            y: height - 585,
            size: 9,
            font,
        }
    );

    page.drawText(
        "Kosten, die durch Rückbuchungen oder fehlerhafte Bankdaten entstehen, übernimmt das Mitglied.",
        {
            x: 50,
            y: height - 618,
            size: 10,
            font: bold,
            color: rgb(0.6, 0, 0),
        }
    );

    page.drawText("Ort, Datum:", {
        x: 50,
        y: 145,
        size: 10,
        font,
    });

    const ortDatumField = form.createTextField("sepa_ort_datum");
    ortDatumField.setText(mitglied.wohnort ? `${mitglied.wohnort}, ` : "");
    ortDatumField.addToPage(page, {
        x: 125,
        y: 132,
        width: 145,
        height: 18,
        borderWidth: 1,
    });

    page.drawText("Unterschrift:", {
        x: 310,
        y: 145,
        size: 10,
        font,
    });

    page.drawLine({
        start: { x: 390, y: 143 },
        end: { x: 540, y: 143 },
        thickness: 1,
        color: rgb(0, 0, 0),
    });

    const pdfBytes = await pdfDoc.save();

    const nummer = mitglied.mitgliedsnummer || "ohne-nr";

    const saubererName = `${nummer}-${mitglied.nachname || "mitglied"}-${mitglied.vorname || "sepa"}`
        .toLowerCase()
        .replaceAll("ä", "ae")
        .replaceAll("ö", "oe")
        .replaceAll("ü", "ue")
        .replaceAll("ß", "ss")
        .replace(/[^a-z0-9-]/g, "-");

    const filePath = await save({
        defaultPath: `sepa-mandat-${saubererName}.pdf`,
    });

    if (!filePath) return;

    await writeFile(filePath, pdfBytes);
}