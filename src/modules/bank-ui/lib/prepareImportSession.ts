import { buildImportSessionId } from "../../bank/matching"
import { loadExistingAssignmentsForImport } from "./loadExistingAssignmentsForImport"
import type { SlimAssignmentMap } from "../types/bankSlimTypes"

export async function prepareImportSession(
    baseFolder: string,
    year: string,
    fileName: string
): Promise<{
    importId: string
    geladeneAssignments: SlimAssignmentMap
}> {
    const importId = buildImportSessionId(fileName, `${year}-import`)

    const geladeneAssignments = await loadExistingAssignmentsForImport(
        baseFolder,
        fileName,
        importId
    )

    return {
        importId,
        geladeneAssignments,
    }
}
