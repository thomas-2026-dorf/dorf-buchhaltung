import type { LoadedBankJsonFile } from "./bankJsonLoader";

export function collectBankBelegIds(jsonFiles: LoadedBankJsonFile[]): Set<string> {
  const bankBelegIds = new Set<string>();

  for (const jsonFile of jsonFiles) {
    const file = jsonFile.data;

    const assignments =
      file &&
      typeof file === "object" &&
      file.assignments &&
      typeof file.assignments === "object"
        ? file.assignments
        : {};

    for (const assignment of Object.values(assignments)) {
      if (!assignment || typeof assignment !== "object") continue;

      if ("belegId" in assignment && typeof assignment.belegId === "string") {
        const belegId = assignment.belegId.trim();
        if (belegId) {
          bankBelegIds.add(belegId);
        }
      }

      if (
        "splitAssignments" in assignment &&
        Array.isArray(assignment.splitAssignments)
      ) {
        for (const splitAssignment of assignment.splitAssignments) {
          if (!splitAssignment || typeof splitAssignment !== "object") continue;

          if (
            "belegId" in splitAssignment &&
            typeof splitAssignment.belegId === "string"
          ) {
            const splitBelegId = splitAssignment.belegId.trim();
            if (splitBelegId) {
              bankBelegIds.add(splitBelegId);
            }
          }
        }
      }
    }
  }

  return bankBelegIds;
}
