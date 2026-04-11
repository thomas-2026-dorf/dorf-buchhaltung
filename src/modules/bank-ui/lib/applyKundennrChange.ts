import type { SlimAssignmentMap } from "../types/bankSlimTypes"

export function applyKundennrChange(
    prev: SlimAssignmentMap,
    bookingKey: string,
    kundennr: string
): SlimAssignmentMap {
    const next = { ...prev }
    const current = next[bookingKey] || {}

    next[bookingKey] = {
        ...current,
        kundennr,
    }

    return next
}
