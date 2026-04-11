import Papa from "papaparse"
import type { BankCsvRow } from "../../bank/types"
import type { SlimAssignmentMap } from "../types/bankSlimTypes"

export function parseCsv(text: string): BankCsvRow[] {
    const result = Papa.parse<string[]>(text, {
        delimiter: ";",
        skipEmptyLines: true,
    })

    const data = result.data

    if (!data || data.length < 2) {
        return []
    }

    const rows: BankCsvRow[] = []

    for (let i = 1; i < data.length; i++) {
        const parts = data[i]

        rows.push({
            bookingDate: parts[1]?.trim() || "",
            valueDate: parts[2]?.trim() || "",
            payee: parts[5]?.trim() || "",
            purpose: `${parts[3]?.trim() || ""} ${parts[4]?.trim() || ""}`.trim(),
            amount: parseFloat((parts[8] || "0").replace(/\./g, "").replace(",", ".")),
            account: parts[0]?.trim() || "",
            raw: {
                auftragskonto: parts[0] || "",
                buchungstag: parts[1] || "",
                valutadatum: parts[2] || "",
                buchungstext: parts[3] || "",
                verwendungszweck: parts[4] || "",
                beguenstigter: parts[5] || "",
                iban: parts[6] || "",
                bic: parts[7] || "",
                betrag: parts[8] || "",
                waehrung: parts[9] || "",
                info: parts[10] || "",
                kategorie: parts[11] || "",
            },
        })
    }

    return rows
}

export function extractNameSuggestion(verwendungszweck?: string) {
    if (!verwendungszweck) return ""

    return verwendungszweck
        .split("|")[0]
        .replace(/\s+/g, " ")
        .trim()
}

function extractStableKeyParts(key: string) {
    const parts = key.split("|")

    const date = parts[0] || ""
    const amount = parts[1] || ""

    const text = parts.slice(2).join("|").toLowerCase()

    const textShort = text
        .replace(/[^\w\s]/g, "")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 40)

    return `${date}|${amount}|${textShort}`
}

export function findDuplicateAssignment(
    assignments: SlimAssignmentMap,
    bookingKey: string,
    belegId: string
) {
    const currentKey = extractStableKeyParts(bookingKey)

    return Object.entries(assignments).find(([key, value]) => {
        if (value?.belegId !== belegId) return false

        if (key === bookingKey) return false

        const existingKey = extractStableKeyParts(key)

        // 👉 gleiche Buchung → NICHT blockieren
        if (existingKey === currentKey) return false

        // 👉 echte andere Buchung → blockieren
        return true
    })
}
