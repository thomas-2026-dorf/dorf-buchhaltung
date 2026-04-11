import { formatEuroForStamp } from "./formatHelpers";

type SplitBelegMeta = {
  splitMode?: boolean;
  splitTina?: unknown;
  splitHarmony?: unknown;
  splitTinchen?: unknown;
  splitRS?: unknown;
  splitPrivat?: unknown;
};

export function buildSplitTextLines(belegMeta?: SplitBelegMeta): string[] {
  if (!belegMeta || !belegMeta.splitMode) return [];

  const entries = [
    { label: "Tina", nr: "264810", val: belegMeta.splitTina },
    { label: "Harmony", nr: "264817", val: belegMeta.splitHarmony },
    { label: "Tinchen", nr: "264816", val: belegMeta.splitTinchen },
    { label: "RS", nr: "", val: belegMeta.splitRS },
    { label: "Privat", nr: "", val: belegMeta.splitPrivat },
  ];

  const lines = entries
    .map((entry) => {
      const amount = formatEuroForStamp(entry.val);
      if (!amount) return "";

      const name = entry.nr ? `${entry.label} (${entry.nr})` : entry.label;

      return `${name}: ${amount}`;
    })
    .filter((line): line is string => Boolean(line));

  console.log("APP SPLIT COUNT:", lines.length);
  console.log("APP SPLIT LINES:", lines);

  return lines.length ? ["SPLIT:", ...lines] : [];
}
