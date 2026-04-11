import type { SlimAssignmentMap } from "../types/bankSlimTypes"

export function applyFewoChange(
    prev: SlimAssignmentMap,
    bookingKey: string,
    fewo: string
): SlimAssignmentMap {
    const next = { ...prev }
    const current = next[bookingKey] || {}

    next[bookingKey] = {
        ...current,
        fewo,
    }

    return next
}
