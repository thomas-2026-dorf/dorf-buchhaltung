import type { SlimAssignmentMap } from "../types/bankSlimTypes"
import { buildSplitBetragAssignmentsUpdate } from "./buildSplitBetragAssignmentsUpdate"

export function applySplitBetragChange(
    prev: SlimAssignmentMap,
    bookingKey: string,
    belegId: string,
    betrag: string
): SlimAssignmentMap {
    return buildSplitBetragAssignmentsUpdate(prev, bookingKey, belegId, betrag)
}
