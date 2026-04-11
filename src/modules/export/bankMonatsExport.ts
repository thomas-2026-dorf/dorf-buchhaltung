import { mkdir, writeFile } from "@tauri-apps/plugin-fs";
import type { BankBooking } from "../bank-ui/types/bankSlimTypes";

type BuildBankMonatCsvParams = {
    bookings: BankBooking[];
};

function escapeCsv(value: string): string {
    const safe = String(value ?? "").replace(/"/g, '""');
    return `"${safe}"`;
}

function formatAmount(value: number): string {
    if (!Number.isFinite(value)) return "0,00";
    return value.toFixed(2).replace(".", ",");
}

export function buildBankMonatCsv({
    bookings,
}: BuildBankMonatCsvParams): string {
    const header = [
        "Datum",
        "Betrag",
        "Verwendungszweck",
        "Bank-Key",
    ];

    const lines = [
        header.map(escapeCsv).join(";"),
        ...bookings.map((booking) =>
            [
                booking.datum || "",
                formatAmount(booking.betrag),
                booking.verwendungszweck || "",
                booking.bookingKey || "",
            ]
                .map(escapeCsv)
                .join(";")
        ),
    ];

    return lines.join("\n");
}

export async function saveBankMonatCsvToExport(
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

export function getBankMonatCsvFilenameFromJsonFilename(jsonFilename: string): string {
    if (jsonFilename.endsWith("-bank-daten.json")) {
        return jsonFilename.replace("-bank-daten.json", "-bank.csv");
    }

    if (jsonFilename.endsWith(".json")) {
        return jsonFilename.replace(".json", ".csv");
    }

    return `${jsonFilename}.csv`;
}