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
