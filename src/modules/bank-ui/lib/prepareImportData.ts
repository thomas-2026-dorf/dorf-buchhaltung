import type { Beleg } from "../../../lib/belege"
import type { BelegData, SlimAssignmentMap } from "../types/bankSlimTypes"
import { toBankBookings } from "../../bank/matching"
import { mapOriginalBelegeToBelegData } from "./mapOriginalBelegeToBelegData"
import { buildSuggestionMap } from "./buildSuggestionMap"

export function prepareImportData(
    originalBelege: Beleg[],
    nextBookingsAlt: ReturnType<typeof toBankBookings>,
    geladeneAssignments: SlimAssignmentMap
): {
    mappedBelege: BelegData[]
    nextSuggestionMap: Record<string, BelegData[]>
    nextAssignments: SlimAssignmentMap
} {
    const mappedBelege = mapOriginalBelegeToBelegData(originalBelege)

    const nextSuggestionMap = buildSuggestionMap(
        nextBookingsAlt,
        originalBelege
    )

    const nextAssignments: SlimAssignmentMap = { ...geladeneAssignments }

    return {
        mappedBelege,
        nextSuggestionMap,
        nextAssignments,
    }
}
