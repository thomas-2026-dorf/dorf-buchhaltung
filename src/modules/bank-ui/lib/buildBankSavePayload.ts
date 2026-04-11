import type { BankBooking, SlimAssignmentMap } from "../types/bankSlimTypes"

type BuildBankSavePayloadParams = {
    currentImportId: string
    currentFileName: string
    bookings: BankBooking[]
    assignments: SlimAssignmentMap
}

export function buildBankSavePayload({
    currentImportId,
    currentFileName,
    bookings,
    assignments,
}: BuildBankSavePayloadParams) {
    return {
        importId: currentImportId,
        fileName: currentFileName,
        bookings,
        assignments: Object.fromEntries(
            Object.entries(assignments)
                .filter(([, value]) =>
                    !!value?.belegId ||
                    !!value?.bemerkung?.trim() ||
                    !!value?.kundennr?.trim() ||
                    !!value?.mitgliedId?.trim() ||
                    !!value?.mitgliedName?.trim() ||
                    !!value?.fewo?.trim() ||
                    !!value?.istAnzahlung ||
                    value?.belegFehlt === true ||
                    !!value?.splitAssignments?.length
                )
                .map(([bookingKey, value]) => [
                    bookingKey,
                    {
                        belegId: value.belegId || "",
                        bemerkung: value.bemerkung || "",
                        kundennr: value.kundennr || "",
                        mitgliedId: value.mitgliedId || "",
                        mitgliedName: value.mitgliedName || "",
                        fewo: value.fewo || "",
                        istAnzahlung: !!value.istAnzahlung,
                        belegFehlt: value.belegFehlt === true,
                        splitAssignments: Array.isArray(value.splitAssignments)
                            ? value.splitAssignments.filter((item) => !!item?.belegId)
                            : [],
                    },
                ])
        ),
        savedAt: new Date().toISOString(),
    }
}
