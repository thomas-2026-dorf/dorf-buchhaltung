import { ladeBelegeAusJahresdatei } from "../../../lib/belege"
import type { BelegData } from "../types/bankSlimTypes"

export async function loadBankBelege(
    baseFolder?: string,
    year?: string
): Promise<BelegData[]> {
    if (!baseFolder || !year) {
        throw new Error("Basisordner oder Jahr fehlt.")
    }

    const originalBelege = await ladeBelegeAusJahresdatei(baseFolder, year)

    return originalBelege.map((beleg) => ({
        id: beleg.id,
        fewoId:
            beleg.fewo === "Tina"
                ? "tina"
                : beleg.fewo === "Harmony"
                    ? "harmony"
                    : beleg.fewo === "Tinchen"
                        ? "tinchen"
                        : "privat",
        konto: beleg.konto || "",
        lieferant: beleg.lieferant || "",
        pfad: beleg.pfad || "",
        rechnungsnummer: beleg.rechnungsnummer || "",
        betrag: String(beleg.betrag ?? ""),
        datum: beleg.datum || "",
    }))
}