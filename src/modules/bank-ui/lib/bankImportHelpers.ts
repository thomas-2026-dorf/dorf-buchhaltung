import Papa from "papaparse"
import type { BankCsvRow } from "../../bank/types"
import type { SlimAssignmentMap } from "../types/bankSlimTypes"
import {
    type CsvFeldZuordnung,
    CSV_FELD_DEFAULT,
    erkenneFelderAusKopfzeile,
} from "../../../lib/settings/csvFeldZuordnung"

const DATE_PATTERN = /^\d{2}\.\d{2}\.\d{4}$/

function findHeaderAndDataStart(data: string[][]): { headerIdx: number; dataStart: number } {
    for (let i = 0; i < data.length; i++) {
        const row = data[i]
        if (DATE_PATTERN.test(row[0]?.trim() || "") || DATE_PATTERN.test(row[1]?.trim() || "")) {
            return { headerIdx: i - 1, dataStart: i }
        }
    }
    return { headerIdx: 0, dataStart: 1 }
}

export function parseCsv(text: string, zuordnung?: CsvFeldZuordnung): BankCsvRow[] {
    const sep = zuordnung?.trennzeichen || ";"

    const result = Papa.parse<string[]>(text.replace(/^﻿/, ""), {
        delimiter: sep,
        skipEmptyLines: true,
    })

    const data = result.data
    if (!data || data.length < 2) return []

    const { headerIdx, dataStart } = findHeaderAndDataStart(data)

    // Spalten-Mapping: zuerst aus Kopfzeile, dann gespeicherte Zuordnung, dann Default
    let mapping: CsvFeldZuordnung
    if (headerIdx >= 0 && data[headerIdx]) {
        mapping = erkenneFelderAusKopfzeile(data[headerIdx].join(sep), sep)
    } else {
        mapping = zuordnung ?? { ...CSV_FELD_DEFAULT }
    }

    const rows: BankCsvRow[] = []

    for (let i = dataStart; i < data.length; i++) {
        const parts = data[i]
        const datumRaw = parts[mapping.buchungstag]?.trim() || ""
        if (!DATE_PATTERN.test(datumRaw)) continue

        const zweckTeile = [
            mapping.buchungstext >= 0 ? parts[mapping.buchungstext]?.trim() : "",
            parts[mapping.verwendungszweck]?.trim() || "",
        ].filter(Boolean)

        rows.push({
            bookingDate: datumRaw,
            valueDate:   mapping.valuta >= 0 ? (parts[mapping.valuta]?.trim() || "") : "",
            payee:       mapping.auftraggeber >= 0 ? (parts[mapping.auftraggeber]?.trim() || "") : "",
            purpose:     zweckTeile.join(" ").trim(),
            amount:      parseFloat((parts[mapping.betrag] || "0").replace(/\./g, "").replace(",", ".")),
            account:     "",
            raw: {
                auftragskonto:    "",
                buchungstag:      datumRaw,
                valutadatum:      mapping.valuta >= 0 ? (parts[mapping.valuta] || "") : "",
                buchungstext:     mapping.buchungstext >= 0 ? (parts[mapping.buchungstext] || "") : "",
                verwendungszweck: parts[mapping.verwendungszweck] || "",
                beguenstigter:    mapping.auftraggeber >= 0 ? (parts[mapping.auftraggeber] || "") : "",
                iban:             "",
                bic:              "",
                betrag:           parts[mapping.betrag] || "",
                waehrung:         mapping.waehrung >= 0 ? (parts[mapping.waehrung] || "") : "",
                info:             "",
                kategorie:        "",
                mitgliedsnummer:  mapping.mitgliedsnummer >= 0
                    ? (parts[mapping.mitgliedsnummer]?.trim() || "")
                    : "",
            },
        })
    }

    return rows
}

export function extractNameSuggestion(verwendungszweck?: string) {
    if (!verwendungszweck) return ""
    return verwendungszweck.split("|")[0].replace(/\s+/g, " ").trim()
}

function extractStableKeyParts(key: string) {
    const parts = key.split("|")
    const date = parts[0] || ""
    const amount = parts[1] || ""
    const text = parts.slice(2).join("|").toLowerCase()
    const textShort = text.replace(/[^\w\s]/g, "").replace(/\s+/g, " ").trim().slice(0, 40)
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
        if (existingKey === currentKey) return false
        return true
    })
}
