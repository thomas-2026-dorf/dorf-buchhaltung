import type { SlimAssignmentMap } from "../types/bankSlimTypes"

export function applyAnzahlungChange(
    prev: SlimAssignmentMap,
    bookingKey: string,
    istAnzahlung: boolean
): SlimAssignmentMap {
    const next = { ...prev }
    const current = next[bookingKey] || {}

    next[bookingKey] = {
        ...current,
        istAnzahlung,
    }

    return next
}
