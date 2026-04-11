import { mkdir, writeFile } from "@tauri-apps/plugin-fs";
import type { Beleg } from "../../lib/belege";

type CsvCell = {
    value: string;
    isFormula?: boolean;
};

function escapeCsv(value: string): string {
    const safe = String(value ?? "").replace(/"/g, '""');
    return `"${safe}"`;
}

function formatAmount(value: string): string {
    const num = Number(String(value ?? "0").replace(",", "."));
    if (!Number.isFinite(num)) return "0,00";
    return num.toFixed(2).replace(".", ",");
}

function buildExcelHyperlink(fileName: string): string {
    const safeFileName = String(fileName ?? "").trim();
    if (!safeFileName) return "";

    const relativePath = `../Belege/${safeFileName}`;
    return `=HYPERLINK("${relativePath}";"Öffnen")`;
}

function formatCsvCell(value: string, isFormula = false): string {
    if (isFormula) return value;
    return escapeCsv(value);
}

function buildBelegRow(b: Beleg): CsvCell[] {
    return [
        { value: b.id },
        { value: b.datum },
        { value: b.lieferant },
        { value: b.rechnungsnummer || "" },
        { value: formatAmount(b.betrag) },
        { value: b.fewo },
        { value: b.konto },
        { value: b.zahlungsart || "bank" },
        { value: b.splitMode ? "ja" : "nein" },
        { value: b.splitTina || "" },
        { value: b.splitHarmony || "" },
        { value: b.splitTinchen || "" },
        { value: b.splitRS || "" },
        { value: b.splitPrivat || "" },
        { value: b.notiz || "" },
    ];
}

export function buildBelegCsv(belege: Beleg[]): string {
    const header = [
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
    ];

    const lines = [
        header.map(escapeCsv).join(";"),
        ...belege.map((b) =>
            buildBelegRow(b)
                .map((cell) => formatCsvCell(cell.value, cell.isFormula ?? false))
                .join(";")
        ),
    ];

    return lines.join("\n");
}

export function buildBelegKontrollCsv(belege: Beleg[]): string {
    const header = [
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

    const lines = [
        header.map(escapeCsv).join(";"),
        ...belege.map((b) => {
            const row: CsvCell[] = [
                ...buildBelegRow(b),
                { value: buildExcelHyperlink(b.dateiname || ""), isFormula: true },
            ];

            return row
                .map((cell) => formatCsvCell(cell.value, cell.isFormula ?? false))
                .join(";");
        }),
    ];

    return lines.join("\n");
}

export async function saveBelegCsvToExport(
    baseFolder: string,
    year: string,
    csvContent: string
) {
    const exportFolder = `${baseFolder}/Export`;
    const filePath = `${exportFolder}/belegliste-${year}.csv`;

    await mkdir(exportFolder, { recursive: true });

    const bytes = new TextEncoder().encode(csvContent);
    await writeFile(filePath, bytes);

    return filePath;
}

export async function saveBelegMonatCsvToExport(
    baseFolder: string,
    filename: string,
    csvContent: string
) {
    const exportFolder = `${baseFolder}/Export-STB/CSV`;
    const filePath = `${exportFolder}/${filename}`;

    await mkdir(exportFolder, { recursive: true });

    const bytes = new TextEncoder().encode(csvContent);
    await writeFile(filePath, bytes);

    return filePath;
}

export function downloadCsv(filename: string, csvContent: string) {
    const blob = new Blob([csvContent], {
        type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.style.display = "none";

    document.body.appendChild(link);
    link.click();

    setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }, 1000);
}