import type { BelegData, SlimAssignmentMap } from "../types/bankSlimTypes"
import { getHandleAssignResult } from "./getHandleAssignResult"

type AssignDecision =
    | { type: "not-found" }
    | { type: "duplicate"; andererBookingKey: string }
    | { type: "success"; nextAssignments: SlimAssignmentMap }

export function applyAssignChange(
    prev: SlimAssignmentMap,
    bookingKey: string,
    belegId: string,
    belege: BelegData[]
): AssignDecision {
    const result = getHandleAssignResult(prev, bookingKey, belegId, belege)

    if (result.type === "not-found") {
        return { type: "not-found" }
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
