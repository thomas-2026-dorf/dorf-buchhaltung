import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { save } from "@tauri-apps/plugin-dialog";
import { writeFile } from "@tauri-apps/plugin-fs";
import type { Mitglied } from "../types/mitglieder";

function zeichneLinie(page: any, x1: number, y: number, x2: number) {
    page.drawLine({
        start: { x: x1, y },
        end: { x: x2, y },
        thickness: 1,
        color: rgb(0, 0, 0),
    });
}

export async function erstelleMitgliedsantragPdf(mitglied: Mitglied) {
    const pdfDoc = await PDFDocument.create();

    const page = pdfDoc.addPage([595, 842]); // A4
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const { height } = page.getSize();

    page.drawText("Dorfgemeinschaft Loppersum", {
        x: 50,
        y: height - 55,
        size: 14,
        font: bold,
    });

    page.drawText("Nelkenstr. 9", {
        x: 50,
        y: height - 75,
        size: 10,
        font,
    });

    page.drawText("26759 Hinte", {
        x: 50,
        y: height - 90,
        size: 10,
        font,
    });

    page.drawText("Aufnahmeantrag", {
        x: 50,
        y: height - 135,
        size: 18,
        font: bold,
    });

    page.drawText(
        "Hiermit beantrage ich die Mitgliedschaft fuer die Dorfgemeinschaft Loppersum und bitte um Aufnahme als:",
        {
            x: 50,
            y: height - 170,
            size: 10,
            font,
        }
    );

    page.drawText("[  ] aktives Mitglied", {
        x: 70,
        y: height - 200,
        size: 11,
        font,
    });

    page.drawText("[  ] Foerdermitglied", {
        x: 250,
        y: height - 200,
        size: 11,
        font,
    });

    page.drawText("Meine persoenlichen Daten", {
        x: 50,
        y: height - 240,
        size: 13,
        font: bold,
    });

    const felder: [string, number][] = [
        ["Name, Vorname:", 260],
        ["Geburtsdatum:", 295],
        ["Strasse:", 330],
        ["PLZ / Wohnort:", 365],
        ["Telefon:", 400],
        ["E-Mail:", 435],
    ];

    const form = pdfDoc.getForm();

    const werte = [
        mitglied.nachname || mitglied.vorname
            ? `${mitglied.nachname || ""}, ${mitglied.vorname || ""}`.trim()
            : "",

        mitglied.geburtsdatum || "",
        mitglied.strasse || "",

        (mitglied.plz || mitglied.wohnort)
            ? `${mitglied.plz || ""} ${mitglied.wohnort || ""}`.trim()
            : "",

        mitglied.telefon || "",
        mitglied.email || "",
    ];

    felder.forEach(([label, abstand], index) => {
        const y = height - abstand;

        page.drawText(label, { x: 50, y, size: 10, font });

        const field = form.createTextField("feld_" + index);

        field.setText(werte[index] || "");
        field.addToPage(page, {
            x: 170,
            y: y - 12,
            width: 350,
            height: 18,
            borderWidth: 1,
        });
    });

    page.drawText("Ich beantrage die Aufnahme als:", {
        x: 50,
        y: height - 485,
        size: 11,
        font,
    });

    page.drawText("[  ] Einzelmitglied", {
        x: 70,
        y: height - 515,
        size: 11,
        font,
    });

    page.drawText("[  ] Familie", {
        x: 250,
        y: height - 515,
        size: 11,
        font,
    });

    page.drawText(
        "Der Verein arbeitet gemaess DSGVO (Datenschutzgrundverordnung) nach einer Datenschutzordnung.",
        {
            x: 50,
            y: height - 565,
            size: 10,
            font,
        }
    );

    page.drawText(
        "Diese ist Grundlage der Mitgliedschaft und steht Ihnen gerne zur Verfuegung.",
        {
            x: 50,
            y: height - 582,
            size: 10,
            font,
        }
    );

    page.drawText(
        "Mit meiner Unterschrift erkenne ich die Satzung der Dorfgemeinschaft Loppersum an.",
        {
            x: 50,
            y: height - 620,
            size: 10,
            font,
        }
    );

    page.drawText("Ort, Datum:", {
        x: 50,
        y: 145,
        size: 10,
        font,
    });
    zeichneLinie(page, 125, 143, 270);

    page.drawText("Unterschrift:", {
        x: 310,
        y: 145,
        size: 10,
        font,
    });
    zeichneLinie(page, 390, 143, 540);

    page.drawText("BITTE DEUTLICH SCHREIBEN !!!", {
        x: 50,
        y: 85,
        size: 11,
        font: bold,
    });

    page.drawText(
        "Hinweis: Das SEPA-Lastschriftmandat wird separat ausgefuellt.",
        {
            x: 50,
            y: 65,
            size: 10,
            font,
        }
    );

    if (mitglied.familienmitglieder.length > 0) {
        const familienPage = pdfDoc.addPage([595, 842]);
        const { height: familienHeight } = familienPage.getSize();

        familienPage.drawText("Daten weiterer Familienmitglieder", {
            x: 50,
            y: familienHeight - 55,
            size: 16,
            font: bold,
        });

        const familienFelder: [string, number][] = [
            ["Name, Vorname:", 0],
            ["Geburtsdatum:", 28],
            ["Telefon:", 56],
            ["E-Mail:", 84],
        ];

        for (let i = 0; i < mitglied.familienmitglieder.length; i++) {
            const startY = familienHeight - 105 - i * 130;

            familienPage.drawText(`Familienmitglied ${i + 1}`, {
                x: 50,
                y: startY,
                size: 12,
                font: bold,
            });

            familienFelder.forEach(([label, offset], feldIndex) => {
                const y = startY - 28 - offset;

                familienPage.drawText(label, {
                    x: 50,
                    y,
                    size: 10,
                    font,
                });

                const field = form.createTextField(`familienmitglied_${i + 1}_${feldIndex + 1}`);
                field.setText("");
                field.addToPage(familienPage, {
                    x: 170,
                    y: y - 12,
                    width: 350,
                    height: 18,
                    borderWidth: 1,
                });
            });
        }
    }

    const pdfBytes = await pdfDoc.save();

    const nummer = mitglied.mitgliedsnummer || "ohne-nr";

    const saubererName = `${nummer}-${mitglied.nachname || "mitglied"}-${mitglied.vorname || "antrag"}`
        .toLowerCase()
        .replaceAll("ä", "ae")
        .replaceAll("ö", "oe")
        .replaceAll("ü", "ue")
        .replaceAll("ß", "ss")
        .replace(/[^a-z0-9-]/g, "-");

    const filePath = await save({
        defaultPath: `mitgliedsantrag-${saubererName}.pdf`,
    });

    if (!filePath) return;

    await writeFile(filePath, pdfBytes);
}