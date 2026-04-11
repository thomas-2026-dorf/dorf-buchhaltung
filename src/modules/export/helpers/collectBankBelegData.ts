type BankBelegData = {
  bankBelegIds: Set<string>;
  belegZahlungenMap: Map<string, string[]>;
};

export function collectBankBelegData(bankJsonFiles: any[]): BankBelegData {
  const belegZahlungenMap = new Map<string, string[]>();
  const bankBelegIds = new Set<string>();

  for (const file of bankJsonFiles) {
    const assignments =
      file.assignments && typeof file.assignments === "object"
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

  for (const file of bankJsonFiles) {
    const bookings = Array.isArray(file.bookings) ? file.bookings : [];
    const assignments =
      file.assignments && typeof file.assignments === "object"
        ? file.assignments
        : {};

    for (const booking of bookings) {
      if (!booking || typeof booking !== "object") continue;

      const bookingKey =
        "bookingKey" in booking && typeof booking.bookingKey === "string"
          ? booking.bookingKey
          : "";

      const datum =
        "datum" in booking && typeof booking.datum === "string"
          ? booking.datum
          : "";

      if (!bookingKey || !datum) continue;

      const assignment = assignments[bookingKey];
      const belegId =
        assignment &&
        typeof assignment === "object" &&
        "belegId" in assignment &&
        typeof assignment.belegId === "string"
          ? assignment.belegId
          : "";

      if (!belegId) continue;

      const list = belegZahlungenMap.get(belegId) || [];
      if (!list.includes(datum)) {
        list.push(datum);
      }
      belegZahlungenMap.set(belegId, list);
    }
  }

  return {
    bankBelegIds,
    belegZahlungenMap,
  };
}
