export function normalizeText(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

export function bereinigeLieferant(name: string): string {
  return name
    .replace(/\b(gmbh|mbh|kg|ug|ag|ohg|e\.k\.|e\.k|gbr|ltd|inc)\b/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

export function formatDatumDeutsch(datum: string): string {
  const monate: Record<string, string> = {
    januar: "01",
    februar: "02",
    märz: "03",
    maerz: "03",
    april: "04",
    mai: "05",
    juni: "06",
    juli: "07",
    august: "08",
    september: "09",
    oktober: "10",
    november: "11",
    dezember: "12",
  };

  const cleaned = datum.replace(/\s+/g, " ").trim().toLowerCase();

  const match = cleaned.match(
    /(\d{1,2})\.?\s*(januar|februar|märz|maerz|april|mai|juni|juli|august|september|oktober|november|dezember)\s*(\d{4})/
  );

  if (!match) return datum;

  const tag = match[1].padStart(2, "0");
  const monat = monate[match[2]];
  const jahr = match[3];

  return `${tag}.${monat}.${jahr}`;
}
