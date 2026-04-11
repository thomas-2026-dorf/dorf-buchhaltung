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
    kontoSuffix: string;
};

const STANDARD_EINHEITEN: EinheitInfo[] = [
    {
        id: "tina",
        name: "Tina",
        anzeigename: "Dorf",
        typ: "fewo",
        aktiv: true,
        steuerExport: true,
        kontoSuffix: "01",
    },
    {
        id: "harmony",
        name: "Harmony",
        anzeigename: "Veranstaltungen",
        typ: "fewo",
        aktiv: true,
        steuerExport: true,
        kontoSuffix: "02",
    },
    {
        id: "tinchen",
        name: "Tinchen",
        anzeigename: "Kasse",
        typ: "fewo",
        aktiv: true,
        steuerExport: true,
        kontoSuffix: "03",
    },
    {
        id: "rs",
        name: "RS",
        anzeigename: "Vermietung RS",
        typ: "sonstige",
        aktiv: true,
        steuerExport: true,
        kontoSuffix: "04",
    },
    {
        id: "privat",
        name: "Privat",
        anzeigename: "Privat",
        typ: "privat",
        aktiv: true,
        steuerExport: true,
        kontoSuffix: "05",
    },
    {
        id: "privat_ohne",
        name: "Privat (Keine Übergabe)",
        anzeigename: "Privat (Keine Übergabe)",
        typ: "privat",
        aktiv: true,
        steuerExport: false,
        kontoSuffix: "99",
    },
];

function mapSettingsTyp(typ: string | undefined): EinheitTyp {
    if (typ === "privat") return "privat";
    if (typ === "sonstige") return "sonstige";
    return "fewo";
}

export function getStandardEinheiten(): EinheitInfo[] {
    return STANDARD_EINHEITEN;
}

export function getEinheiten(appSettings?: AppSettings | null): EinheitInfo[] {
    const settingsEinheiten = appSettings?.einheiten;

    if (!settingsEinheiten || settingsEinheiten.length === 0) {
        return STANDARD_EINHEITEN;
    }

    const mappedFromSettings: EinheitInfo[] = settingsEinheiten.map((einheit) => {
        const standard = STANDARD_EINHEITEN.find((item) => item.id === einheit.id);

        return {
            id: einheit.id as EinheitId,
            name: einheit.name,
            anzeigename: standard?.anzeigename ?? einheit.name,
            typ: mapSettingsTyp(einheit.typ),
            aktiv: einheit.aktiv,
            steuerExport: standard?.steuerExport ?? true,
            kontoSuffix: einheit.kontoSuffix ?? standard?.kontoSuffix ?? "00",
        };
    });

    const fehlendeStandardEinheiten = STANDARD_EINHEITEN.filter(
        (standard) => !mappedFromSettings.some((item) => item.id === standard.id)
    );

    return [...mappedFromSettings, ...fehlendeStandardEinheiten];
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
    return getEinheitById(id, appSettings)?.name ?? id;
}

export function getEinheitAnzeigename(
    id: string,
    appSettings?: AppSettings | null
): string {
    return getEinheitById(id, appSettings)?.anzeigename ?? id;
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