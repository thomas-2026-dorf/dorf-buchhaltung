import type { Beleg, FewoName } from "../../lib/belege";
import type { Ausgangsrechnung } from "../../lib/ausgangsrechnungen";

export const AUSWERTUNG_FEWOS: FewoName[] = [
    "Tina",
    "Harmony",
    "Tinchen",
    "RS",
    "Privat",
];

export type FewoAuswertung = {
    fewo: FewoName;
    erloese: number;
    ausgaben: number;
    saldo: number;
};

export function parseEuroString(value: string | undefined): number {
    if (!value) return 0;

    const normalized = value
        .replace(/\./g, "")
        .replace(",", ".")
        .replace(/[^\d.-]/g, "");

    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : 0;
}

function summeErloeseFuerFewo(
    belege: Beleg[],
    fewo: FewoName
): number {
    return belege
        .filter((beleg) => beleg.fewo === fewo && beleg.status === "ausgang")
        .reduce((summe, beleg) => summe + parseEuroString(beleg.betrag), 0);
}
export function getBelegAnteilFuerFewo(beleg: Beleg, fewo: FewoName): number {
    if (beleg.status !== "eingang") return 0;

    if (beleg.splitMode) {
        if (fewo === "Tina") return toBruttoMit19(beleg.splitTina);
        if (fewo === "Harmony") return toBruttoMit19(beleg.splitHarmony);
        if (fewo === "Tinchen") return toBruttoMit19(beleg.splitTinchen);
        if (fewo === "RS") return toBruttoMit19(beleg.splitRS);
        if (fewo === "Privat") return toBruttoMit19(beleg.splitPrivat);
        return 0;
    }

    return beleg.fewo === fewo ? parseEuroString(beleg.betrag) : 0;
}

function summeAusgabenFuerFewo(belege: Beleg[], fewo: FewoName): number {
    return belege.reduce((summe, beleg) => {
        return summe + getBelegAnteilFuerFewo(beleg, fewo);
    }, 0);
}

export function berechneFewoAuswertungen(
    _ausgangsrechnungen: Ausgangsrechnung[],
    belege: Beleg[],
): FewoAuswertung[] {

    return AUSWERTUNG_FEWOS.map((fewo) => {
        const erloese = summeErloeseFuerFewo(belege, fewo);
        const ausgaben = summeAusgabenFuerFewo(belege, fewo);

        return {
            fewo,
            erloese,
            ausgaben,
            saldo: erloese - ausgaben,
        };
    });
}

export function formatEuro(value: number): string {
    return value.toLocaleString("de-DE", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
}

function toBruttoMit19(value: string | undefined): number {
    const netto = parseEuroString(value);
    const brutto = netto * 1.19;
    return Math.round(brutto * 100) / 100;
}