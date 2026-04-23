import { save } from "@tauri-apps/plugin-dialog";
import { writeFile } from "@tauri-apps/plugin-fs";
import ExcelJS from "exceljs";

export type ExcelZeile = {
    datum: string;
    titel: string;
    einnahme: number;
    ausgabe: number;
    bestand: number;
};

type ExcelDaten = {
    titel: string;
    anfangsbestand: number;
    endbestand: number;
    zeilen: ExcelZeile[];
};

function baueDateiname(titel: string) {
    const sauber = titel
        .toLowerCase()
        .replaceAll("ä", "ae")
        .replaceAll("ö", "oe")
        .replaceAll("ü", "ue")
        .replaceAll("ß", "ss")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

    return `${sauber || "kassenblatt"}.xlsx`;
}

function euroFormat(zelle: ExcelJS.Cell) {
    zelle.numFmt = '#,##0.00 "€"';
}

function setThinBorder(zelle: ExcelJS.Cell) {
    zelle.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
    };
}

function setMediumBorder(zelle: ExcelJS.Cell) {
    zelle.border = {
        top: { style: "medium" },
        left: { style: "medium" },
        bottom: { style: "medium" },
        right: { style: "medium" },
    };
}

function styleBereichRahmen(
    worksheet: ExcelJS.Worksheet,
    startRow: number,
    endRow: number,
    startCol: number,
    endCol: number,
    medium = false
) {
    for (let row = startRow; row <= endRow; row++) {
        for (let col = startCol; col <= endCol; col++) {
            const cell = worksheet.getCell(row, col);
            if (medium) {
                setMediumBorder(cell);
            } else {
                setThinBorder(cell);
            }
        }
    }
}

export async function exportiereKassenblattExcel(daten: ExcelDaten) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Kassenblatt");

    worksheet.columns = [
        { width: 16 }, // A Datum
        { width: 42 }, // B Titel
        { width: 16 }, // C Einnahme
        { width: 16 }, // D Ausgabe
        { width: 20 }, // E Laufender Bestand
    ];

    worksheet.mergeCells("A1:E1");
    const titelCell = worksheet.getCell("A1");
    titelCell.value = daten.titel;
    titelCell.font = { bold: true, size: 18 };
    titelCell.alignment = { horizontal: "center", vertical: "middle" };
    worksheet.getRow(1).height = 28;

    worksheet.mergeCells("A3:D3");
    worksheet.getCell("A3").value = "Anfangsbestand";
    worksheet.getCell("A3").font = { bold: true, color: { argb: "FF006100" } };
    worksheet.getCell("A3").alignment = { horizontal: "left", vertical: "middle" };

    const anfangsbestandCell = worksheet.getCell("E3");
    anfangsbestandCell.value = daten.anfangsbestand;
    anfangsbestandCell.font = { bold: true, color: { argb: "FF008000" }, size: 14 };
    anfangsbestandCell.alignment = { horizontal: "right", vertical: "middle" };
    euroFormat(anfangsbestandCell);

    const kopfZeile = 5;
    worksheet.getCell(`A${kopfZeile}`).value = "Datum";
    worksheet.getCell(`B${kopfZeile}`).value = "Titel";
    worksheet.getCell(`C${kopfZeile}`).value = "Einnahme";
    worksheet.getCell(`D${kopfZeile}`).value = "Ausgabe";
    worksheet.getCell(`E${kopfZeile}`).value = "Laufender Bestand";

    for (const key of ["A", "B", "C", "D", "E"] as const) {
        const cell = worksheet.getCell(`${key}${kopfZeile}`);
        cell.font = { bold: true, size: 13 };
        cell.alignment = { horizontal: "center", vertical: "middle" };
        cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFDCE6F1" },
        };
        setThinBorder(cell);
    }

    worksheet.getRow(kopfZeile).height = 24;

    let aktuelleZeile = 6;
    let summeEinnahmen = 0;
    let summeAusgaben = 0;

    for (const zeile of daten.zeilen) {
        worksheet.getCell(`A${aktuelleZeile}`).value = zeile.datum || "";
        worksheet.getCell(`B${aktuelleZeile}`).value = zeile.titel || "";
        worksheet.getCell(`C${aktuelleZeile}`).value = zeile.einnahme || 0;
        worksheet.getCell(`D${aktuelleZeile}`).value = zeile.ausgabe || 0;
        worksheet.getCell(`E${aktuelleZeile}`).value = zeile.bestand || 0;

        worksheet.getCell(`A${aktuelleZeile}`).alignment = {
            horizontal: "center",
            vertical: "middle",
        };
        worksheet.getCell(`B${aktuelleZeile}`).alignment = {
            horizontal: "left",
            vertical: "middle",
        };
        worksheet.getCell(`C${aktuelleZeile}`).alignment = {
            horizontal: "right",
            vertical: "middle",
        };
        worksheet.getCell(`D${aktuelleZeile}`).alignment = {
            horizontal: "right",
            vertical: "middle",
        };
        worksheet.getCell(`E${aktuelleZeile}`).alignment = {
            horizontal: "right",
            vertical: "middle",
        };

        euroFormat(worksheet.getCell(`C${aktuelleZeile}`));
        euroFormat(worksheet.getCell(`D${aktuelleZeile}`));
        euroFormat(worksheet.getCell(`E${aktuelleZeile}`));

        worksheet.getCell(`E${aktuelleZeile}`).font = { underline: true };

        styleBereichRahmen(worksheet, aktuelleZeile, aktuelleZeile, 1, 5);

        summeEinnahmen += zeile.einnahme || 0;
        summeAusgaben += zeile.ausgabe || 0;
        aktuelleZeile++;
    }

    const summenZeile = aktuelleZeile + 1;
    const endbestandZeile = summenZeile + 1;

    worksheet.getCell(`A${summenZeile}`).value = "Summen";
    worksheet.getCell(`C${summenZeile}`).value = summeEinnahmen;
    worksheet.getCell(`D${summenZeile}`).value = summeAusgaben;
    worksheet.getCell(`E${summenZeile}`).value = daten.endbestand;

    worksheet.getCell(`A${endbestandZeile}`).value = "Endbestand";
    worksheet.getCell(`E${endbestandZeile}`).value = daten.endbestand;

    for (const row of [summenZeile, endbestandZeile]) {
        for (const col of [1, 2, 3, 4, 5]) {
            const cell = worksheet.getCell(row, col);
            cell.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: "FFE2EFDA" },
            };
            cell.alignment = {
                horizontal: col === 1 ? "left" : "right",
                vertical: "middle",
            };
            setThinBorder(cell);
        }
    }

    worksheet.getCell(`A${summenZeile}`).font = {
        bold: true,
        color: { argb: "FF006100" },
    };
    worksheet.getCell(`C${summenZeile}`).font = {
        bold: true,
        color: { argb: "FF008000" },
        size: 14,
    };
    worksheet.getCell(`D${summenZeile}`).font = {
        bold: true,
        color: { argb: "FF008000" },
        size: 14,
    };
    worksheet.getCell(`E${summenZeile}`).font = {
        bold: true,
        color: { argb: "FF008000" },
        size: 14,
    };

    worksheet.getCell(`A${endbestandZeile}`).font = {
        bold: true,
        color: { argb: "FF006100" },
        size: 14,
    };
    worksheet.getCell(`E${endbestandZeile}`).font = {
        bold: true,
        color: { argb: "FF008000" },
        size: 18,
    };

    euroFormat(worksheet.getCell(`C${summenZeile}`));
    euroFormat(worksheet.getCell(`D${summenZeile}`));
    euroFormat(worksheet.getCell(`E${summenZeile}`));
    euroFormat(worksheet.getCell(`E${endbestandZeile}`));

    styleBereichRahmen(worksheet, 3, 3, 1, 5);
    styleBereichRahmen(worksheet, 5, 5, 1, 5);
    styleBereichRahmen(worksheet, summenZeile, summenZeile, 1, 5, true);
    styleBereichRahmen(worksheet, endbestandZeile, endbestandZeile, 1, 5, true);

    worksheet.views = [{ showGridLines: true }];

    const buffer = await workbook.xlsx.writeBuffer();

    const dateipfad = await save({
        defaultPath: baueDateiname(daten.titel),
        filters: [
            {
                name: "Excel",
                extensions: ["xlsx"],
            },
        ],
    });

    if (!dateipfad) return;

    await writeFile(dateipfad, new Uint8Array(buffer as ArrayBuffer));
}