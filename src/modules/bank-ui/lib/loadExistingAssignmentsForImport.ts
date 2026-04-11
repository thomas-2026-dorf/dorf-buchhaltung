import { readDir } from "@tauri-apps/plugin-fs"
import { invoke } from "@tauri-apps/api/core"
import type { SlimAssignmentMap } from "../types/bankSlimTypes"

type RawLoadedAssignment = {
    belegId?: string
    bemerkung?: string
    belegFehlt?: boolean
    splitAssignments?: Array<{ belegId: string; betrag?: string }>
}

function normalizeAssignments(
    loaded: Record<string, RawLoadedAssignment>
): SlimAssignmentMap {
    return Object.fromEntries(
        Object.entries(loaded)
            .filter(([, value]) =>
                !!value?.belegId ||
                !!value?.bemerkung?.trim() ||
                value?.belegFehlt === true ||
                !!value?.splitAssignments?.length
            )
            .map(([key, value]) => [
                key,
                {
                    belegId: value.belegId || "",
                    bemerkung: value.bemerkung || "",
                    belegFehlt: value.belegFehlt === true,
                    splitAssignments: Array.isArray(value.splitAssignments)
                        ? value.splitAssignments.filter((item) => !!item?.belegId)
                        : [],
                },
            ])
    )
}

export async function loadExistingAssignmentsForImport(
    baseFolder: string,
    fileName: string,
    importId: string
): Promise<SlimAssignmentMap> {
    try {
        const ordner = `${baseFolder}/Bank/Bearbeitet`
        const dateien = await readDir(ordner)

        const jsonDateien = dateien.filter(
            (entry) => !!entry.name && entry.name.toLowerCase().endsWith("-bank-daten.json")
        )

        for (const entry of jsonDateien) {
            const pfad = `${ordner}/${entry.name}`

            try {
                const raw = await invoke<string>("bank_datei_oeffnen", { pfad })
                const parsed = JSON.parse(raw)

                const parsedImportId =
                    parsed && typeof parsed === "object" && typeof parsed.importId === "string"
                        ? parsed.importId
                        : ""

                const parsedFileName =
                    parsed && typeof parsed === "object" && typeof parsed.fileName === "string"
                        ? parsed.fileName
                        : ""

                const gleicheImportId = parsedImportId === importId
                const gleicherDateiname =
                    parsedFileName.trim().toLowerCase() === fileName.trim().toLowerCase()

                if (!gleicheImportId && !gleicherDateiname) {
                    continue
                }

                if (parsed && typeof parsed === "object" && parsed.assignments) {
                    return normalizeAssignments(
                        parsed.assignments as Record<string, RawLoadedAssignment>
                    )
                }
            } catch {
                // nächste Datei prüfen
            }
        }

        return {}
    } catch {
        return {}
    }
}
