import type { BelegData, SlimAssignmentMap } from "../types/bankSlimTypes"
import { findDuplicateAssignment } from "./bankImportHelpers"

type HandleAssignResult =
    | { type: "not-found"; nextAssignments: SlimAssignmentMap }
    | {
          type: "duplicate"
          nextAssignments: SlimAssignmentMap
          andererBookingKey: string
      }
    | { type: "success"; nextAssignments: SlimAssignmentMap }

export function getHandleAssignResult(
    prev: SlimAssignmentMap,
    bookingKey: string,
    belegId: string,
    belege: BelegData[]
): HandleAssignResult {
    const next = { ...prev }
    const current = prev[bookingKey] || {}

    if (!belegId) {
        if (current.bemerkung?.trim()) {
            next[bookingKey] = {
                belegId: "",
                bemerkung: current.bemerkung,
            }
        } else {
            delete next[bookingKey]
        }

        return {
            type: "success",
            nextAssignments: next,
        }
    }

    const belegExistiert = belege.some((beleg) => beleg.id === belegId)
    if (!belegExistiert) {
        return {
            type: "not-found",
            nextAssignments: prev,
        }
    }

    const duplicate = findDuplicateAssignment(prev, bookingKey, belegId)
    if (duplicate) {
        return {
            type: "duplicate",
            nextAssignments: prev,
            andererBookingKey: duplicate[0],
        }
    }

    next[bookingKey] = {
        ...current,
        belegId,
    }

    return {
        type: "success",
        nextAssignments: next,
    }
}
