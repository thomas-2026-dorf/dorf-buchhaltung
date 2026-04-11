import type { SlimAssignmentMap } from "../types/bankSlimTypes"

export function buildRemarkAssignmentsUpdate(
    prev: SlimAssignmentMap,
    bookingKey: string,
    bemerkung: string
): SlimAssignmentMap {
    const current = prev[bookingKey] || {}

    if (!bemerkung.trim() && !current.belegId) {
        const next = { ...prev }
        delete next[bookingKey]
        return next
    }

    return {
        ...prev,
        [bookingKey]: {
            belegId: current.belegId || "",
            bemerkung,
        },
    }
}
