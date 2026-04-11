export type Einheit = {
    id: string;
    name: string;
    typ?: string;
    aktiv: boolean;
};

export type Konto = {
    id: string;
    nummer: string;
    name: string;
    typ: "erloes" | "aufwand";
};

export type Bankkonto = {
    id: string;
    bezeichnung: string;
    kontonummer: string;
    typ: "bank" | "bar" | "privat";
};

export type AppSettings = {
    appInfo: {
        appType: string;
        appName: string;
    };
    einheiten: Einheit[];
    konten: Konto[];
    bankkonten: Bankkonto[];
};

export const DEFAULT_APP_SETTINGS: AppSettings = {
    appInfo: {
        appType: "fewo",
        appName: "Dorf Buchhaltung",
    },
    einheiten: [
        { id: "tina", name: "Tina", typ: "objekt", aktiv: true },
        { id: "harmony", name: "Harmony", typ: "objekt", aktiv: true },
        { id: "tinchen", name: "Tinchen", typ: "objekt", aktiv: true },
        { id: "rs", name: "RS", typ: "bereich", aktiv: true },
        { id: "privat", name: "Privat", typ: "bereich", aktiv: true },
    ],
    konten: [
        { id: "8100", nummer: "8100", name: "Erlöse", typ: "erloes" },
        {
            id: "6800",
            nummer: "6800",
            name: "Sonstige betriebliche Aufwendungen",
            typ: "aufwand",
        },
        {
            id: "4300",
            nummer: "4300",
            name: "Energie / Internet / Telefon / Alarm",
            typ: "aufwand",
        },
        { id: "4360", nummer: "4360", name: "Versicherung", typ: "aufwand" },
        { id: "4210", nummer: "4210", name: "Miete / Pacht", typ: "aufwand" },
        {
            id: "darlehen",
            nummer: "Darlehen",
            name: "Kredit / Rate",
            typ: "aufwand",
        },
    ],
    bankkonten: [
        {
            id: "bank_1",
            bezeichnung: "Hauptkonto",
            kontonummer: "",
            typ: "bank",
        },
    ],
};
