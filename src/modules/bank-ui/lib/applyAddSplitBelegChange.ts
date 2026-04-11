import type { SlimAssignmentMap } from "../types/bankSlimTypes"
import { getAddSplitBelegResult } from "./getAddSplitBelegResult"

type AddSplitDecision =
    | { type: "already-included" }
    | { type: "duplicate"; andererBookingKey: string }
    | { type: "success"; nextAssignments: SlimAssignmentMap }

export function applyAddSplitBelegChange(
    prev: SlimAssignmentMap,
    bookingKey: string,
    belegId: string
): AddSplitDecision {
    const result = getAddSplitBelegResult(prev, bookingKey, belegId)

    if (result.type === "already-included") {
        return { type: "already-included" }
    }

    if (result.type === "duplicate") {
        return {
            type: "duplicate",
            andererBookingKey: result.andererBookingKey,
        }
    }

    return {
        type: "success",
        nextAssignments: result.nextAssignments,
    }
}
