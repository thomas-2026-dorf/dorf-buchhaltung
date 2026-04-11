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

export function parseEuroValue(value: unknown): number {
  const raw = String(value ?? "").trim();
  if (!raw) return 0;

  const normalized = raw.replace(/\./g, "").replace(",", ".");
  const num = Number(normalized);

  if (!Number.isFinite(num)) return 0;
  return num;
}

export function formatEuroForStamp(value: unknown): string {
  const num = parseEuroValue(value);
  if (num <= 0) return "";

  return (
    num.toLocaleString("de-DE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }) + " €"
  );
}

export function getMonatKeyFromDatum(rawDatum: string): string {
  const trimmed = String(rawDatum ?? "").trim();
  if (!trimmed) return "";

  if (/^\d{2}\.\d{2}\.\d{2}$/.test(trimmed)) {
    const parts = trimmed.split(".");
    return `20${parts[2]}-${parts[1]}`;
  }

  if (/^\d{2}\.\d{2}\.\d{4}$/.test(trimmed)) {
    const parts = trimmed.split(".");
    return `${parts[2]}-${parts[1]}`;
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    const parts = trimmed.split("-");
    return `${parts[0]}-${parts[1]}`;
  }

  return "";
}

export function formatBankAmount(value: number): string {
  if (!Number.isFinite(value)) return "0,00";
  return value.toFixed(2).replace(".", ",");
}

export function formatBelegAmount(value: string): string {
  const num = Number(String(value ?? "0").replace(",", "."));
  if (!Number.isFinite(num)) return "0,00";
  return num.toFixed(2).replace(".", ",");
}
