import Tesseract from "tesseract.js";
import {
  normalizeText,
  bereinigeLieferant,
  formatDatumDeutsch,
} from "./belegErkennungHelpers";

export type BelegErkennungErgebnis = {
  lieferant: string;
  datum: string;
  betrag: string;
  rechnungsnummer: string;
};

export async function runOcrOnCanvas(canvas: HTMLCanvasElement) {
  try {
    const result = await Tesseract.recognize(canvas, "deu", {
      logger: (m) => console.log("OCR:", m),
    });

    const text = result.data.text;
    console.log("OCR Text:", text);

    return text;
  } catch (error) {
    console.error("OCR Fehler:", error);
    return "";
  }
}

function findeDatum(text: string): string {
  const patterns = [
    /Rechnungsdatum[:\s]*([0-9]{2}[./-][0-9]{2}[./-][0-9]{4})/i,
    /Datum[:\s]*([0-9]{2}[./-][0-9]{2}[./-][0-9]{4})/i,
    /\b([0-9]{2}[./-][0-9]{2}[./-][0-9]{4})\b/i,
    /([0-9]{1,2}\.?\s*(?:januar|februar|märz|maerz|april|mai|juni|juli|august|september|oktober|november|dezember)\s*[0-9]{4})/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return match[1].replace(/\s+/g, " ").trim();
  }

  return "";
}

function findeBetrag(text: string): string {
  const rechnungsbetragBlock = text.match(/Rechnungsbetrag[\s\S]{0,120}/i);

  if (rechnungsbetragBlock) {
    const bereinigt = rechnungsbetragBlock[0].replace(
      /\b\d{2}\.\d{2}\.\d{4}\b/g,
      ""
    );

    const werte = [
      ...bereinigt.matchAll(/\b(\d{1,4}(?:[.,]\d{3})*(?:[.,]\d{2}))\b/g),
    ];
    if (werte.length > 0) {
      const groessterWert = werte
        .map((m) => m[1] ?? "")
        .map((wert) => ({
          original: wert,
          zahl: Number(wert.replace(/\./g, "").replace(",", ".")),
        }))
        .filter((eintrag) => !Number.isNaN(eintrag.zahl))
        .sort((a, b) => b.zahl - a.zahl)[0];

      if (groessterWert) {
        return groessterWert.original.replace(".", ",");
      }
    }
  }

  const matches = [
    ...text.matchAll(/\b(\d{1,4}(?:[.,]\d{3})*(?:[.,]\d{2}))\b/g),
  ];
  if (matches.length === 0) return "";

  const betraege = matches
    .map((m) => m[1] ?? "")
    .map((wert) => ({
      original: wert,
      zahl: Number(wert.replace(/\./g, "").replace(",", ".")),
    }))
    .filter((eintrag) => !Number.isNaN(eintrag.zahl));

  if (betraege.length === 0) return "";

  const groesster = betraege.sort((a, b) => b.zahl - a.zahl)[0];
  return groesster.original.replace(".", ",");
}

function findeRechnungsnummer(text: string): string {
  const patterns = [
    /KSR\s*([0-9]{4,})/i,
    /Rechnungsnummer[:\s#\-]*([A-Z0-9]+)/i,
    /Rechnungsnr\.?[:\s#\-]*([A-Z0-9\-]+)/i,
    /Rechnungs\-Nr\.?[:\s#\-]*([A-Z0-9\-]+)/i,
    /Rechnung\s*Nr\.?[:\s#\-]*([A-Z0-9\-]+)/i,
    /Rg\.?\s*Nr\.?[:\s#\-]*([A-Z0-9\-]+)/i,
    /Belegnummer[:\s#\-]*([A-Z0-9\-]+)/i,
    /Beleg\-Nr\.?[:\s#\-]*([A-Z0-9\-]+)/i,
    /Invoice\s*(?:No\.?|Nr\.?|Number)?[:\s#\-]*([A-Z0-9\-]+)/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      return match[1].trim();
    }
  }

  return "";
}

function findeLieferant(text: string): string {
  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const obereZeilen = lines.slice(0, 12);

  const ignoreRegex =
    /rechnung|rechnungsnr|rechnungsnummer|kundennummer|kunden-nr|datum|vom|betrag|summe|gesamt|mwst|ust|steuer|bank|iban|bic|telefon|tel\.|fax|e-mail|email|internet|www\.|seite|pos\.|artikel|menge|einzelpreis|gesamtpreis/i;

  const firmenRegex =
    /(g\s*m\s*b\s*h|gmbh|mbh|kg|ug|ag|ohg|e\s*\.?\s*k\s*\.?|gbr|ltd|inc|sohn|handel|technik|optik|bau|service)/i;

  const bereinigt = obereZeilen
    .map((line) => line.replace(/\s{2,}/g, " ").trim())
    .filter((line) => line.length > 2)
    .filter((line) => !ignoreRegex.test(line));

  for (const line of bereinigt) {
    if (firmenRegex.test(line) && line.length < 80) {
      return line;
    }
  }

  for (let i = 0; i < bereinigt.length - 1; i++) {
    const kombiniert = `${bereinigt[i]} ${bereinigt[i + 1]}`
      .replace(/\s{2,}/g, " ")
      .trim();

    if (firmenRegex.test(kombiniert) && kombiniert.length < 80) {
      return kombiniert;
    }
  }

  return "";
}

export function erkenneBelegdaten(pdfText: string): BelegErkennungErgebnis {
  const text = normalizeText(pdfText);

  return {
    lieferant: bereinigeLieferant(findeLieferant(pdfText)),
    datum: formatDatumDeutsch(findeDatum(text)),
    betrag: findeBetrag(text),
    rechnungsnummer: findeRechnungsnummer(text),
  };
}

export function erkenneSecraSplits(text: string) {
  const clean = text.replace(/\s+/g, " ");

  const summeFuerObjekt = (objNr: string) => {
    let summe = 0;

    const teile = clean.split(`Obj. Nr.: ${objNr}`);

    for (let i = 1; i < teile.length; i++) {
      const ausschnitt = teile[i].slice(0, 80);

      const matches = [
        ...ausschnitt.matchAll(/(\d{1,3}(?:\.\d{3})*,\d{2})/g),
      ].map((m) => m[1]);

      if (matches.length >= 2) {
        const nettoString = matches[1];
        const netto = parseFloat(
          nettoString.replace(/\./g, "").replace(",", ".")
        );

        if (!isNaN(netto)) {
          summe += netto;
        }
      }
    }

    return summe;
  };

  const tina = summeFuerObjekt("264810");
  const harmony = summeFuerObjekt("264817");
  const tinchen = summeFuerObjekt("264816");

  return {
    tina: tina.toFixed(2),
    harmony: harmony.toFixed(2),
    tinchen: tinchen.toFixed(2),
  };
}
