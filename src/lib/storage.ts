// src/lib/storage.ts

import { invoke } from "@tauri-apps/api/core";
import type { Jahresdatei } from "./jahresdatei";
import type { Beleg as AltBeleg, FewoName } from "./belege";

export function createLeereJahresdatei(): Jahresdatei {
    const now = new Date().toISOString();

    return {
        jahr: 2025,
        version: 1,
        createdAt: now,
        updatedAt: now,

        fewos: [
            { id: "tina", name: "Tina", objektNr: "264810" },
            { id: "harmony", name: "Harmony", objektNr: "264817" },
            { id: "tinchen", name: "Tinchen", objektNr: "264816" },
        ],

        belege: [],
        erloese: [],
        bankbuchungen: [],
    };
}

export function createLeereJahresdateiJson(): string {
    return JSON.stringify(createLeereJahresdatei(), null, 2);
}

export function parseJahresdatei(jsonText: string): Jahresdatei {
    return JSON.parse(jsonText) as Jahresdatei;
}

export async function speichereJahresdatei(
    baseFolder: string,
    year: string,
    data: Jahresdatei
): Promise<void> {
    await invoke("jahresdatei_speichern", {
        baseFolder,
        year,
        json: JSON.stringify(data, null, 2),
    });
}

export async function ladeJahresdatei(
    baseFolder: string,
    year: string
): Promise<Jahresdatei> {
    const json = await invoke<string>("jahresdatei_laden", {
        baseFolder,
        year,
    });

    return parseJahresdatei(json);
}

function mapFewoNameToId(fewoName: FewoName): "tina" | "harmony" | "tinchen" {
    if (fewoName === "Tina") return "tina";
    if (fewoName === "Harmony") return "harmony";
    return "tinchen";
}

function mapFewoNameToObjektNr(fewoName: FewoName): string {
    if (fewoName === "Tina") return "264810";
    if (fewoName === "Harmony") return "264817";
    return "264816";
}

export function mapAltBelegZuJahresdateiBeleg(
    beleg: AltBeleg
): Jahresdatei["belege"][number] {
    const mapped = {
        id: beleg.id,
        datum: beleg.datum,
        typ: "ausgabe",
        fewoId: beleg.fewoId || mapFewoNameToId(beleg.fewo),
        objektNr:
            typeof beleg.objektNr === "string"
                ? beleg.objektNr
                : mapFewoNameToObjektNr(beleg.fewo),
        lieferant: beleg.lieferant,
        beschreibung: beleg.notiz || beleg.lieferant,
        betrag: Number(String(beleg.betrag).replace(",", ".")) || 0,
        waehrung: "EUR",
        konto: beleg.konto || beleg.kategorie || "Sonstiges",
        dateiName: beleg.dateiname,
        pfad: beleg.pfad || "",
        notiz: beleg.notiz || "",
        zahlungsart: beleg.zahlungsart || "offen",
        manuellesZahldatum: beleg.manuellesZahldatum || "",
        bankbuchungIds: [],

        jahr: beleg.jahr,
        fewo: beleg.fewo,
        dateiname: beleg.dateiname,
        kategorie: beleg.kategorie || beleg.konto || "",
        rechnungsnummer: beleg.rechnungsnummer || "",
        erstelltAm: beleg.erstelltAm || new Date().toISOString(),
        status: beleg.status || "eingang",
        betragNetto: beleg.betragNetto || "",

        splitMode: beleg.splitMode || false,
        splitTina: beleg.splitTina || "",
        splitHarmony: beleg.splitHarmony || "",
        splitTinchen: beleg.splitTinchen || "",
        splitRS: beleg.splitRS || "",
        splitPrivat: beleg.splitPrivat || "",
    } as Jahresdatei["belege"][number];

    return mapped;
}

export async function fuegeBelegZuJahresdateiHinzu(
    baseFolder: string,
    year: string,
    beleg: AltBeleg
): Promise<void> {
    const data = await ladeJahresdatei(baseFolder, year);

    data.belege.push(mapAltBelegZuJahresdateiBeleg(beleg));
    data.updatedAt = new Date().toISOString();

    await speichereJahresdatei(baseFolder, year, data);
}