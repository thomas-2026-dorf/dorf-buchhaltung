import type { LoadedBankJsonFile } from "./bankJsonLoader";

export function buildBelegZahlungenMap(
  bankJsonFiles: LoadedBankJsonFile[]
): Map<string, string[]> {
  const belegZahlungenMap = new Map<string, string[]>();

  for (const jsonFile of bankJsonFiles) {
    const file = jsonFile.data;
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

      const list = belegZahlungenMap.get(belegId) ?? [];
      if (!list.includes(datum)) {
        list.push(datum);
      }
      belegZahlungenMap.set(belegId, list);
    }
  }

  return belegZahlungenMap;
}
