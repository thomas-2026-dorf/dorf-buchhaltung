import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { readFile } from "@tauri-apps/plugin-fs";
import { save } from "@tauri-apps/plugin-dialog";
import { writeFile } from "@tauri-apps/plugin-fs";
import type { Mitglied } from "../types/mitglieder";

import type { Vereinsdaten } from "../../../lib/settings/vereinsdaten";

export async function erstelleSepaMandatPdf(
    mitglied: Mitglied,
    vereinsdaten: Vereinsdaten
) {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]);
    const { height } = page.getSize();

    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const form = pdfDoc.getForm();

    if (vereinsdaten.logoPfad) {
        try {
            const logoBytes = await readFile(vereinsdaten.logoPfad);

            let image;

            if (vereinsdaten.logoPfad.toLowerCase().endsWith(".png")) {
                image = await pdfDoc.embedPng(logoBytes);
            } else {
                image = await pdfDoc.embedJpg(logoBytes);
            }

            const maxWidth = 120;
            const scale = maxWidth / image.width;
            const scaledWidth = image.width * scale;
            const scaledHeight = image.height * scale;

            page.drawImage(image, {
                x: 420,
                y: height - 40 - scaledHeight,
                width: scaledWidth,
                height: scaledHeight,
            });
        } catch (err) {
            console.error("Logo konnte nicht geladen werden:", err);
        }
    }


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

    page.drawText(vereinsdaten.name || "Verein", { x: 50, y: height - 165, size: 10, font });
    page.drawText(vereinsdaten.strasse || "", { x: 50, y: height - 182, size: 10, font });
    page.drawText(`${vereinsdaten.plz || ""} ${vereinsdaten.ort || ""}`.trim(), {
        x: 50,
        y: height - 199,
        size: 10,
        font,
    });
    page.drawText(vereinsdaten.email || "", {
        x: 50,
        y: height - 216,
        size: 10,
        font,
    });
    page.drawText(`Gläubiger-ID: ${vereinsdaten.glaeubigerId || "nicht eingetragen"}`, {
        x: 50,
        y: height - 233,
        size: 10,
        font,
    });

    const felder: Array<{ label: string; name: string; value: string; y: number }> = [
        {
            label: "Mandatsreferenz:",
            name: "sepa_mandatsreferenz",
            value: mitglied.sepa.mandatsreferenz || mitglied.mitgliedsnummer || "",
            y: height - 270,
        },
        {
            label: "Name Kontoinhaber:",
            name: "sepa_kontoinhaber",
            value:
                mitglied.sepa.kontoinhaber ||
                `${mitglied.vorname || ""} ${mitglied.nachname || ""}`.trim(),
            y: height - 305,
        },
        {
            label: "Straße:",
            name: "sepa_strasse",
            value: mitglied.strasse || "",
            y: height - 340,
        },
        {
            label: "PLZ / Ort:",
            name: "sepa_ort",
            value: `${mitglied.plz || ""} ${mitglied.wohnort || ""}`.trim(),
            y: height - 375,
        },
        {
            label: "IBAN:",
            name: "sepa_iban",
            value: mitglied.sepa.iban || "",
            y: height - 410,
        },
        {
            label: "BIC:",
            name: "sepa_bic",
            value: mitglied.sepa.bic || "",
            y: height - 445,
        },
        {
            label: "Kreditinstitut:",
            name: "sepa_kreditinstitut",
            value: mitglied.sepa.kreditinstitut || "",
            y: height - 480,
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
        y: height - 525,
        size: 10,
        font: bold,
    });

    page.drawText("[X] Wiederkehrende Zahlung", {
        x: 180,
        y: height - 525,
        size: 10,
        font,
    });

    page.drawText("[  ] Einmalige Zahlung", {
        x: 340,
        y: height - 525,
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