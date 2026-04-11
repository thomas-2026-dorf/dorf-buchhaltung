import type { SlimAssignmentMap } from "../types/bankSlimTypes"

export function removeSplitBeleg(
    prev: SlimAssignmentMap,
    bookingKey: string,
    belegId: string
): SlimAssignmentMap {
    const current = prev[bookingKey] || {}

    const nextSplit = (current.splitAssignments || []).filter(
        (entry) => entry.belegId !== belegId
    )

    return {
        ...prev,
        [bookingKey]: {
            ...current,
            splitAssignments: nextSplit,
        },
    }
}
