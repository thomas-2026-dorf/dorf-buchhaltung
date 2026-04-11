export function normalizeFilename(value: unknown): string {
  if (typeof value === "string") {
    return value;
  }

  if (value == null) {
    return "";
  }

  return "";
}

export function formatZahlungsDatum(value?: string): string {
  if (!value) return "";

  const trimmed = value.trim();
  if (!trimmed) return "";

  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    const [year, month, day] = trimmed.split("-");
    return `${day}.${month}.${year}`;
  }

  return trimmed;
}

export function getZahlungsstempelText(
  beleg?: {
    zahlungsart?: string;
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
