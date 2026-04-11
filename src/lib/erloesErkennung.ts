import type { FewoName } from "./belege";
import {
  normalizeText,
  cleanAmount,
  normalizeDateValue,
  calculateRestzahlungBetrag,
} from "./erloesErkennungHelpers";

export type ErloesErkennungErgebnis = {
  fewo: FewoName | "";
  gastname: string;
  rechnungsnummer: string;
  rechnungsdatum: string;
  gesamtbetrag: string;
  anzahlungBetrag: string;
  anzahlungDatum: string;
  restzahlungBetrag: string;
  restzahlungDatum: string;
};

function findRechnungsdatum(text: string): string {
  const patterns = [
    /rechnungsdatum[:\s]*([0-3]?\d[.\-/][0-1]?\d[.\-/]\d{2,4})/i,
    /rechnung vom[:\s]*([0-3]?\d[.\-/][0-1]?\d[.\-/]\d{2,4})/i,
    /datum[:\s]*([0-3]?\d[.\-/][0-1]?\d[.\-/]\d{2,4})/i,
    /rechnungsdatum[:\s]*(\d{4}[.\-/][0-1]?\d[.\-/][0-3]?\d)/i,
    /rechnung vom[:\s]*(\d{4}[.\-/][0-1]?\d[.\-/][0-3]?\d)/i,
    /datum[:\s]*(\d{4}[.\-/][0-1]?\d[.\-/][0-3]?\d)/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match?.[1]) return match[1].trim();
  }

  const fallbackMatch = text.match(
    /\b([0-3]?\d[.\-/][0-1]?\d[.\-/]\d{2,4}|\d{4}[.\-/][0-1]?\d[.\-/][0-3]?\d)\b/
  );

  if (fallbackMatch?.[1]) {
    return fallbackMatch[1].trim();
  }

  return "";
}

function findRechnungsnummer(text: string): string {
  const patterns = [
    /rechnungsnummer[:\s]*([A-Z0-9\-\/]+)/i,
    /rechnungs[-\s]*nr\.?[:\s]*([A-Z0-9\-\/]+)/i,
    /rechnung[-\s]*nr\.?[:\s]*([A-Z0-9\-\/]+)/i,
    /belegnummer[:\s]*([A-Z0-9\-\/]+)/i,
    /invoice\s*(?:no\.?|number)[:\s]*([A-Z0-9\-\/]+)/i,
    /\bnr\.?[:\s]*([A-Z0-9\-\/]{4,})/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match?.[1]) return match[1].trim();
  }

  const fallbackMatches = text.match(/\b[A-Z]{1,5}[-\/]?\d{3,}\b/g);

  if (fallbackMatches && fallbackMatches.length > 0) {
    return fallbackMatches[0].trim();
  }

  return "";
}

function findGesamtbetrag(text: string): string {
  const patterns = [
    /gesamtbetrag[:\s]*([0-9.\s]+,\d{2})\s*(€|eur)?/i,
    /rechnungsbetrag[:\s]*([0-9.\s]+,\d{2})\s*(€|eur)?/i,
    /endbetrag[:\s]*([0-9.\s]+,\d{2})\s*(€|eur)?/i,
    /zu zahlen[:\s]*([0-9.\s]+,\d{2})\s*(€|eur)?/i,
    /gesamt[:\s]*([0-9.\s]+,\d{2})\s*(€|eur)?/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match?.[1]) return cleanAmount(match[1]);
  }

  const allAmounts = text.match(/\b\d{1,3}(?:\.\d{3})*,\d{2}\b/g);

  if (allAmounts && allAmounts.length > 0) {
    const normalized = allAmounts
      .map((a) => ({
        raw: a,
        value: parseFloat(cleanAmount(a)),
      }))
      .filter((entry) => !isNaN(entry.value) && entry.value >= 10);

    normalized.sort((a, b) => b.value - a.value);

    if (normalized.length > 0) {
      return cleanAmount(normalized[0].raw);
    }
  }

  return "";
}

function findFewo(text: string): FewoName | "" {
  const normalized = text
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const patternsTinchen = [
    "fewo 3 tinchen",
    "ferienwohnung 3 tinchen",
    "tinchen",
  ];

  const patternsHarmony = [
    "fewo 2 harmony",
    "fewo 2 harmonie",
    "ferienwohnung 2 harmony",
    "ferienwohnung 2 harmonie",
    "apartment harmony",
    "harmony apartment",
    "harmony",
    "harmonie",
  ];

  const patternsTina = [
    "fewo 1 tina",
    "ferienwohnung 1 tina",
    "tina",
  ];

  if (patternsTinchen.some((p) => normalized.includes(p))) return "Tinchen";
  if (patternsHarmony.some((p) => normalized.includes(p))) return "Harmony";
  if (patternsTina.some((p) => normalized.includes(p))) return "Tina";

  return "";
}

function findGastname(text: string): string {
  const patterns = [
    /gast(?:name)?[:\s]*([A-ZÄÖÜ][A-Za-zÄÖÜäöüß\s\-]+)(?:\n|$)/i,
    /kunde[:\s]*([A-ZÄÖÜ][A-Za-zÄÖÜäöüß\s\-]+)(?:\n|$)/i,
    /mieter[:\s]*([A-ZÄÖÜ][A-Za-zÄÖÜäöüß\s\-]+)(?:\n|$)/i,
    /name[:\s]*([A-ZÄÖÜ][A-Za-zÄÖÜäöüß\s\-]+)(?:\n|$)/i,
  ];

  const blocked = [
    "rechnung",
    "rechnungsdatum",
    "datum",
    "tina",
    "harmonie",
    "tinchen",
    "fewo",
    "ferienwohnung",
    "apartment",
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    const value = match?.[1]?.trim();

    if (!value) continue;
    if (blocked.includes(value.toLowerCase())) continue;

    return value;
  }

  return "";
}

function findAnzahlungBetrag(text: string): string {
  const patterns = [
    /anzahlung[:\s]*([0-9.\s]+,\d{2})/i,
    /deposit[:\s]*([0-9.\s]+,\d{2})/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match?.[1]) return cleanAmount(match[1]);
  }

  return "";
}

function findAnzahlungDatum(text: string): string {
  const patterns = [
    /anzahlung(?:\s+fällig)?(?:\s+am)?[:\s]*([0-3]?\d[.\-/][0-1]?\d[.\-/]\d{2,4})/i,
    /deposit(?:\s+due)?(?:\s+on)?[:\s]*([0-3]?\d[.\-/][0-1]?\d[.\-/]\d{2,4})/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match?.[1]) {
      return match[1].trim();
    }
  }

  return "";
}

function findRestzahlungDatum(text: string): string {
  const patterns = [
    /restzahlung(?:\s+fällig)?(?:\s+am)?[:\s]*([0-3]?\d[.\-/][0-1]?\d[.\-/]\d{2,4})/i,
    /restbetrag(?:\s+fällig)?(?:\s+am)?[:\s]*([0-3]?\d[.\-/][0-1]?\d[.\-/]\d{2,4})/i,
    /balance(?:\s+due)?(?:\s+on)?[:\s]*([0-3]?\d[.\-/][0-1]?\d[.\-/]\d{2,4})/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match?.[1]) {
      return match[1].trim();
    }
  }

  return "";
}

export function erkenneErloesdaten(text: string): ErloesErkennungErgebnis {
  const normalizedText = normalizeText(text);

  const betragRaw = findGesamtbetrag(normalizedText);
  const betrag = parseFloat(betragRaw);
  const gesamtbetrag = !isNaN(betrag) && betrag > 0 ? betrag.toFixed(2) : "";

  const anzahlungBetrag = findAnzahlungBetrag(normalizedText);
  const restzahlungBetrag = calculateRestzahlungBetrag(
    gesamtbetrag,
    anzahlungBetrag
  );

  const rechnungsnummer = findRechnungsnummer(normalizedText).trim();
  const gastname = findGastname(normalizedText);
  const rechnungsdatum = normalizeDateValue(findRechnungsdatum(normalizedText));
  const anzahlungDatum = normalizeDateValue(findAnzahlungDatum(normalizedText));
  const restzahlungDatum = normalizeDateValue(findRestzahlungDatum(normalizedText));

  return {
    fewo: findFewo(normalizedText),
    gastname,
    rechnungsnummer,
    rechnungsdatum,
    gesamtbetrag,
    anzahlungBetrag,
    anzahlungDatum,
    restzahlungBetrag,
    restzahlungDatum,
  };
}
