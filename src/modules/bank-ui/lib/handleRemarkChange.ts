import type { SlimAssignmentMap } from "../types/bankSlimTypes"
import { buildRemarkAssignmentsUpdate } from "./buildRemarkAssignmentsUpdate"

export function handleRemarkChange(
    prev: SlimAssignmentMap,
    bookingKey: string,
    bemerkung: string
): SlimAssignmentMap {
    return buildRemarkAssignmentsUpdate(prev, bookingKey, bemerkung)
}
