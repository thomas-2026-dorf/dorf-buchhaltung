import type { SlimAssignmentMap } from "../types/bankSlimTypes"
import { findDuplicateAssignment } from "./bankImportHelpers"

type AddSplitBelegResult =
    | { type: "missing-beleg-id"; nextAssignments: SlimAssignmentMap }
    | { type: "already-included"; nextAssignments: SlimAssignmentMap }
    | {
          type: "duplicate"
          nextAssignments: SlimAssignmentMap
          andererBookingKey: string
      }
    | { type: "success"; nextAssignments: SlimAssignmentMap }

export function getAddSplitBelegResult(
    prev: SlimAssignmentMap,
    bookingKey: string,
    belegId: string
): AddSplitBelegResult {
    if (!belegId) {
        return {
            type: "missing-beleg-id",
            nextAssignments: prev,
        }
    }

    const current = prev[bookingKey] || {}
    const currentSplit = Array.isArray(current.splitAssignments)
        ? current.splitAssignments
        : []

    const alreadyIncluded =
        current.belegId === belegId ||
        currentSplit.some((item) => item.belegId === belegId)

    if (alreadyIncluded) {
        return {
            type: "already-included",
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

    return {
        type: "success",
        nextAssignments: {
            ...prev,
            [bookingKey]: {
                ...current,
                splitAssignments: [...currentSplit, { belegId, betrag: "" }],
            },
        },
    }
}
