import type { SlimAssignmentMap } from "../types/bankSlimTypes"

export function buildAssignmentsAfterBelegReset(
    prev: SlimAssignmentMap,
    bookingKey: string
): SlimAssignmentMap {
    const next = { ...prev }
    const current = prev[bookingKey]

    if (current?.bemerkung?.trim()) {
        next[bookingKey] = {
            belegId: "",
            bemerkung: current.bemerkung,
        }
    } else {
        delete next[bookingKey]
    }

    return next
}
