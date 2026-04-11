import { invoke } from "@tauri-apps/api/core";
import { ladeJahresdatei } from "./storage";
import type { Beleg as JahresdateiBeleg } from "./jahresdatei";

export const FEWO_OPTIONEN = [
  "Tina",
  "Tinchen",
  "Harmony",
  "RS",
  "Privat",
] as const;

export type FewoName = (typeof FEWO_OPTIONEN)[number] | string;

export type Beleg = {
  id: string;
  jahr: number;
  fewo: FewoName;
  fewoId?: string;
  objektNr?: string;
  dateiname: string;
  pfad?: string;
  lieferant: string;
  datum: string;
  betrag: string;
  rechnungsnummer?: string;
  splitMode?: boolean;
  splitTina?: string;
  splitHarmony?: string;
  splitTinchen?: string;
  splitRS?: string;
  splitPrivat?: string;
  betragNetto?: string;
  konto: string;
  kategorie?: string;
  notiz: string;
  zahlungsart?: "bank" | "bar" | "offen" | "privat";
  bankkontoId?: string;
  manuellesZahldatum?: string;
  status: "unbearbeitet" | "eingang" | "ausgang";
  erstelltAm: string;
  bankbuchungIds?: string[];
};

type JahresdateiBelegMitOptionalenFeldern = JahresdateiBeleg & {
  jahr?: number;
  fewo?: string;
  dateiname?: string;
  rechnungsnummer?: string;
  splitMode?: boolean;
  splitTina?: string;
  splitHarmony?: string;
  splitTinchen?: string;
  splitRS?: string;
  splitPrivat?: string;
  betragNetto?: string;
  kategorie?: string;
  status?: "unbearbeitet" | "eingang" | "ausgang";
  erstelltAm?: string;
  bankbuchungIds?: string[];
  zahlungsart?: "bank" | "bar" | "offen" | "privat";
  bankkontoId?: string;
  manuellesZahldatum?: string;
  pfad?: string;
};

function parseBelegNummer(id?: string): number {
  if (!id) return 0;

  const match = id.match(/^\d{4}-(\d+)$/);
  if (!match) return 0;

  const nummer = Number(match[1]);
  return Number.isFinite(nummer) ? nummer : 0;
}

export function getNaechsteBelegId(
  jahr: number,
  vorhandeneBelege: Array<{ id?: string }>
): string {
  let hoechsteNummer = 0;

  for (const beleg of vorhandeneBelege) {
    const nummer = parseBelegNummer(beleg.id);
    if (nummer > hoechsteNummer) {
      hoechsteNummer = nummer;
    }
  }

  const neueNummer = hoechsteNummer + 1;
  const nummer = String(neueNummer).padStart(4, "0");

  return `${jahr}-${nummer}`;
}

export async function speichereBelegeDatei(
  baseFolder: string,
  year: string,
  belege: Beleg[]
): Promise<void> {
  await invoke("belege_speichern", {
    baseFolder,
    year,
    json: JSON.stringify(belege, null, 2),
  });
}

function mapJahresdateiFewoIdZuFewoName(
  fewoId?: string
): FewoName {
  if (fewoId === "tina") return "Tina";
  if (fewoId === "harmony") return "Harmony";
  if (fewoId === "tinchen") return "Tinchen";
  if (fewoId === "rs") return "RS";
  if (fewoId === "privat") return "Privat";
  return "";
}

function normalizeFewoName(value?: string): FewoName | "" {
  if (value === "Tina") return "Tina";
  if (value === "Tinchen") return "Tinchen";
  if (value === "Harmony") return "Harmony";
  if (value === "RS") return "RS";
  if (value === "Privat") return "Privat";
  if (typeof value === "string" && value.trim()) return value.trim();
  return "";
}

export async function ladeBelegeAusJahresdatei(
  baseFolder: string,
  year: string
): Promise<Beleg[]> {
  const data = await ladeJahresdatei(baseFolder, year);

  return [...data.belege]
    .map((rawBeleg) => {
      const beleg = rawBeleg as JahresdateiBelegMitOptionalenFeldern;

      const fewoAusString = normalizeFewoName(beleg.fewo);

      return {
        id: beleg.id,
        jahr: typeof beleg.jahr === "number" ? beleg.jahr : data.jahr,
        fewo: fewoAusString || mapJahresdateiFewoIdZuFewoName(beleg.fewoId) || "Privat",
        fewoId: beleg.fewoId || "",
        objektNr: beleg.objektNr || "",
        dateiname:
          typeof beleg.dateiname === "string" && beleg.dateiname
            ? beleg.dateiname
            : beleg.dateiName,
        pfad: beleg.pfad || "",
        lieferant: beleg.lieferant,
        datum: beleg.datum,
        betrag:
          typeof beleg.betrag === "number"
            ? String(beleg.betrag).replace(".", ",")
            : String(beleg.betrag ?? "").replace(".", ","),
        rechnungsnummer: beleg.rechnungsnummer || "",
        splitMode: Boolean(beleg.splitMode),
        splitTina: beleg.splitTina || "",
        splitHarmony: beleg.splitHarmony || "",
        splitTinchen: beleg.splitTinchen || "",
        splitRS: beleg.splitRS || "",
        splitPrivat: beleg.splitPrivat || "",
        betragNetto: beleg.betragNetto || "",
        konto: beleg.konto,
        kategorie: beleg.kategorie || beleg.konto,
        notiz: beleg.notiz || "",
        status:
          beleg.status ||
          ((beleg.konto === "8100" ? "ausgang" : "eingang") as Beleg["status"]),
        erstelltAm: beleg.erstelltAm || data.updatedAt,
        bankbuchungIds: Array.isArray(beleg.bankbuchungIds)
          ? beleg.bankbuchungIds
          : [],
        zahlungsart: beleg.zahlungsart || "offen",
        bankkontoId: beleg.bankkontoId || "",
        manuellesZahldatum: beleg.manuellesZahldatum || "",
      } satisfies Beleg;
    })
    .sort((a, b) => b.id.localeCompare(a.id));
}
