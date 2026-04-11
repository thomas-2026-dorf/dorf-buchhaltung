import { ermittleBelegVorschlaege } from "../../bank/matching"
import type { Beleg } from "../../../lib/belege"
import type { BelegData } from "../types/bankSlimTypes"
import type { BankCsvRow } from "../../bank/types"

function mapFewoToFewoId(fewo?: string): string {
    if (fewo === "Tina") return "tina"
    if (fewo === "Harmony") return "harmony"
    return "tinchen"
}

export function buildSuggestionMap(
    nextBookingsAlt: Array<BankCsvRow & { bookingKey: string }>,
    originalBelege: Beleg[]
): Record<string, BelegData[]> {
    const nextSuggestionMap: Record<string, BelegData[]> = {}

    for (const bookingAlt of nextBookingsAlt) {
        const vorschlaege = ermittleBelegVorschlaege(bookingAlt, originalBelege)

        nextSuggestionMap[bookingAlt.bookingKey] = vorschlaege.map((v) => ({
            id: v.originalBeleg.id,
            fewoId: mapFewoToFewoId(v.originalBeleg.fewo),
            konto: v.originalBeleg.konto || "",
            lieferant: v.originalBeleg.lieferant || "",
            pfad: v.originalBeleg.pfad || "",
            rechnungsnummer: (v.originalBeleg as any).rechnungsnummer || "",
            betrag: String((v.originalBeleg as any).betrag ?? ""),
            datum: v.originalBeleg.datum || "",
        }))
    }

    return nextSuggestionMap
}
