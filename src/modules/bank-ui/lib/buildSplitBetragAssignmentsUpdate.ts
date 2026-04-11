import type { SlimAssignmentMap } from "../types/bankSlimTypes"

export function buildSplitBetragAssignmentsUpdate(
    prev: SlimAssignmentMap,
    bookingKey: string,
    belegId: string,
    betrag: string
): SlimAssignmentMap {
    const current = prev[bookingKey] || {}
    const currentSplit = Array.isArray(current.splitAssignments)
        ? current.splitAssignments
        : []

    return {
        ...prev,
        [bookingKey]: {
            ...current,
            splitAssignments: currentSplit.map((item) =>
                item.belegId === belegId
                    ? { ...item, betrag }
                    : item
            ),
        },
    }
}
