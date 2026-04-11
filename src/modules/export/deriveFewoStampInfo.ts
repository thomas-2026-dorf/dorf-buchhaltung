export type FewoStampInfo = {
  fewoLabel: string;
  objektNr: string;
};

export function deriveFewoStampInfo(filePath: string): FewoStampInfo {
  const lowerPath = filePath.toLowerCase();

  if (lowerPath.includes("tina")) {
    return {
      fewoLabel: "Tina",
      objektNr: "264810",
    };
  }

  if (lowerPath.includes("harmony")) {
    return {
      fewoLabel: "Harmony",
      objektNr: "264817",
    };
  }

  if (lowerPath.includes("tinchen")) {
    return {
      fewoLabel: "Tinchen",
      objektNr: "264816",
    };
  }

  if (lowerPath.includes("privat")) {
    return {
      fewoLabel: "Privat",
      objektNr: "-",
    };
  }

  return {
    fewoLabel: "Unbekannt",
    objektNr: "-",
  };
}
