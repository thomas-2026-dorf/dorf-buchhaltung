export function normalizeFilename(value: unknown): string {
  if (typeof value === "string") {
    return value;
  }

  if (value == null) {
    return "";
  }

  return "";
}

export function formatZahlungsDatum(value?: string) {
  if (!value) return "";

  const trimmed = value.trim();
  if (!trimmed) return "";

  if (/^\d{2}\.\d{2}\.\d{2}$/.test(trimmed)) return trimmed;
  if (/^\d{2}\.\d{2}\.\d{4}$/.test(trimmed)) {
    return `${trimmed.slice(0, 6)}${trimmed.slice(8, 10)}`;
  }

  const match = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (match) {
    const [, year, month, day] = match;
    return `${day}.${month}.${year.slice(2)}`;
  }

  return trimmed;
}

export function buildZahlungsText(
  beleg?: {
    zahlungsart?: "bank" | "bar" | "offen" | "privat";
    manuellesZahldatum?: string;
    datum?: string;
  }
) {
  if (!beleg) return "";

  if (beleg.zahlungsart === "offen") {
    return "";
  }

  const zahlungsdatum = formatZahlungsDatum(beleg.manuellesZahldatum);

  if (!zahlungsdatum) return "";

  return `ZAHLUNG: ${zahlungsdatum}`;
}
