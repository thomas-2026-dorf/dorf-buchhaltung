import { save } from "@tauri-apps/plugin-dialog";
import { writeFile } from "@tauri-apps/plugin-fs";
import * as XLSX from "xlsx";

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

export async function exportiereKassenblattExcel({
    titel,
    anfangsbestand,
    endbestand,
    zeilen,
}: ExcelDaten) {
    try {
        const daten: (string | number)[][] = [];

        daten.push([titel]);
        daten.push([]);
        daten.push(["Anfangsbestand", anfangsbestand]);
        daten.push([]);
        daten.push([
            "Datum",
            "Titel / Beschreibung",
            "Einnahme",
            "Ausgabe",
            "Laufender Bestand",
        ]);

        zeilen.forEach((z) => {
            daten.push([
                z.datum,
                z.titel,
                z.einnahme || "",
                z.ausgabe || "",
                z.bestand,
            ]);
        });

        daten.push([]);
        daten.push(["Endbestand", endbestand]);

        const ws = XLSX.utils.aoa_to_sheet(daten);

        // Spaltenbreite
        ws["!cols"] = [
            { wch: 14 },
            { wch: 48 },
            { wch: 14 },
            { wch: 14 },
            { wch: 18 },
        ];

        const startRow = 6;
        const endRow = startRow + zeilen.length - 1;
        const endbestandRow = endRow + 3;

        // Zahlenformat
        for (let row = startRow; row <= endRow; row++) {
            ["C", "D", "E"].forEach((col) => {
                const cell = ws[`${col}${row}`];
                if (cell) cell.z = '#,##0.00 "€"';
            });
        }

        if (ws["B3"]) ws["B3"].z = '#,##0.00 "€"';
        if (ws[`B${endbestandRow}`]) ws[`B${endbestandRow}`].z = '#,##0.00 "€"';

        // Autofilter
        ws["!autofilter"] = { ref: `A5:E${Math.max(5, endRow)}` };

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Kassenblatt");

        const wbArray = XLSX.write(wb, {
            bookType: "xlsx",
            type: "array",
        });

        const zielPfad = await save({
            defaultPath: baueDateiname(titel),
            filters: [
                {
                    name: "Excel",
                    extensions: ["xlsx"],
                },
            ],
        });

        if (!zielPfad) return;

        await writeFile(zielPfad, new Uint8Array(wbArray));

        alert(`Excel exportiert:\n${zielPfad}`);
    } catch (error) {
        alert("Excel-Export fehlgeschlagen: " + String(error));
    }
}