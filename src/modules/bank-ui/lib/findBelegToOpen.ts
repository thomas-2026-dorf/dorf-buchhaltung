import { ladeBelegeAusJahresdatei } from "../../../lib/belege"

type FindBelegToOpenResult =
    | { type: "missing-input" }
    | { type: "not-found" }
    | { type: "success"; beleg: Awaited<ReturnType<typeof ladeBelegeAusJahresdatei>>[number] }

export async function findBelegToOpen(
    baseFolder: string | undefined,
    year: string | undefined,
    belegId: string
): Promise<FindBelegToOpenResult> {
    if (!baseFolder || !year || !belegId) {
        return { type: "missing-input" }
    }

    const originalBelege = await ladeBelegeAusJahresdatei(baseFolder, year)
    const beleg = originalBelege.find((item) => item.id === belegId)

    if (!beleg) {
        return { type: "not-found" }
    }

    return {
        type: "success",
        beleg,
    }
}
