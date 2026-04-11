type BelegMeta = {
  id?: string;
  zahlungsart?: string;
  manuellesZahldatum?: string;
};

export function buildZahlungsTextFromData(
  belegMeta: BelegMeta | undefined,
  belegZahlungenMap: Map<string, string[]>
): string {
  if (!belegMeta) return "";

  if (belegMeta.zahlungsart === "offen") {
    return "";
  }

  const bankZahlungsdaten = belegMeta.id
    ? (belegZahlungenMap.get(belegMeta.id) || []).slice(0, 12)
    : [];

  if (bankZahlungsdaten.length > 0) {
    return `${
      bankZahlungsdaten.length === 1 ? "ZAHLUNG" : "ZAHLUNGEN"
    }: ${bankZahlungsdaten.join(" | ")}`;
  }

  return "";
}
