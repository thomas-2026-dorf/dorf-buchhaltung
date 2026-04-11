export function normalizeText(text: string): string {
  return text
    .replace(/\r/g, "\n")
    .replace(/[–—]/g, "-")
    .replace(/€/g, " EUR ")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{2,}/g, "\n")
    .trim();
}

export function cleanAmount(value: string): string {
  const cleaned = value
    .replace(/\s/g, "")
    .replace(/\.(?=\d{3}(?:,|$))/g, "")
    .replace(",", ".")
    .replace(/[^\d.]/g, "")
    .trim();

  const amount = parseFloat(cleaned);

  if (isNaN(amount) || amount < 10) {
    return "";
  }

  return amount.toFixed(2);
}

export function normalizeDateValue(value: string): string {
  const trimmed = value.trim();

  if (!trimmed) return "";

  const isoMatch = trimmed.match(/^(\d{4})[.\-/](\d{1,2})[.\-/](\d{1,2})$/);
  if (isoMatch) {
    const [, year, month, day] = isoMatch;
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }

  const deMatch = trimmed.match(/^(\d{1,2})[.\-/](\d{1,2})[.\-/](\d{2,4})$/);
  if (deMatch) {
    let [, day, month, year] = deMatch;

    if (year.length === 2) {
      year = `20${year}`;
    }

    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }

  return trimmed;
}

export function calculateRestzahlungBetrag(
  gesamtbetrag: string,
  anzahlungBetrag: string
): string {
  const gesamt = parseFloat(gesamtbetrag);
  const anzahlung = parseFloat(anzahlungBetrag);

  if (isNaN(gesamt) || gesamt <= 0) return "";
  if (isNaN(anzahlung) || anzahlung <= 0) return "";

  const rest = gesamt - anzahlung;

  if (rest <= 0) return "";

  return rest.toFixed(2);
}
