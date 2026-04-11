import { mkdir, writeFile } from "@tauri-apps/plugin-fs";
import type { BankBooking, DerivedBookingView } from "../bank-ui/types/bankSlimTypes";

type BuildKontoCsvParams = {
    bookings: BankBooking[];
    views: DerivedBookingView[];
};

type CsvCell = {
    value: string;
    isFormula?: boolean;
};

function escapeCsv(value: string): string {
    const safe = String(value ?? "").replace(/"/g, '""');
    return `"${safe}"`;
}

function formatAmount(value: number): string {
    if (!Number.isFinite(value)) return "0,00";
    return value.toFixed(2).replace(".", ",");
}

function buildExcelHyperlink(path: string): string {
    const safePath = String(path ?? "").trim();
    if (!safePath) return "";

    const fileName = safePath.split("/").pop() || "";
    if (!fileName) return "";

    const relativePath = `../Belege/${fileName}`;
    return `=HYPERLINK("${relativePath}";"Öffnen")`;
}

function formatCsvCell(value: string, isFormula = false): string {
    if (isFormula) return value;
    return escapeCsv(value);
}

function buildKontoRow(
    booking: BankBooking,
    view?: DerivedBookingView
): CsvCell[] {
    const splitBelegeText = (view?.splitAssignments || [])
        .map((item) =>
            item.betrag?.trim() ? `${item.belegId} (${item.betrag})` : item.belegId
        )
        .join(" | ");

    return [
        { value: booking.datum || "" },
        { value: view?.belegId || "" },
        { value: booking.verwendungszweck || "" },
        { value: formatAmount(booking.betrag) },
        { value: view?.status || "offen" },
        { value: view?.fewo || "" },
        { value: view?.konto || "" },
        { value: splitBelegeText },
        { value: view?.bemerkung || "" },
        { value: view?.lieferant || "" },
    ];
}

export function buildKontoCsv({
    bookings,
    views,
}: BuildKontoCsvParams): string {
    const header = [
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
    ];

    const lines = [
        header.map(escapeCsv).join(";"),
        ...bookings.map((booking) => {
            const view = views.find((entry) => entry.bookingKey === booking.bookingKey);

            return buildKontoRow(booking, view)
                .map((cell) => formatCsvCell(cell.value, cell.isFormula ?? false))
                .join(";");
        }),
    ];

    return lines.join("\n");
}

export function buildKontoKontrollCsv({
    bookings,
    views,
}: BuildKontoCsvParams): string {
    const header = [
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

    const lines = [
        header.map(escapeCsv).join(";"),
        ...bookings.map((booking) => {
            const view = views.find((entry) => entry.bookingKey === booking.bookingKey);

            const row: CsvCell[] = [
                ...buildKontoRow(booking, view),
                { value: buildExcelHyperlink(view?.pfad || ""), isFormula: true },
            ];

            return row
                .map((cell) => formatCsvCell(cell.value, cell.isFormula ?? false))
                .join(";");
        }),
    ];

    return lines.join("\n");
}

export async function saveKontoCsvToExport(
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