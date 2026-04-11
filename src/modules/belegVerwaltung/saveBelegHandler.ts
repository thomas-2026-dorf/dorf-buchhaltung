import { invoke } from "@tauri-apps/api/core";
import {
  getNaechsteBelegId,
  ladeBelegeAusJahresdatei,
  type FewoName,
} from "../../lib/belege";
import { fuegeBelegZuJahresdateiHinzu } from "../../lib/storage";
import { saveLieferantDatevKonto } from "../../lib/settings/localSettings";
import { parseEuro } from "./utils";

function cleanFilenamePart(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "")
    .slice(0, 30);
}

function mapFewoIdToObjektNr(
  fewoId: string
): string {
  if (fewoId === "tina") return "264810";
  if (fewoId === "harmony") return "264817";
  if (fewoId === "tinchen") return "264816";
  return "";
}

function formatEuro(wert: number): string {
  return wert.toFixed(2).replace(".", ",");
}

function normalizeEuroInput(value: unknown): string {
  const parsed = parseEuro(String(value ?? ""));
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return "";
  }
  return formatEuro(parsed);
}

export async function saveBelegHandler({
  baseFolder,
  year,
  selectedFilename,
  lieferant,
  belegDatum,
  betrag,
  splitMode,
  splitTina,
  splitHarmony,
  splitTinchen,
  splitRS,
  splitPrivat,
  kategorie,
  notiz,
  zahlungsart,
  bankkontoId,
  manuellesZahldatum,
  rechnungsnummer,
  lieferantDatevMerken,
  activeFeWo,
  checkUnbearbeitet,
  resetForm,
}: any) {
  if (!selectedFilename) {
    alert("Bitte zuerst einen Beleg auswählen.");
    return;
  }

  if (!lieferant.trim()) {
    alert("Bitte Lieferant eingeben.");
    return;
  }

  if (!belegDatum.trim()) {
    alert("Bitte Datum eingeben.");
    return;
  }

  if (!betrag.trim()) {
    alert("Bitte Betrag eingeben.");
    return;
  }

  if (!baseFolder) {
    alert("Bitte zuerst einen Basisordner wählen.");
    return;
  }

  if (!activeFeWo?.id || !activeFeWo?.name) {
    alert("Bitte zuerst einen Bereich wählen.");
    return;
  }

  if (zahlungsart === "bank" && !bankkontoId) {
    alert("Bitte bei Zahlungsart Bank ein Bankkonto auswählen.");
    return;
  }

  const betragBrutto = parseEuro(betrag);

  const tinaWert = parseEuro(splitTina);
  const harmonyWert = parseEuro(splitHarmony);
  const tinchenWert = parseEuro(splitTinchen);
  const rsWert = parseEuro(splitRS);
  const privatWert = parseEuro(splitPrivat);

  const splitTinaClean = normalizeEuroInput(splitTina);
  const splitHarmonyClean = normalizeEuroInput(splitHarmony);
  const splitTinchenClean = normalizeEuroInput(splitTinchen);
  const splitRSClean = normalizeEuroInput(splitRS);
  const splitPrivatClean = normalizeEuroInput(splitPrivat);

  const splitSummeNetto =
    tinaWert + harmonyWert + tinchenWert + rsWert + privatWert;

  const hasSplitValues =
    splitTinaClean !== "" ||
    splitHarmonyClean !== "" ||
    splitTinchenClean !== "" ||
    splitRSClean !== "" ||
    splitPrivatClean !== "";

  const isSplitActive = Boolean(splitMode) || hasSplitValues;

  if (isSplitActive && splitSummeNetto <= 0) {
    alert("Bitte mindestens einen Netto-Splitbetrag eingeben.");
    return;
  }

  const vorhandeneBelege = await ladeBelegeAusJahresdatei(baseFolder, year);
  const neueId = getNaechsteBelegId(Number(year), vorhandeneBelege);
  const safeLieferant = cleanFilenamePart(lieferant || "beleg");
  const neuerDateiname = `${neueId}_${safeLieferant}.pdf`;

  const istErloesBeleg = kategorie === "8100";
  const status: "ausgang" | "eingang" = istErloesBeleg ? "ausgang" : "eingang";

  const zielFewoName = istErloesBeleg
    ? `Erloese_${activeFeWo.name.replace(/\s+/g, "_")}`
    : activeFeWo.name.replace(/\s+/g, "_");

  const fewoId = String(activeFeWo.id || "");
  const objektNr = mapFewoIdToObjektNr(fewoId);

  const beleg = {
    id: neueId,
    jahr: Number(year),
    fewoId,
    objektNr,
    fewo: activeFeWo.name as FewoName,
    dateiname: neuerDateiname,
    pfad: `Eingang/${zielFewoName}/${neuerDateiname}`,
    lieferant: lieferant.trim(),
    datum: belegDatum,
    betrag: formatEuro(betragBrutto),
    betragNetto: isSplitActive ? formatEuro(splitSummeNetto) : "",
    rechnungsnummer,
    splitMode: isSplitActive,
    splitTina: isSplitActive ? splitTinaClean : "",
    splitHarmony: isSplitActive ? splitHarmonyClean : "",
    splitTinchen: isSplitActive ? splitTinchenClean : "",
    splitRS: isSplitActive ? splitRSClean : "",
    splitPrivat: isSplitActive ? splitPrivatClean : "",
    konto: kategorie,
    zahlungsart,
    bankkontoId: zahlungsart === "bank" ? bankkontoId : "",
    manuellesZahldatum,
    notiz: notiz.trim(),
    status,
    erstelltAm: new Date().toISOString(),
  };

  try {
    await fuegeBelegZuJahresdateiHinzu(baseFolder, year, beleg);

    if (lieferantDatevMerken && lieferant.trim() && kategorie.trim()) {
      saveLieferantDatevKonto(lieferant.trim(), kategorie.trim());
      console.log("DATEV-Konto gemerkt:", lieferant.trim(), kategorie.trim());
    }
  } catch (err) {
    alert("Jahresdatei-Speichern fehlgeschlagen: " + String(err));
    return;
  }

  invoke("move_to_eingang", {
    baseFolder,
    year,
    fewoName: zielFewoName,
    filename: selectedFilename,
    newFilename: neuerDateiname,
  })
    .then(() => {
      const infoText = isSplitActive
        ? `Beleg gespeichert: ${neueId}\nBrutto: ${formatEuro(
            betragBrutto
          )} €\nNetto gesamt (Split): ${formatEuro(splitSummeNetto)} €`
        : `Beleg gespeichert: ${neueId}`;

      alert(infoText);
      checkUnbearbeitet(baseFolder, year);
    })
    .catch((err) => {
      alert("Beleg gespeichert, aber Verschieben fehlgeschlagen: " + String(err));
    });

  resetForm();
}
