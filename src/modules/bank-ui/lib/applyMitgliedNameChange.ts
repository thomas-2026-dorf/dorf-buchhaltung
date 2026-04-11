import type { SlimAssignmentMap } from "../types/bankSlimTypes"

export function applyMitgliedNameChange(
    prev: SlimAssignmentMap,
    bookingKey: string,
    mitgliedName: string
): SlimAssignmentMap {
    const next = { ...prev }
    const current = next[bookingKey] || {}

    next[bookingKey] = {
        ...current,
        mitgliedName,
    }

    return next
}
