import type { AppSettings } from "./appSettings";

export type EinheitId =
    | "tina"
    | "harmony"
    | "tinchen"
    | "rs"
    | "privat"
    | "privat_ohne";

export type EinheitTyp = "fewo" | "sonstige" | "privat";

export type EinheitInfo = {
    id: EinheitId;
    name: string;
    anzeigename: string;
    typ: EinheitTyp;
    aktiv: boolean;
    steuerExport: boolean;
};

const STANDARD_EINHEITEN: EinheitInfo[] = [
    {
        id: "tina",
        name: "Dorfgemeinschaft Loppersum",
        anzeigename: "Dorfgemeinschaft Loppersum",
        typ: "sonstige",
        aktiv: true,
        steuerExport: true,
    },
];

export function getStandardEinheiten(): EinheitInfo[] {
    return STANDARD_EINHEITEN;
}

export function getEinheiten(_appSettings?: AppSettings | null): EinheitInfo[] {
    return STANDARD_EINHEITEN;
}

export function getAktiveEinheiten(
    appSettings?: AppSettings | null
): EinheitInfo[] {
    return getEinheiten(appSettings).filter((einheit) => einheit.aktiv);
}

export function getEinheitById(
    id: string,
    appSettings?: AppSettings | null
): EinheitInfo | undefined {
    return getEinheiten(appSettings).find((einheit) => einheit.id === id);
}

export function getEinheitName(
    id: string,
    appSettings?: AppSettings | null
): string {
    return getEinheitById(id, appSettings)?.name ?? "Dorfgemeinschaft Loppersum";
}

export function getEinheitAnzeigename(
    id: string,
    appSettings?: AppSettings | null
): string {
    return getEinheitById(id, appSettings)?.anzeigename ?? "Dorfgemeinschaft Loppersum";
}

export function isEinheitSteuerExportRelevant(
    id: string,
    appSettings?: AppSettings | null
): boolean {
    return getEinheitById(id, appSettings)?.steuerExport ?? true;
}

export function getFewoAuswahlliste(
    appSettings?: AppSettings | null
): { id: string; name: string }[] {
    return getAktiveEinheiten(appSettings).map((einheit) => ({
        id: einheit.id,
        name: einheit.anzeigename,
    }));
}