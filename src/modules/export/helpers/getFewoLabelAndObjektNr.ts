type FewoLabelData = {
  fewoLabel: string;
  objektNr: string;
};

export function getFewoLabelAndObjektNr(filePath: string): FewoLabelData {
  const lowerPath = filePath.toLowerCase();

  let fewoLabel = "Unbekannt";
  let objektNr = "-";

  if (lowerPath.includes("tina")) {
    fewoLabel = "Tina";
    objektNr = "264810";
  } else if (lowerPath.includes("harmony")) {
    fewoLabel = "Harmony";
    objektNr = "264817";
  } else if (lowerPath.includes("tinchen")) {
    fewoLabel = "Tinchen";
    objektNr = "264816";
  } else if (lowerPath.includes("privat")) {
    fewoLabel = "Privat";
  }

  return {
    fewoLabel,
    objektNr,
  };
}
