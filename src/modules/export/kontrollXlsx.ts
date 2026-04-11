import { mkdir, writeFile } from "@tauri-apps/plugin-fs";
import * as XLSX from "xlsx";

type BankKontrollRow = {
    datum: string;
    belegId: string;
    verwendungszweck: string;
    betrag: string;
    status: string;
    fewo: string;
    konto: string;
    splitBelege: string;
    bemerkung: string;
    lieferant: string;
    pdfPath: string;
};

type BelegKontrollRow = {
    belegId: string;
    datum: string;
    lieferant: string;
    rechnungsnummer: string;
    betrag: string;
    fewo: string;
    konto: string;
    zahlungsart: string;
    split: string;
    splitTina: string;
    splitHarmony: string;
    splitTinchen: string;
    splitRS: string;
    splitPrivat: string;
    notiz: string;
    pdfPath: string;
};

function sanitizeSheetName(value: string): string {
    const cleaned = String(value ?? "Kontrolle")
        .replace(/[\\/*?:[\]]/g, " ")
        .trim();

    return cleaned.slice(0, 31) || "Kontrolle";
}

function toFileUrl(path: string): string {
    const normalized = String(path ?? "").trim().replace(/\\/g, "/");
    if (!normalized) return "";

    const encoded = normalized
        .split("/")
        .map((part, index) => (index === 0 ? part : encodeURIComponent(part)))
        .join("/");

    return `file://${encoded}`;
}

function addPdfLinks(
    worksheet: XLSX.WorkSheet,
    pdfPaths: string[],
    columnIndex: number
) {
    for (let i = 0; i < pdfPaths.length; i += 1) {
        const pdfPath = String(pdfPaths[i] ?? "").trim();
        if (!pdfPath) continue;

        const cellRef = XLSX.utils.encode_cell({
            r: i + 1,
            c: columnIndex,
        });

        const cell = worksheet[cellRef];
        if (!cell) continue;

        cell.v = "Öffnen";
        cell.t = "s";
        cell.l = {
            Target: toFileUrl(pdfPath),
            Tooltip: pdfPath,
        };
    }
}

function buildWorkbook(
    sheetName: string,
    headers: string[],
    rows: string[][],
    pdfPaths: string[],
    colWidths: number[]
): XLSX.WorkBook {
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);

    worksheet["!cols"] = colWidths.map((width) => ({ wch: width }));

    addPdfLinks(worksheet, pdfPaths, headers.length - 1);

    XLSX.utils.book_append_sheet(
        workbook,
        worksheet,
        sanitizeSheetName(sheetName)
    );

    return workbook;
}

export function buildBankKontrollWorkbook(params: {
    title: string;
    rows: BankKontrollRow[];
}): XLSX.WorkBook {
    const headers = [
        "Datum",
        "Beleg-ID",
        "Verwendungszweck",
        "Betrag",
        "Status",
        "Einheit",
        "Konto",
        "Split-Belege",
        "Bemerkung",
        "Lieferant",
        "PDF öffnen",
    ];

    const rows = params.rows.map((row) => [
        row.datum,
        row.belegId,
        row.verwendungszweck,
        row.betrag,
        row.status,
        row.fewo,
        row.konto,
        row.splitBelege,
        row.bemerkung,
        row.lieferant,
        row.pdfPath ? "Öffnen" : "",
    ]);

    const pdfPaths = params.rows.map((row) => row.pdfPath);

    return buildWorkbook(params.title, headers, rows, pdfPaths, [
        12, 14, 42, 12, 14, 14, 14, 24, 22, 22, 14,
    ]);
}

export function buildBelegKontrollWorkbook(params: {
    title: string;
    rows: BelegKontrollRow[];
}): XLSX.WorkBook {
    const headers = [
        "Beleg-ID",
        "Datum",
        "Lieferant",
        "Rechnungsnummer",
        "Betrag",
        "Einheit",
        "Konto",
        "Zahlungsart",
        "Split",
        "Split Tina",
        "Split Harmony",
        "Split Tinchen",
        "Split RS",
        "Split Privat",
        "Notiz",
        "PDF öffnen",
    ];

    const rows = params.rows.map((row) => [
        row.belegId,
        row.datum,
        row.lieferant,
        row.rechnungsnummer,
        row.betrag,
        row.fewo,
        row.konto,
        row.zahlungsart,
        row.split,
        row.splitTina,
        row.splitHarmony,
        row.splitTinchen,
        row.splitRS,
        row.splitPrivat,
        row.notiz,
        row.pdfPath ? "Öffnen" : "",
    ]);

    const pdfPaths = params.rows.map((row) => row.pdfPath);

    return buildWorkbook(params.title, headers, rows, pdfPaths, [
        14, 12, 24, 20, 12, 14, 14, 14, 10, 12, 14, 14, 12, 14, 28, 14,
    ]);
}

export async function saveKontrollWorkbookToExport(
    baseFolder: string,
    filename: string,
    workbook: XLSX.WorkBook
) {
    const exportFolder = `${baseFolder}/Export-STB/CSV`;
    const filePath = `${exportFolder}/${filename}`;

    await mkdir(exportFolder, { recursive: true });

    const buffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
    });

    const bytes = new Uint8Array(buffer);
    await writeFile(filePath, bytes);

    return filePath;
}