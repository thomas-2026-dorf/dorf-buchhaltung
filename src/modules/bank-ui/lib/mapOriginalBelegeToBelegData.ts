import type { Beleg } from "../../../lib/belege"
import type { BelegData } from "../types/bankSlimTypes"

function mapFewoToFewoId(fewo?: string): string {
    if (fewo === "Tina") return "tina"
    if (fewo === "Harmony") return "harmony"
    if (fewo === "Tinchen") return "tinchen"
    return "privat"
}

export function mapOriginalBelegeToBelegData(originalBelege: Beleg[]): BelegData[] {
    return originalBelege.map((beleg) => ({
        id: beleg.id,
        fewoId: mapFewoToFewoId(beleg.fewo),
        konto: beleg.konto || "",
        lieferant: beleg.lieferant || "",
        pfad: beleg.pfad || "",
        rechnungsnummer: (beleg as any).rechnungsnummer || "",
        betrag: String((beleg as any).betrag ?? ""),
        datum: beleg.datum || "",
    }))
}
